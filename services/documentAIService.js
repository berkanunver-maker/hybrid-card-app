import { ApiService } from "./api";
import { FirestoreService } from "./firestoreService";

/**
 * 📄 Document AI Service
 * Kart veya doküman görselini analiz eder (Firebase URL ya da cihazdan alınan görsel)
 */
export const DocumentAIService = {
  /**
   * 🔹 Cihazdan alınan görseli analiz eder (yerel URI)
   */
  analyzeCard: async (imageUri) => {
    try {
      console.log("📄 analyzeCard başlatıldı:", imageUri);

      const result = await ApiService.analyzeCard(imageUri); // → POST /cards/
      console.log("✅ Document AI analyzeCard sonucu:", result);

      console.log(
        "🧾 [DEBUG] analyzeCard response:",
        JSON.stringify(result, null, 2)
      );

      // 🧠 Eğer backend fields dönmediyse, Firestore’dan çek
      if (!result.fields && result.card_id) {
        console.log("ℹ️ Backend fields dönmedi, Firestore'dan çekiliyor...");
        const fullCard = await FirestoreService.getCardById(result.card_id);
        if (fullCard) {
          result.fields = fullCard;
        }
      }

      return result;
    } catch (error) {
      console.error("❌ Document AI analyzeCard error:", error.message);
      return {
        status: "mock",
        qa_score: 0.9,
        summary:
          "Mock response: analyzeCard başarısız, örnek veri döndürüldü.",
      };
    }
  },

  /**
   * 🔹 Firebase URL üzerinden analiz (CameraScreen → Storage sonrası)
   */
  analyzeImageUrl: async ({ image_url }) => {
    try {
      console.log("🧠 Document AI analizi başlatıldı:", image_url);

      const result = await ApiService.analyzeImageUrl(image_url); // → POST /cards/
      console.log("✅ Document AI analyzeImageUrl sonucu:", result);

      console.log(
        "🧾 [DEBUG] analyzeImageUrl full response:",
        JSON.stringify(result, null, 2)
      );

      // 🔍 Eğer backend 'fields' dönmediyse, Firestore’dan tamamla
      if (!result.fields && result.card_id) {
        console.log("ℹ️ Backend fields dönmedi, Firestore'dan detay çekiliyor...");
        const fullCard = await FirestoreService.getCardById(result.card_id);
        if (fullCard) {
          result.fields = fullCard;
        } else {
          console.warn("⚠️ Firestore'da kart detayı bulunamadı:", result.card_id);
        }
      }

      return result;
    } catch (error) {
      console.error("❌ Document AI analyzeImageUrl error:", error.message);
      return {
        status: "mock",
        qa_score: 0.85,
        summary:
          "Mock response: analyzeImageUrl başarısız, örnek veri döndürüldü.",
      };
    }
  },
};

export default DocumentAIService;
