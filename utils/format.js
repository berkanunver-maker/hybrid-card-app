// utils/format.js — paylaşılan biçimlendirme / yardımcı fonksiyonlar

// Zaman farkını Türkçe okunur metne çevirir
export function getTimeAgo(timestamp) {
  if (!timestamp) return "";
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now - date;
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 1) return "Az önce";
  if (mins < 60) return `${mins} dakika önce`;
  if (hours < 24) return `${hours} saat önce`;
  if (days === 1) return "Dün";
  if (days < 7) return `${days} gün önce`;
  return date.toLocaleDateString("tr-TR");
}

// QA skoruna göre Badge tonu (tek kaynak)
export function getScoreTone(score) {
  const s = Number(score) || 0;
  if (s >= 80) return "success";
  if (s >= 50) return "warning";
  return "danger";
}

// Backend bazen website'i markdown formatında döndürüyor:
//   "[www.x.com](https://www.x.com)"  → temiz görünür metne çevir
export function cleanUrl(url) {
  if (!url || typeof url !== "string") return url;
  const linked = url.match(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/);
  if (linked) return linked[1];
  const bracket = url.match(/\[([^\]]+)\]/);
  if (bracket) return bracket[1];
  return url;
}

// Firebase Auth hata kodlarını Türkçe mesaja çevir
const AUTH_ERROR_TR = {
  "auth/invalid-email": "Geçersiz e-posta adresi.",
  "auth/user-not-found": "Bu e-posta ile bir hesap bulunamadı.",
  "auth/wrong-password": "Şifre hatalı.",
  "auth/invalid-credential": "E-posta veya şifre hatalı.",
  "auth/email-already-in-use": "Bu e-posta zaten kayıtlı.",
  "auth/weak-password": "Şifre çok zayıf (en az 8 karakter).",
  "auth/too-many-requests": "Çok fazla deneme yapıldı. Lütfen biraz sonra tekrar deneyin.",
  "auth/network-request-failed": "İnternet bağlantısı hatası.",
  "auth/missing-password": "Lütfen şifrenizi girin.",
};

export function mapAuthError(error) {
  const code = error?.code || "";
  return AUTH_ERROR_TR[code] || error?.message || "Bir hata oluştu. Lütfen tekrar deneyin.";
}
