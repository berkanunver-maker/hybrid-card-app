// services/storageService.js
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { app } from "./firestoreService"; // ✅ Firebase app'i buradan al

// ✅ Storage'ı firestoreService'deki app ile başlat
const storage = getStorage(app);

// File validation constants
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_AUDIO_SIZE = 25 * 1024 * 1024; // 25MB

// ✅ Allowed extensions (daha güvenilir)
const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
const ALLOWED_AUDIO_EXTENSIONS = ['mp3', 'm4a', 'mp4', 'wav', 'ogg', 'mpeg'];

/**
 * 🎵 Dosya uzantısından normalize edilmiş MIME type al
 * Platform bağımsız çalışır (iOS, Android, Web)
 */
const normalizeMimeType = (uri, blobType) => {
  // URI'den extension al
  const extension = uri.split('.').pop()?.toLowerCase();
  
  if (!extension) {
    return blobType; // Fallback to blob type
  }

  // Extension'a göre normalize MIME type döndür
  const mimeTypeMap = {
    // Audio types
    'mp3': 'audio/mpeg',
    'mpeg': 'audio/mpeg',
    'm4a': 'audio/mp4',  // Normalize all m4a variants
    'mp4': 'audio/mp4',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    
    // Image types
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp'
  };

  return mimeTypeMap[extension] || blobType;
};

/**
 * 🔍 Dosya türünü belirle (extension-based)
 */
const getFileType = (uri) => {
  const extension = uri.split('.').pop()?.toLowerCase();
  
  if (ALLOWED_AUDIO_EXTENSIONS.includes(extension)) {
    return 'audio';
  }
  
  if (ALLOWED_IMAGE_EXTENSIONS.includes(extension)) {
    return 'image';
  }
  
  return null;
};

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
  const allowedPrefixes = ['cards/', 'voices/', 'profiles/'];
  if (!allowedPrefixes.some(prefix => path.startsWith(prefix))) {
    throw new Error(`Invalid path: must start with one of ${allowedPrefixes.join(', ')}`);
  }

  return true;
};

/**
 * ✅ Validate file size and extension
 */
const validateFile = (blob, path, uri, normalizedMimeType) => {
  // Extension'dan file type belirle
  const fileType = getFileType(uri);
  
  if (!fileType) {
    const extension = uri.split('.').pop()?.toLowerCase();
    throw new Error(
      `Unsupported file type: .${extension}\n` +
      `Allowed image types: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}\n` +
      `Allowed audio types: ${ALLOWED_AUDIO_EXTENSIONS.join(', ')}`
    );
  }

  // Path ile file type uyumlu mu?
  const isImage = fileType === 'image';
  const isAudio = fileType === 'audio';
  
  if (isImage && !path.startsWith('cards/') && !path.startsWith('profiles/')) {
    throw new Error('Image files must be uploaded to cards/ or profiles/ directories');
  }
  
  if (isAudio && !path.startsWith('voices/')) {
    throw new Error('Audio files must be uploaded to voices/ directory');
  }

  // Validate file size
  const maxSize = isAudio ? MAX_AUDIO_SIZE : MAX_IMAGE_SIZE;
  if (blob.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    const actualSizeMB = (blob.size / (1024 * 1024)).toFixed(2);
    throw new Error(`File too large: ${actualSizeMB}MB. Maximum allowed: ${maxSizeMB}MB`);
  }

  if (__DEV__) {
    console.log(`✅ File validated - Type: ${fileType}, Size: ${(blob.size / 1024).toFixed(2)}KB, MIME: ${normalizedMimeType}`);
  }

  return true;
};

/**
 * 📤 Fotoğraf/Ses dosyası yükle (Expo uyumlu) - with validation
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
    
    // 🎵 MIME type'ı normalize et (platform bağımsız)
    const normalizedMimeType = normalizeMimeType(uri, blob.type);

    if (__DEV__) {
      console.log("📸 Blob oluşturuldu");
      console.log("  - Boyut:", (blob.size / 1024).toFixed(2), "KB");
      console.log("  - Original MIME:", blob.type);
      console.log("  - Normalized MIME:", normalizedMimeType);
    }

    // Validate file
    validateFile(blob, path, uri, normalizedMimeType);

    // 🔹 Storage referansı oluştur
    const fileRef = ref(storage, path);

    // 📋 Metadata ekle
    const metadata = {
      contentType: normalizedMimeType,
      customMetadata: {
        uploadedAt: new Date().toISOString(),
        originalMimeType: blob.type // Debug için orijinal type'ı sakla
      }
    };

    // 🔹 Dosyayı yükle
    if (__DEV__) {
      console.log("📸 Firebase'e yükleniyor...");
    }
    await uploadBytes(fileRef, blob, metadata);

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