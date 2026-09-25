// services/accountService.js
// KVKK m.7 / GDPR m.17 — "unutulma / silme hakkı".
// İstemci-taraflı, best-effort hesap + veri silme. Deploy/CF gerektirmez; kullanıcının
// kendi kartlarını, Storage dosyalarını (kart görseli + ses), kategorilerini, profil
// dokümanını ve Firebase Auth hesabını siler. (Şirket-org üyelikleri kurallarca yalnızca
// Cloud Functions'tan yazılabildiğinden istemciden temizlenemez — org özelliği devreye
// girdiğinde bir CF ile tamamlanmalıdır.)
import {
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db, auth } from "./firestoreService";
import { deleteFile } from "./storageService";

// Firebase Storage indirme URL'sinden ("/o/<encoded-path>?...") depolama yolunu çıkarır.
function pathFromDownloadUrl(url) {
  try {
    if (!url || typeof url !== "string" || !url.includes("/o/")) return null;
    const enc = url.split("/o/")[1].split("?")[0];
    return decodeURIComponent(enc);
  } catch (e) {
    return null;
  }
}

async function safe(promiseFactory) {
  try {
    await promiseFactory();
    return true;
  } catch (e) {
    return false; // tek kayıt hatası tüm silmeyi durdurmasın
  }
}

/**
 * Kullanıcının tüm verisini ve hesabını siler.
 * @param {{ password?: string }} opts - deleteUser recent-login istediği için parola ile
 *   yeniden kimlik doğrulama yapılır (e-posta/parola hesapları için).
 * @throws Error(code: 'no-user' | 'reauth-failed' | 'requires-recent-login')
 */
export async function deleteAccountAndData({ password } = {}) {
  const user = auth?.currentUser;
  if (!user) {
    const err = new Error("no-user");
    err.code = "no-user";
    throw err;
  }
  const uid = user.uid;

  // 0) Gerekli: silmeden önce yeniden kimlik doğrula (aksi halde requires-recent-login)
  if (password && user.email) {
    try {
      const cred = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, cred);
    } catch (e) {
      const err = new Error("reauth-failed");
      err.code = e?.code || "reauth-failed";
      throw err;
    }
  }

  // 1) Kartlar + her kartın Storage dosyaları (görsel + ses)
  try {
    const cardsSnap = await getDocs(
      query(collection(db, "cards"), where("userId", "==", uid))
    );
    for (const d of cardsSnap.docs) {
      const data = d.data() || {};
      const imgPath = pathFromDownloadUrl(data.imageUrl);
      if (imgPath) await safe(() => deleteFile(imgPath));
      const audioPath =
        data.voice_note?.audioPath || pathFromDownloadUrl(data.voice_note?.audioUrl);
      if (audioPath) await safe(() => deleteFile(audioPath));
      await safe(() => deleteDoc(d.ref));
    }
  } catch (e) {
    // kartlar okunamadıysa devam et (yine de hesabı silmeyi dene)
  }

  // 2) Kategoriler
  try {
    const catSnap = await getDocs(
      query(collection(db, "categories"), where("userId", "==", uid))
    );
    for (const d of catSnap.docs) {
      await safe(() => deleteDoc(d.ref));
    }
  } catch (e) {
    // yoksay
  }

  // 3) users/{uid} profil dokümanı
  await safe(() => deleteDoc(doc(db, "users", uid)));

  // 4) Firebase Auth hesabı (en son — silinince Firestore izinleri kaybolur)
  try {
    await deleteUser(user);
  } catch (e) {
    if (e?.code === "auth/requires-recent-login") {
      const err = new Error("requires-recent-login");
      err.code = "requires-recent-login";
      throw err;
    }
    throw e;
  }
}
