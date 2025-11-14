// services/storageService.js
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { app } from "./firestoreService"; // ✅ Firebase app'i buradan al

// ✅ Storage'ı firestoreService'deki app ile başlat
const storage = getStorage(app);

// File validation constants
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_AUDIO_SIZE = 25 * 1024 * 1024; // 25MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/m4a', 'audio/wav', 'audio/ogg'];

/**
 * Validate file path to prevent path traversal attacks
 */
const validatePath = (path) => {
  if (!path || typeof path !== 'string') {
    throw new Error('Invalid path: path must be a non-empty string');
  }

  // Prevent path traversal
  if (path.includes('..') || path.includes('//') || path.startsWith('/')) {
    throw new Error('Invalid path: path traversal not allowed');
  }

  // Must start with allowed prefixes
  const allowedPrefixes = ['cards/', 'voice-notes/', 'profiles/'];
  if (!allowedPrefixes.some(prefix => path.startsWith(prefix))) {
    throw new Error(`Invalid path: must start with one of ${allowedPrefixes.join(', ')}`);
  }

  return true;
};

/**
 * Validate file size and type
 */
const validateFile = (blob, path) => {
  const fileType = blob.type.toLowerCase();

  // Determine if this is an image or audio based on path or type
  const isImage = path.startsWith('cards/') || path.startsWith('profiles/') || fileType.startsWith('image/');
  const isAudio = path.startsWith('voice-notes/') || fileType.startsWith('audio/');

  // Validate file type
  if (isImage && !ALLOWED_IMAGE_TYPES.includes(fileType)) {
    throw new Error(`Invalid image type: ${fileType}. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`);
  }

  if (isAudio && !ALLOWED_AUDIO_TYPES.includes(fileType)) {
    throw new Error(`Invalid audio type: ${fileType}. Allowed types: ${ALLOWED_AUDIO_TYPES.join(', ')}`);
  }

  // Validate file size
  const maxSize = isAudio ? MAX_AUDIO_SIZE : MAX_IMAGE_SIZE;
  if (blob.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    const actualSizeMB = (blob.size / (1024 * 1024)).toFixed(2);
    throw new Error(`File too large: ${actualSizeMB}MB. Maximum allowed: ${maxSizeMB}MB`);
  }

  return true;
};

/**
 * 📤 Fotoğraf yükle (Expo uyumlu) - with validation
 */
export const uploadFile = async ({ uri, path }) => {
  try {
    if (__DEV__) {
      console.log("📸 Yükleme başlıyor:", path);
      console.log("📸 URI:", uri);
    }

    // Validate path
    validatePath(path);

    // 🔹 URI'den blob oluştur (Expo ortamı için)
    const response = await fetch(uri);

    if (!response.ok) {
      throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();

    if (__DEV__) {
      console.log("📸 Blob oluşturuldu, boyut:", blob.size, "type:", blob.type);
    }

    // Validate file
    validateFile(blob, path);

    // 🔹 Storage referansı oluştur
    const fileRef = ref(storage, path);

    // 🔹 Dosyayı yükle
    if (__DEV__) {
      console.log("📸 Firebase'e yükleniyor...");
    }
    await uploadBytes(fileRef, blob);

    // 🔹 URL al
    const url = await getDownloadURL(fileRef);
    if (__DEV__) {
      console.log("✅ Dosya yüklendi:", url);
    }
    return { url };
  } catch (error) {
    console.error("❌ uploadFile error:", error.message);
    if (__DEV__) {
      console.error("❌ Error details:", error);
    }
    throw error;
  }
};

/**
 * 🔗 Dosya URL'si al
 */
export const getFileUrl = async (path) => {
  try {
    const fileRef = ref(storage, path);
    return await getDownloadURL(fileRef);
  } catch (error) {
    console.error("❌ getFileUrl error:", error);
    throw error;
  }
};

/**
 * 🗑️ Dosya sil
 */
export const deleteFile = async (path) => {
  try {
    const fileRef = ref(storage, path);
    await deleteObject(fileRef);
    console.log("🗑️ Dosya silindi:", path);
    return true;
  } catch (error) {
    console.error("❌ deleteFile error:", error);
    throw error;
  }
};