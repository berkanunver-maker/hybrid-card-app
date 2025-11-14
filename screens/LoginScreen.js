import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
  OAuthProvider,
} from "firebase/auth";

import SocialButton from "../components/SocialButton";

// Google
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

// Apple
import * as AppleAuthentication from "expo-apple-authentication";
import * as Crypto from "expo-crypto";

// Google için Expo Session
WebBrowser.maybeCompleteAuthSession();

// Google OAuth Client IDs (Environment Variables)
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

export default function LoginScreen() {
  const navigation = useNavigation();
  const auth = getAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  // -------- Email & Password Giriş --------
  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert("Hata", "Lütfen email giriniz");
      return;
    }
    if (!password.trim()) {
      Alert.alert("Hata", "Lütfen şifre giriniz");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      console.log("✅ Giriş başarılı (email)");
      navigation.replace("HomeTabs");
    } catch (error) {
      console.error("❌ Giriş hatası:", error);
      if (error?.code === "auth/user-not-found") {
        Alert.alert(
          "Kullanıcı bulunamadı",
          "Bu email için hesap yok. Lütfen kayıt olun veya Google/Apple ile giriş yapın."
        );
      } else if (error?.code === "auth/invalid-credential") {
        Alert.alert("Hatalı bilgi", "E-posta veya şifre hatalı.");
      } else {
        Alert.alert("Hata", error?.message || "Giriş yapılamadı.");
      }
    } finally {
      setLoading(false);
    }
  };

  // -------- Google Sign-In --------
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    expoClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID || GOOGLE_WEB_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID || GOOGLE_WEB_CLIENT_ID,
    scopes: ["profile", "email"],
  });

  useEffect(() => {
    const signInWithGoogleResponse = async () => {
      if (response?.type !== "success") return;

      setOauthLoading(true);

      try {
        const { authentication, params } = response;
        const idToken = params?.id_token;
        const accessToken = authentication?.accessToken;

        if (!idToken && !accessToken) {
          throw new Error("Google token alınamadı.");
        }

        const credential = GoogleAuthProvider.credential(idToken, accessToken);
        await signInWithCredential(auth, credential);

        console.log("✅ Google giriş tamam");
        navigation.replace("HomeTabs");
      } catch (err) {
        console.error("❌ Google login hata:", err);
        Alert.alert("Google Girişi Hatası", err?.message || "Giriş başarısız.");
      } finally {
        setOauthLoading(false);
      }
    };

    signInWithGoogleResponse();
  }, [response]);

  const handleGoogleLogin = async () => {
    if (!GOOGLE_WEB_CLIENT_ID) {
      Alert.alert(
        "Google Login Yapılandırılmamış",
        "Google ile giriş yapmak için .env dosyasına EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID eklenmelidir.\n\nŞimdilik Email/Password ile giriş yapabilirsiniz."
      );
      return;
    }

    try {
      setOauthLoading(true);
      await promptAsync();
    } catch (err) {
      console.error("❌ Google hata:", err);
      Alert.alert("Hata", "Google ile giriş başlatılamadı.");
      setOauthLoading(false);
    }
  };

  // -------- Apple Sign-In --------
  const handleAppleLogin = async () => {
    if (Platform.OS !== "ios") {
      Alert.alert("Bilgi", "Apple sadece iOS'ta geçerli.");
      return;
    }

    try {
      setOauthLoading(true);

      const rawNonceBytes = await Crypto.getRandomBytesAsync(16);
      const rawNonce = Array.from(rawNonceBytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        rawNonce
      );

      const appleResp = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      const { identityToken } = appleResp || {};
      if (!identityToken) throw new Error("Apple kimlik belirteci alınamadı.");

      const provider = new OAuthProvider("apple.com");
      const credential = provider.credential({
        idToken: identityToken,
        rawNonce,
      });

      await signInWithCredential(auth, credential);

      console.log("✅ Apple giriş tamam");
      navigation.replace("HomeTabs");
    } catch (err) {
      console.error("❌ Apple login hata:", err);
      if (err?.code === "ERR_CANCELED") return;
      Alert.alert("Hata", err?.message || "Apple ile giriş yapılamadı.");
    } finally {
      setOauthLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.content}>
          <Text style={styles.title}>Login via email</Text>
          <Text style={styles.subtitle}>
            The unregistered mailbox will be automatically registered
          </Text>

          {/* Email */}
          <TextInput
            style={styles.input}
            placeholder="Please enter email"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading && !oauthLoading}
          />

          {/* Password */}
          <TextInput
            style={styles.input}
            placeholder="Please enter password"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            editable={!loading && !oauthLoading}
          />

          {/* Login button */}
          <TouchableOpacity
            style={[styles.button, (loading || oauthLoading) && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading || oauthLoading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Next</Text>}
          </TouchableOpacity>

          {/* Forgot Password */}
          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPassword")}
            style={{ marginTop: 14 }}
          >
            <Text style={styles.forgotText}>Forgot your password?</Text>
          </TouchableOpacity>

          {/* 🆕 Kayıt Ol */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Register")}
            style={{ marginTop: 6 }}
          >
            <Text style={styles.signupText}>
              Don’t have an account?{" "}
              <Text style={styles.signupLink}>Create one</Text>
            </Text>
          </TouchableOpacity>

          {/* Social Login */}
          <View style={styles.socialContainer}>
            <Text style={styles.orText}>Or continue with</Text>

            <SocialButton
              iconSet="MaterialCommunityIcons"
              iconName="google"
              label={oauthLoading ? "Signing in..." : "Sign in with Google"}
              color="#DB4437"
              onPress={handleGoogleLogin}
            />

            <SocialButton
              iconSet="FontAwesome"
              iconName="apple"
              label={oauthLoading ? "Signing in..." : "Sign in with Apple"}
              color="#fff"
              onPress={handleAppleLogin}
            />
          </View>

          {/* Test info */}
          <View style={styles.testInfo}>
            <Text style={styles.testInfoText}>💡 Test için:</Text>
            <Text style={styles.testInfoText}>Email: test@test.com</Text>
            <Text style={styles.testInfoText}>Şifre: test123</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 60,
  },

  title: { color: "#fff", fontSize: 28, fontWeight: "600", marginBottom: 8 },

  subtitle: { color: "#999", fontSize: 14, marginBottom: 40 },

  input: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 16,
    color: "#fff",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 16,
  },

  button: {
    backgroundColor: "#7B61FF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
  },

  buttonDisabled: { backgroundColor: "#555" },

  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  forgotText: {
    color: "#7B61FF",
    textAlign: "center",
    fontSize: 14,
    marginBottom: 6,
    marginTop: 6,
  },

  signupText: {
    color: "#999",
    textAlign: "center",
    fontSize: 14,
    marginBottom: 8,
  },

  signupLink: {
    color: "#7B61FF",
    fontWeight: "600",
  },

  socialContainer: { marginTop: 40 },

  orText: {
    textAlign: "center",
    color: "#999",
    fontSize: 13,
    marginBottom: 12,
  },

  testInfo: {
    marginTop: 40,
    padding: 16,
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
  },

  testInfoText: { color: "#999", fontSize: 12, marginBottom: 4 },
});
