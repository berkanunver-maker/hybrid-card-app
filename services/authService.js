// services/authService.js
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { initializeApp, getApps } from "firebase/app";
import { firebaseConfig } from "./firestoreService"; // firestoreService içindeki config'i export etmiştik

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export const AuthService = {
  /**
   * 🔐 E-posta ile giriş yap
   * @param {string} email - User email
   * @param {string} password - User password (REQUIRED - no default for security)
   */
  login: async (email, password) => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (__DEV__) {
        console.log("✅ Kullanıcı girişi:", userCredential.user.email);
      }
      return userCredential.user;
    } catch (error) {
      console.error("❌ Auth error:", error.code);
      throw error;
    }
  },

  /**
   * 📝 Yeni kullanıcı kaydet
   * @param {string} email - User email
   * @param {string} password - User password (REQUIRED - no default for security)
   */
  register: async (email, password) => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    try {
      const newUser = await createUserWithEmailAndPassword(auth, email, password);
      if (__DEV__) {
        console.log("🆕 Yeni kullanıcı oluşturuldu:", newUser.user.email);
      }
      return newUser.user;
    } catch (error) {
      console.error("❌ Register error:", error.code);
      throw error;
    }
  },

  /**
   * 🚪 Oturumu kapat
   */
  logout: async () => {
    try {
      await signOut(auth);
      console.log("👋 Kullanıcı çıkış yaptı");
    } catch (error) {
      console.error("❌ Logout error:", error);
      throw error;
    }
  },

  /**
   * 👤 Aktif kullanıcıyı döndür
   */
  getCurrentUser: () => {
    return auth.currentUser || null;
  },
};

export default AuthService;
