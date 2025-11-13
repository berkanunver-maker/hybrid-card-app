// services/authService.js
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { initializeApp, getApps } from "firebase/app";
import { firebaseConfig } from "./firestoreService"; // firestoreService içindeki config'i export etmiştik

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export const AuthService = {
  /**
   * 🔐 E-posta ile giriş yap veya kullanıcı oluştur
   * Eğer kullanıcı yoksa otomatik oluşturur.
   */
  loginOrRegister: async (email, password = "default123") => {
    try {
      // Giriş yapmayı dene
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("✅ Kullanıcı girişi:", userCredential.user.email);
      return userCredential.user;
    } catch (error) {
      // Eğer kullanıcı yoksa, oluştur
      if (error.code === "auth/user-not-found") {
        const newUser = await createUserWithEmailAndPassword(auth, email, password);
        console.log("🆕 Yeni kullanıcı oluşturuldu:", newUser.user.email);
        return newUser.user;
      }
      console.error("❌ Auth error:", error);
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
