// services/firestoreService.js
import { initializeApp, getApps } from "firebase/app";
import { initializeAuth, getAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  increment,
  limit,
} from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";
import { personalOrgId } from "../utils/org";

// 🔹 Firebase konfigürasyonu (Environment Variables'dan)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// 🔹 Firebase'i başlat
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

// 🔹 Firestore referansı
const db = getFirestore(app);

// 🔹 React Native AsyncStorage persistence
// firebase-js-sdk v12'de `getReactNativePersistence` kaldırıldı (RN için hiçbir
// persistence helper'ı export edilmiyor). Aşağıdaki shim, kaldırılan fonksiyonun
// birebir aynısı: AsyncStorage'ı Firebase'in Persistence arayüzüne sarar.
// initializeAuth bu sınıfı `new` ile örnekler, bu yüzden bir CLASS döndürmeliyiz.
const getReactNativePersistence = (storage) =>
  class {
    static type = "LOCAL";
    type = "LOCAL";
    async _isAvailable() {
      return true;
    }
    _set(key, value) {
      return storage.setItem(key, JSON.stringify(value));
    }
    async _get(key) {
      const json = await storage.getItem(key);
      return json ? JSON.parse(json) : null;
    }
    _remove(key) {
      return storage.removeItem(key);
    }
    _addListener(_key, _listener) {
      // AsyncStorage cross-tab event desteklemez, no-op
    }
    _removeListener(_key, _listener) {
      // no-op
    }
  };

// 🔹 Auth with AsyncStorage persistence
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
  console.log("✅ Firebase Auth with AsyncStorage initialized");
} catch (error) {
  // Auth zaten başlatılmışsa (örn. Fast Refresh) getAuth kullan
  auth = getAuth(app);
  console.log("✅ Firebase Auth already initialized");
}

// 🔹 Analytics
isSupported().then((supported) => {
  if (supported) getAnalytics(app);
});

// 🔹 Koleksiyon referansları
const fairsRef = collection(db, "fairs");
const cardsRef = collection(db, "cards");
const usersRef = collection(db, "users");
const categoriesRef = collection(db, "categories");

// 🔹 Servis metodları
export const FirestoreService = {
  // ========================================
  // 📁 KATEGORİ YÖNETİMİ
  // ========================================

  getUserCategories: async (userId) => {
    try {
      console.log("🔍 getUserCategories çağrıldı, userId:", userId);

      const q = query(
        categoriesRef,
        where("userId", "==", userId)
      );
      const snapshot = await getDocs(q);
      const categories = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      console.log("✅ Kategoriler çekildi:", categories.length);

      for (let category of categories) {
        try {
          const cardsQuery = query(
            cardsRef,
            where("categoryId", "==", category.id),
            where("userId", "==", userId),
            orderBy("createdAt", "desc"),
            limit(1)
          );
          const cardsSnapshot = await getDocs(cardsQuery);
          if (!cardsSnapshot.empty) {
            category.lastCardAddedAt = cardsSnapshot.docs[0].data().createdAt;
          }
        } catch (cardError) {
          console.warn(`⚠️ ${category.name} için kartlar alınamadı:`, cardError.message);
          category.lastCardAddedAt = null;
        }
      }

      categories.sort((a, b) => (a.order || 0) - (b.order || 0));

      console.log("✅ getUserCategories tamamlandı");
      return categories;
    } catch (error) {
      console.error("❌ Firestore getUserCategories error:", error);
      throw error;
    }
  },

  addCategory: async (userId, categoryData) => {
    try {
      console.log("📝 addCategory çağrıldı, userId:", userId);

      if (!userId) {
        throw new Error("userId is required");
      }

      const docRef = await addDoc(categoriesRef, {
        ...categoryData,
        userId,
        ownerId: userId,
        orgId: personalOrgId(userId),
        cardCount: 0,
        createdAt: new Date().toISOString(),
      });

      console.log("✅ Kategori oluşturuldu:", docRef.id);
      return { id: docRef.id, ...categoryData };
    } catch (error) {
      console.error("❌ Firestore addCategory error:", error);
      throw error;
    }
  },

  updateCategory: async (categoryId, data) => {
    try {
      const categoryRef = doc(categoriesRef, categoryId);
      await updateDoc(categoryRef, data);
      return { id: categoryId, ...data };
    } catch (error) {
      console.error("❌ Firestore updateCategory error:", error);
      throw error;
    }
  },

  deleteCategory: async (categoryId, options = {}) => {
    try {
      const { deleteCards = false, moveToFolderId = null } = options;

      console.log("🗑️ deleteCategory çağrıldı:", { categoryId, deleteCards, moveToFolderId });

      // 1. Bu klasördeki tüm kartları bul (kurallar userId eşleşmesi ister)
      const cardsQuery = query(
        cardsRef,
        where("categoryId", "==", categoryId),
        where("userId", "==", auth.currentUser?.uid)
      );
      const cardsSnapshot = await getDocs(cardsQuery);
      const cardCount = cardsSnapshot.docs.length;

      console.log(`📊 Klasörde ${cardCount} kart bulundu`);

      // 2. Kartları işle
      if (deleteCards) {
        // Kartları sil
        console.log("🗑️ Kartlar siliniyor...");
        const deletePromises = cardsSnapshot.docs.map(doc =>
          deleteDoc(doc.ref)
        );
        await Promise.all(deletePromises);
        console.log("✅ Kartlar silindi");
      } else if (moveToFolderId) {
        // Kartları başka klasöre taşı
        console.log(`📁 Kartlar ${moveToFolderId} klasörüne taşınıyor...`);
        const updatePromises = cardsSnapshot.docs.map(doc =>
          updateDoc(doc.ref, { categoryId: moveToFolderId })
        );
        await Promise.all(updatePromises);

        // Hedef klasörün sayısını artır
        if (cardCount > 0) {
          await FirestoreService.incrementCategoryCardCount(
            moveToFolderId,
            cardCount
          );
        }
        console.log("✅ Kartlar taşındı");
      }

      // 3. Klasörü sil
      const categoryRef = doc(categoriesRef, categoryId);
      await deleteDoc(categoryRef);

      console.log("✅ Klasör silindi");
      return categoryId;
    } catch (error) {
      console.error("❌ Firestore deleteCategory error:", error);
      throw error;
    }
  },

  incrementCategoryCardCount: async (categoryId, value = 1) => {
    try {
      const categoryRef = doc(categoriesRef, categoryId);
      await updateDoc(categoryRef, {
        cardCount: increment(value),
      });
    } catch (error) {
      console.error("❌ Firestore incrementCategoryCardCount error:", error);
      throw error;
    }
  },

  createDefaultCategory: async (userId) => {
    try {
      const q = query(
        categoriesRef,
        where("userId", "==", userId),
        where("isDefault", "==", true)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        const docRef = await addDoc(categoriesRef, {
          userId,
          ownerId: userId,
          orgId: personalOrgId(userId),
          name: "Genel",
          icon: "📋",
          color: "#6B7280",
          isDefault: true,
          cardCount: 0,
          order: 0,
          createdAt: new Date().toISOString(),
        });
        return { id: docRef.id, name: "Genel", icon: "📋" };
      }

      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    } catch (error) {
      console.error("❌ Firestore createDefaultCategory error:", error);
      throw error;
    }
  },

  // ========================================
  // 🪪 KART YÖNETİMİ
  // ========================================

  // ✅ PARAMETRELERİN SIRASI DÜZELTİLDİ (categoryId, userId)
  getCardsByCategory: async (categoryId, userId) => {
    try {
      const q = query(
        cardsRef,
        where("categoryId", "==", categoryId),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("❌ Firestore getCardsByCategory error:", error);
      throw error;
    }
  },

  getAllUserCards: async (userId) => {
    try {
      const q = query(
        cardsRef,
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("❌ Firestore getAllUserCards error:", error);
      throw error;
    }
  },

  getRecentCards: async (userId, limitCount = 5) => {
    try {
      const q = query(
        cardsRef,
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("❌ Firestore getRecentCards error:", error);
      throw error;
    }
  },

  getFavoriteCards: async (userId) => {
    try {
      const q = query(
        cardsRef,
        where("userId", "==", userId),
        where("isFavorite", "==", true),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("❌ Firestore getFavoriteCards error:", error);
      throw error;
    }
  },

  searchCards: async (userId, searchTerm) => {
    try {
      const q = query(
        cardsRef,
        where("userId", "==", userId)
      );
      const snapshot = await getDocs(q);
      const allCards = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const lowercaseSearch = searchTerm.toLowerCase();
      return allCards.filter((card) => {
        const searchableText = [
          card.name,
          card.company,
          card.email,
          card.phone,
          card.fields?.name,
          card.fields?.company,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(lowercaseSearch);
      });
    } catch (error) {
      console.error("❌ Firestore searchCards error:", error);
      throw error;
    }
  },

  addCard: async (cardData) => {
    try {
      if (!cardData.userId) {
        throw new Error("userId is required to add a card");
      }

      const docRef = await addDoc(cardsRef, {
        ...cardData,
        // 🏢 Çok-kiracılı temel: her kart bir org'a + bir sahibe ait.
        // userId korunur (geriye dönük okuma + güvenlik kuralları hâlâ userId'ye bakıyor).
        ownerId: cardData.ownerId || cardData.userId,
        orgId: cardData.orgId || personalOrgId(cardData.userId),
        isFavorite: false,
        createdAt: cardData.createdAt || new Date().toISOString(),
      });

      if (cardData.categoryId) {
        await FirestoreService.incrementCategoryCardCount(cardData.categoryId, 1);
      }

      return { id: docRef.id, ...cardData };
    } catch (error) {
      console.error("❌ Firestore addCard error:", error);
      throw error;
    }
  },

  moveCard: async (cardId, oldCategoryId, newCategoryId) => {
    try {
      console.log("📦 moveCard çağrıldı:", { cardId, oldCategoryId, newCategoryId });

      // 1. Kartın categoryId'sini güncelle
      const cardRef = doc(cardsRef, cardId);
      await updateDoc(cardRef, {
        categoryId: newCategoryId,
        movedAt: new Date().toISOString()
      });

      console.log("✅ Kart güncellendi");

      // 2. Eski klasörün sayısını azalt
      if (oldCategoryId) {
        await FirestoreService.incrementCategoryCardCount(oldCategoryId, -1);
        console.log("✅ Eski klasör sayısı azaldı");
      }

      // 3. Yeni klasörün sayısını artır
      await FirestoreService.incrementCategoryCardCount(newCategoryId, 1);
      console.log("✅ Yeni klasör sayısı arttı");

      return { id: cardId, categoryId: newCategoryId };
    } catch (error) {
      console.error("❌ Firestore moveCard error:", error);
      throw error;
    }
  },

  // ========================================
  // 📄 ESKİ FONKSİYONLAR
  // ========================================

  getAllFairs: async () => {
    try {
      const snapshot = await getDocs(fairsRef);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("❌ Firestore getAllFairs error:", error);
      throw error;
    }
  },

  setUserProfile: async (userId, profileData) => {
    try {
      const userRef = doc(usersRef, userId);
      await setDoc(userRef, profileData, { merge: true });
      return { id: userId, ...profileData };
    } catch (error) {
      console.error("❌ Firestore setUserProfile error:", error);
      throw error;
    }
  },

  // 🏢 Tek seferlik backfill: mevcut kart/klasörlere orgId + ownerId damgala.
  // Idempotent + cihaz başına AsyncStorage bayrağıyla korunur. userId ile sorgular
  // (mevcut okumalar hâlâ çalışıyor), eksik alanları batch ile doldurur.
  backfillOrgFields: async (userId) => {
    try {
      if (!userId) return { patched: 0 };
      const flagKey = `@org_backfill_done_${userId}`;
      const done = await AsyncStorage.getItem(flagKey);
      if (done) return { patched: 0, skipped: true };

      const oid = personalOrgId(userId);
      const refs = [cardsRef, categoriesRef];
      let patched = 0;
      let failed = 0;

      // Doküman bazlı (batch değil): tek bozuk kayıt tümünü bloklamasın.
      for (const ref of refs) {
        const snap = await getDocs(query(ref, where("userId", "==", userId)));
        for (const d of snap.docs) {
          const data = d.data();
          if (!data.orgId || !data.ownerId) {
            try {
              await updateDoc(d.ref, {
                orgId: data.orgId || oid,
                ownerId: data.ownerId || userId,
              });
              patched += 1;
            } catch (e) {
              failed += 1; // bu doküman sonraki turda tekrar denenecek
            }
          }
        }
      }

      // Yalnızca her şey başarılıysa bayrağı set et (aksi halde tekrar dene)
      if (failed === 0) await AsyncStorage.setItem(flagKey, "1");
      console.log(`✅ Org backfill: ${patched} damgalandı, ${failed} başarısız`);
      return { patched, failed };
    } catch (error) {
      // Bayrağı set ETME → sonraki açılışta tekrar dener
      console.warn("⚠️ backfillOrgFields:", error?.message);
      return { patched: 0, error: error?.message };
    }
  },

  // 🏢 users/{uid} dokümanını oluştur/güncelle (çok-kiracılı kimlik temeli).
  // Idempotent: girişte/kayıtta güvenle çağrılır. Var olan createdAt korunur.
  // Firestore 'users' kuralı email + displayName ister; ikisini de garanti ederiz.
  ensureUserProfile: async (user, extra = {}) => {
    try {
      if (!user?.uid) return null;
      const uid = user.uid;
      const email = user.email || extra.email || "";
      if (!email) return null; // geçerli email yoksa users kuralı reddeder

      let displayName = (
        extra.displayName ||
        user.displayName ||
        (email.includes("@") ? email.split("@")[0] : "") ||
        "Kullanıcı"
      )
        .toString()
        .trim();
      if (!displayName) displayName = "Kullanıcı";
      if (displayName.length > 100) displayName = displayName.slice(0, 100);

      const userRef = doc(usersRef, uid);
      const snap = await getDoc(userRef);

      const data = {
        email,
        displayName,
        accountType: "personal",
        activeOrgId: personalOrgId(uid),
        updatedAt: new Date().toISOString(),
      };
      if (extra.company !== undefined) data.company = extra.company;
      if (extra.jobTitle !== undefined) data.jobTitle = extra.jobTitle;
      if (!snap.exists()) data.createdAt = new Date().toISOString();

      await setDoc(userRef, data, { merge: true });
      return { id: uid, ...data };
    } catch (error) {
      console.warn("⚠️ ensureUserProfile:", error?.message);
      return null;
    }
  },

  getCardById: async (cardId) => {
    try {
      const cardRef = doc(cardsRef, cardId);
      const docSnap = await getDoc(cardRef);
      return docSnap.exists() ? { id: cardId, ...docSnap.data() } : null;
    } catch (error) {
      console.error("❌ Firestore getCardById error:", error);
      throw error;
    }
  },

  updateCard: async (cardId, data) => {
    try {
      const cardRef = doc(cardsRef, cardId);
      await updateDoc(cardRef, data);
      return { id: cardId, ...data };
    } catch (error) {
      console.error("❌ Firestore updateCard error:", error);
      throw error;
    }
  },

  deleteCard: async (cardId) => {
    try {
      const card = await FirestoreService.getCardById(cardId);

      const cardRef = doc(cardsRef, cardId);
      await deleteDoc(cardRef);

      if (card?.categoryId) {
        await FirestoreService.incrementCategoryCardCount(card.categoryId, -1);
      }

      return cardId;
    } catch (error) {
      console.error("❌ Firestore deleteCard error:", error);
      throw error;
    }
  },
};

export { firebaseConfig, app, db, auth };
export default FirestoreService;
