// utils/consent.js
// KVKK m.10 aydınlatma + açık rıza durumunu cihaz bazında tutar.
// Not: rıza metni güncellendiğinde KEY sürümünü artır (v1 -> v2) ki kullanıcılara
// yeniden onay gösterilsin.
import AsyncStorage from "@react-native-async-storage/async-storage";

const CONSENT_KEY = "@privacy_consent_v1";

export async function hasPrivacyConsent() {
  try {
    return (await AsyncStorage.getItem(CONSENT_KEY)) === "1";
  } catch (e) {
    return false; // okunamazsa güvenli taraf: rıza yok say → aydınlatmayı göster
  }
}

export async function setPrivacyConsent(accepted) {
  try {
    await AsyncStorage.setItem(CONSENT_KEY, accepted ? "1" : "0");
  } catch (e) {
    // sessiz geç
  }
}
