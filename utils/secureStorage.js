// utils/secureStorage.js
// Firebase Auth oturum token'ını cihazda ŞİFRELİ (Android Keystore / iOS Keychain)
// saklamak için AsyncStorage-uyumlu (getItem/setItem/removeItem) bir adaptör.
// Denetim bulgusu #10: token daha önce AsyncStorage'da DÜZ METİN duruyordu.
//
// Savunmacı tasarım: SecureStore her operasyonda try/catch ile sarılır; native modül
// yoksa (uygulama henüz yeniden build edilmediyse) veya herhangi bir hata olursa
// AsyncStorage'a düşer → EN KÖTÜ İHTİMALLE bugünkü davranış (auth asla kırılmaz).
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

// SecureStore değer limiti Android'de ~2048 bayt; güvenli pay ile parçala.
const CHUNK = 1800;

// SecureStore anahtarı yalnızca [A-Za-z0-9._-] kabul eder. Firebase anahtarları
// ':' ve '[' ']' içerir → hex encode ile güvenli anahtara çevir (deterministik).
export function encodeKey(k) {
  let out = "";
  for (let i = 0; i < k.length; i++) {
    out += k.charCodeAt(i).toString(16).padStart(2, "0");
  }
  return "ss_" + out;
}

export function splitChunks(str, size = CHUNK) {
  const parts = [];
  for (let i = 0; i < str.length; i += size) parts.push(str.slice(i, i + size));
  return parts.length ? parts : [""];
}

// iOS'ta token'ın cihaz reboot sonrası ilk kilit açılışından itibaren okunabilmesi için
// AFTER_FIRST_UNLOCK (varsayılan WHEN_UNLOCKED cold-boot'ta null döndürüp logout'a yol açar).
const SET_OPTS = { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK };

async function secureSet(sk, value) {
  const chunks = splitChunks(value);
  // Önce TÜM chunk'ları yaz; `_n` sayacını EN SON yaz. Yarım/kesilen yazım `_n`
  // bırakmaz → secureGet null döner → temiz fallback (bozuk kısmi okuma olmaz).
  for (let i = 0; i < chunks.length; i++) {
    await SecureStore.setItemAsync(`${sk}_${i}`, chunks[i], SET_OPTS);
  }
  const prevRaw = await SecureStore.getItemAsync(`${sk}_n`);
  const prevN = parseInt(String(prevRaw).split(":")[0], 10);
  const prevCount = Number.isFinite(prevN) ? prevN : 0;
  for (let i = chunks.length; i < prevCount; i++) {
    await SecureStore.deleteItemAsync(`${sk}_${i}`).catch(() => {});
  }
  // Markör EN SON ve "count:length" olarak yazılır. Uzunluk damgası, token BÜYÜRKEN
  // (ör. 2→3 chunk) markör yazılmadan kill olursa bayat markörle KESİK ama geçerli
  // görünümlü token dönmesini engeller (okuma uzunluğu tutmazsa null → temiz fallback).
  await SecureStore.setItemAsync(`${sk}_n`, `${chunks.length}:${value.length}`, SET_OPTS);
}

async function secureGet(sk) {
  const nRaw = await SecureStore.getItemAsync(`${sk}_n`);
  if (nRaw == null) return null;
  const [countStr, lenStr] = String(nRaw).split(":");
  const n = parseInt(countStr, 10);
  if (!Number.isFinite(n) || n < 0) return null; // bozuk sayaç → fallback'e düş
  let out = "";
  for (let i = 0; i < n; i++) {
    const c = await SecureStore.getItemAsync(`${sk}_${i}`);
    if (c == null) return null; // eksik parça → bozuk say, fallback'e düş
    out += c;
  }
  // Uzunluk damgası varsa doğrula: tutmuyorsa (bayat markör + yeni chunk'lar) → fallback.
  const expectedLen = parseInt(lenStr, 10);
  if (Number.isFinite(expectedLen) && out.length !== expectedLen) return null;
  return out;
}

async function secureRemove(sk) {
  const nRaw = await SecureStore.getItemAsync(`${sk}_n`).catch(() => null);
  const parsed = parseInt(nRaw, 10);
  const n = Number.isFinite(parsed) && parsed > 0 ? parsed : 16; // NaN ise yetimleri geniş temizle
  await SecureStore.deleteItemAsync(`${sk}_n`).catch(() => {});
  for (let i = 0; i < n; i++) {
    await SecureStore.deleteItemAsync(`${sk}_${i}`).catch(() => {});
  }
}

export const secureStorage = {
  async setItem(key, value) {
    const sk = encodeKey(key);
    try {
      await secureSet(sk, value);
      // Düz-metin AsyncStorage kopyasını YALNIZCA SecureStore'dan geri okunabildiği
      // DOĞRULANIRSA sil. Doğrulanamazsa fallback'i koru → beklenmedik logout olmaz (#2).
      const verify = await secureGet(sk);
      if (verify === value) {
        await AsyncStorage.removeItem(key).catch(() => {});
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch (e) {
      // SecureStore kullanılamıyor → AsyncStorage'a yaz (bugünkü davranış).
      await AsyncStorage.setItem(key, value);
    }
  },
  async getItem(key) {
    const sk = encodeKey(key);
    try {
      const v = await secureGet(sk);
      if (v != null) return v;
    } catch (e) {
      // düş → AsyncStorage
    }
    try {
      return await AsyncStorage.getItem(key);
    } catch (e) {
      return null;
    }
  },
  async removeItem(key) {
    const sk = encodeKey(key);
    try {
      await secureRemove(sk);
    } catch (e) {
      // yoksay
    }
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      // yoksay
    }
  },
};

export default secureStorage;
