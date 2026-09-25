// services/offlineQueueService.js
// Çevrimdışı kart kuyruğu: fotoğraf + (varsa) ses yerelde saklanır, internet
// gelince fotoğraf→AI, ses→yükle+transkript, sonra Firestore'a kaydedilir.
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import { uploadFile } from "./storageService";
import { DocumentAIService } from "./documentAIService";
import voiceService from "./voiceService";
import { FirestoreService } from "./firestoreService";

const QUEUE_KEY = "@offline_card_queue";
const QUEUE_DIR = FileSystem.documentDirectory + "queue/";

async function ensureDir() {
  const info = await FileSystem.getInfoAsync(QUEUE_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(QUEUE_DIR, { intermediates: true });
  }
}

async function persistFile(uri, ext) {
  if (!uri) return null;
  await ensureDir();
  const dest = `${QUEUE_DIR}${Date.now()}_${Math.floor(Math.random() * 1e6)}.${ext}`;
  await FileSystem.copyAsync({ from: uri, to: dest });
  return dest;
}

async function deleteLocal(item) {
  for (const uri of [item.localImage, item.localAudio]) {
    if (uri) {
      try {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      } catch (e) {
        // sessiz geç
      }
    }
  }
}

export async function getQueue() {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

async function saveQueue(q) {
  try {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(q));
  } catch (e) {
    // sessiz geç
  }
}

export async function getPendingCount() {
  const q = await getQueue();
  return q.length;
}

export async function enqueueCard({ userId, imageUri, audioUri, categoryId, categoryName }) {
  const localImage = await persistFile(imageUri, "jpg");
  const localAudio = audioUri ? await persistFile(audioUri, "m4a") : null;
  const item = {
    id: `${Date.now()}_${Math.floor(Math.random() * 1e6)}`,
    userId,
    localImage,
    localAudio,
    categoryId: categoryId || null,
    categoryName: categoryName || null,
    createdAt: new Date().toISOString(),
    retries: 0,
  };
  const q = await getQueue();
  q.push(item);
  await saveQueue(q);
  return item;
}

async function removeItem(id) {
  const q = await getQueue();
  await saveQueue(q.filter((it) => it.id !== id));
}

async function bumpRetry(id) {
  const q = await getQueue();
  const next = q.map((it) =>
    it.id === id ? { ...it, retries: (it.retries || 0) + 1 } : it
  );
  await saveQueue(next);
}

// Tek bir kuyruk öğesini işle (fotoğraf + ses → Firestore)
async function processItem(item) {
  // 1. Görseli yükle
  const upload = await uploadFile({
    uri: item.localImage,
    path: `cards/${item.userId}/${Date.now()}.jpg`,
  });

  // 2. AI analizi
  const result = await DocumentAIService.analyzeImageUrl({ image_url: upload.url });
  // Backend ulaşılamıyorsa mock döner → kaydetme, kuyrukta kalsın
  if (!result || result.status === "mock") {
    throw new Error("AI servisine ulaşılamadı");
  }

  const fields = result.fields || {};

  // 3. Ses notu (varsa)
  let voice_note = null;
  if (item.localAudio) {
    const audioUpload = await uploadFile({
      uri: item.localAudio,
      path: `voices/${item.userId}/${Date.now()}.m4a`,
    });
    const transcript = await voiceService.transcribeAudio(item.localAudio);
    voice_note = {
      text: transcript?.text || transcript?.voice_note?.text || "Ses kaydı",
      // Tokenlı URL yerine Storage path'i saklanır; okuma anında kurallarla çözülür.
      audioPath: audioUpload.path,
      language: transcript?.language || transcript?.voice_note?.language || "tr-tr",
      duration: transcript?.duration || transcript?.voice_note?.duration || 10,
    };
  }

  // 4. Firestore'a kaydet
  const cardData = {
    imageUrl: upload.url,
    cardId: result.card_id || "unknown",
    qaScore: typeof result.qa_score === "number" ? result.qa_score : 0,
    qaStatus: result.qa_status || "unknown",
    status: result.status || "synced",
    createdAt: item.createdAt,
    userId: item.userId,
    ...(item.categoryId && { categoryId: item.categoryId, categoryName: item.categoryName }),
    fields,
    ...fields,
    ...(voice_note && { voice_note }),
  };
  // Kuyruk öğesinin id'sini kart doküman id'si olarak kullan → idempotent (replay'de
  // duplike kart oluşmaz, sayaç yalnızca ilk yazımda artar).
  await FirestoreService.addCardWithId(item.id, cardData);
}

let processing = false;
// Sürekli başarısız (zehirli) öğeyi her yeniden bağlanışta sonsuza dek denemeyi durdur.
const MAX_RETRIES = 5;

export async function processQueue() {
  if (processing) return { processed: 0 };
  processing = true;
  let processed = 0;
  try {
    const q = await getQueue();
    for (const item of q) {
      // Zehirli öğe: MAX_RETRIES aşıldıysa atla (kuyrukta kalır, veri kaybı yok;
      // kullanıcıya bildirim/temizlik ayrı bir iş — bulgu #54).
      if ((item.retries || 0) >= MAX_RETRIES) continue;
      try {
        await processItem(item);
        // Önce kuyruktan kaldır (kalıcı), SONRA yerel dosyaları temizle. Aksi sırada
        // deleteLocal başarılı olup removeItem başarısız olursa kaynak dosya silinir
        // ve öğe bir daha işlenemez (kalıcı takılma).
        await removeItem(item.id);
        await deleteLocal(item);
        processed += 1;
      } catch (e) {
        await bumpRetry(item.id);
        // bu öğeyi sonraki turda tekrar dener
      }
    }
  } finally {
    processing = false;
  }
  return { processed };
}
