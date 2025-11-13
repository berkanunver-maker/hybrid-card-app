// services/storageService.js
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { app } from "./firestoreService"; // ✅ Firebase app'i buradan al

// ✅ Storage'ı firestoreService'deki app ile başlat
const storage = getStorage(app);

/**
 * 📤 Fotoğraf yükle (Expo uyumlu)
 */
export const uploadFile = async ({ uri, path }) => {
  try {
    console.log("📸 Yükleme başlıyor:", path);
    console.log("📸 URI:", uri);

    // 🔹 URI'den blob oluştur (Expo ortamı için)
    const response = await fetch(uri);
    
    if (!response.ok) {
      throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
    }
    
    const blob = await response.blob();
    console.log("📸 Blob oluşturuldu, boyut:", blob.size);

    // 🔹 Storage referansı oluştur
    const fileRef = ref(storage, path);

    // 🔹 Dosyayı yükle
    console.log("📸 Firebase'e yükleniyor...");
    await uploadBytes(fileRef, blob);

    // 🔹 URL al
    const url = await getDownloadURL(fileRef);
    console.log("✅ Dosya yüklendi:", url);
    return { url };
  } catch (error) {
    console.error("❌ uploadFile error:", error);
    console.error("❌ Error details:", error.message);
    console.error("❌ Error code:", error.code);
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