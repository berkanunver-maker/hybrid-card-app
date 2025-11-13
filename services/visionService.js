// services/visionService.js
import { ApiService } from "./api";

/**
 * 👁️ Vision OCR Service
 * Görseldeki metinleri çıkarır (OCR)
 */
export const VisionService = {
  extractText: async (imageUri) => {
    try {
      // imageUri = file:// veya asset:// gelen yerel dosya yolu
      const result = await ApiService.analyzeVision(imageUri);
      console.log("✅ Vision OCR tamamlandı:", result);
      return result;
    } catch (error) {
      console.error("❌ VisionService extractText error:", error.message);
      // 🔹 Offline mock fallback (fuarda internet kesilirse)
      return {
        status: "mock",
        text: "Mock OCR sonucu: Görsel analiz yapılamadı, örnek veri gösteriliyor.",
      };
    }
  },
};

export default VisionService;
