// i18n/strings.js — base (ortak) + ekran locale paketleri birleştirilir.
// Ekran-özel çeviriler i18n/locales/*.js içinde; burada merge edilir.
import home from "./locales/home";
import carddetail from "./locales/carddetail";
import camera from "./locales/camera";
import addcontact from "./locales/addcontact";
import activity from "./locales/activity";
import auth from "./locales/auth";
import lists from "./locales/lists";
import search from "./locales/search";
import modals from "./locales/modals";
import tools from "./locales/tools";
import misc from "./locales/misc";
import uinav from "./locales/uinav";
import a11y from "./locales/a11y";

const base = {
  tr: {
    // Ortak
    "common.save": "Kaydet",
    "common.cancel": "İptal",
    "common.dismiss": "Vazgeç",
    "common.delete": "Sil",
    "common.edit": "Düzenle",
    "common.ok": "Tamam",
    "common.add": "Ekle",
    "common.error": "Hata",
    "common.success": "Başarılı",
    "common.retry": "Tekrar Dene",
    "common.share": "Paylaş",
    "common.back": "Geri",
    "common.loading": "Yükleniyor...",
    "common.search": "Ara",
    // Sekmeler
    "tab.home": "Ana Sayfa",
    "tab.profile": "Profil",
    // Tema
    "theme.system": "Sistem",
    "theme.light": "Açık",
    "theme.dark": "Koyu",
    // Profil
    "profile.language": "Dil",
    "profile.appearance": "Görünüm",
    "profile.app": "Uygulama",
    "profile.version": "Sürüm",
    "profile.logout": "Çıkış Yap",
    "profile.logoutConfirm": "Oturumu kapatmak istediğinize emin misiniz?",
    "profile.user": "Kullanıcı",
    "profile.syncPending": "{count} kart senkron bekliyor",
    "profile.syncNow": "Şimdi gönder",
    "profile.syncDone": "{count} kart senkronlandı",
    "profile.syncNone": "Senkronlanacak kart yok veya bağlantı bekleniyor.",
    "profile.logoutError": "Çıkış yapılamadı. Lütfen tekrar deneyin.",
    "profile.company": "Şirket",
  },
  en: {
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.dismiss": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.ok": "OK",
    "common.add": "Add",
    "common.error": "Error",
    "common.success": "Success",
    "common.retry": "Try Again",
    "common.share": "Share",
    "common.back": "Back",
    "common.loading": "Loading...",
    "common.search": "Search",
    "tab.home": "Home",
    "tab.profile": "Profile",
    "theme.system": "System",
    "theme.light": "Light",
    "theme.dark": "Dark",
    "profile.language": "Language",
    "profile.appearance": "Appearance",
    "profile.app": "App",
    "profile.version": "Version",
    "profile.logout": "Log Out",
    "profile.logoutConfirm": "Are you sure you want to sign out?",
    "profile.user": "User",
    "profile.syncPending": "{count} cards waiting to sync",
    "profile.syncNow": "Sync now",
    "profile.syncDone": "{count} cards synced",
    "profile.syncNone": "No cards to sync, or waiting for connection.",
    "profile.logoutError": "Could not sign out. Please try again.",
    "profile.company": "Company",
  },
};

const packs = [home, carddetail, camera, addcontact, activity, auth, lists, search, modals, tools, misc, uinav, a11y];

function build(lang) {
  return packs.reduce(
    (acc, p) => Object.assign(acc, (p && p[lang]) || {}),
    { ...base[lang] }
  );
}

export const strings = { tr: build("tr"), en: build("en") };
