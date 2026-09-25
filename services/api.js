// services/api.js
import { getIdToken } from "firebase/auth";
import { auth } from "./firestoreService";

const BASE_URL = "https://hybrid-card-api-145445824075.us-central1.run.app";

/**
 * Aktif kullanıcının Firebase ID token'ını Authorization header'ı olarak döndürür.
 * Backend bu token'ı verifyIdToken ile doğrulayıp anonim çağrıları reddetmelidir
 * (denial-of-wallet / SSRF koruması). Kullanıcı yoksa boş döner → istek anonim gider
 * ve backend tarafından reddedilir (fail-closed hedefi).
 */
async function getAuthHeader() {
  try {
    const user = auth?.currentUser;
    if (!user) return {};
    const token = await getIdToken(user); // geçerliyse cache'ten, süresi geçtiyse yeniler
    return { Authorization: `Bearer ${token}` };
  } catch (error) {
    console.warn("⚠️ [API] ID token alınamadı:", error?.message);
    return {};
  }
}

/**
 * Genel API istek yöneticisi
 */
export async function apiRequest(endpoint, method = "GET", body = null, isFormData = false) {
  const url = `${BASE_URL}/${endpoint}`;
  const authHeader = await getAuthHeader();
  const headers = isFormData
    ? { ...authHeader } // Content-Type'ı fetch otomatik ekler (multipart boundary)
    : { "Content-Type": "application/json", ...authHeader };

  const options = { method, headers };
  if (body) options.body = isFormData ? body : JSON.stringify(body);

  try {
    console.log(`📡 [API] ${method} → ${url}`);
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      // Yanıt gövdesini loglamıyoruz — PII/hassas alan içerebilir (KVKK). Sadece durum.
      console.error(`❌ API error: ${method} ${endpoint} → HTTP ${response.status}`);
      throw new Error(data.detail || "API request failed");
    }

    return data;
  } catch (error) {
    console.error("❌ apiRequest error:", error.message);
    throw error;
  }
}

/**
 * Endpoint fonksiyonları
 */
export const ApiService = {
  // 🔹 Vision (OCR)
  analyzeVision: async (imageUri) => {
    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      name: "image.jpg",
      type: "image/jpeg",
    });
    return apiRequest("vision/", "POST", formData, true);
  },

  // 🔹 Document AI (Dosya upload'lı)
  analyzeCard: async (imageUri) => {
    const formData = new FormData();
    formData.append("file", {
      uri: imageUri,
      name: "document.jpg",
      type: "image/jpeg",
    });
    return apiRequest("cards/", "POST", formData, true);
  },

  // 🔹 Document AI (Firebase URL ile) - ✅ YENİ ENDPOINT
  analyzeImageUrl: async (image_url) => {
    console.log("📨 [API] analyzeImageUrl çağrıldı:", image_url);
    
    // ✅ Yeni endpoint kullan: /cards/analyze-url/
    return apiRequest("cards/analyze-url/", "POST", { image_url });
  },

  // 🔹 Ses Transkripsiyonu
  transcribeAudio: async (audioUri) => {
    const formData = new FormData();
    formData.append("file", {
      uri: audioUri,
      name: "recording.m4a",
      type: "audio/m4a",
    });
    return apiRequest("voice/", "POST", formData, true);
  },

  // 🔹 Genel istekler
  getData: async (endpoint) => apiRequest(endpoint, "GET"),
  postData: async (endpoint, body) => apiRequest(endpoint, "POST", body),
};

export default ApiService;