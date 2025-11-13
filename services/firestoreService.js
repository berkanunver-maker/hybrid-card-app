// services/firestoreService.js
import { initializeApp, getApps } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
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

// 🔹 Auth with AsyncStorage persistence
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
  console.log("✅ Firebase Auth with AsyncStorage initialized");
} catch (error) {
  // Auth zaten başlatılmışsa getAuth kullan
  const { getAuth } = require("firebase/auth");
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

      // 1. Bu klasördeki tüm kartları bul
      const cardsQuery = query(
        cardsRef,
        where("categoryId", "==", categoryId)
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
