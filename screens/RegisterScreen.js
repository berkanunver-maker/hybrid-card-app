// screens/RegisterScreen.js
import React, { useState } from "react";
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
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

export default function RegisterScreen() {
  const navigation = useNavigation();
  const auth = getAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!fullName.trim()) return "Lütfen ad soyad giriniz.";
    if (!email.trim()) return "Lütfen e-posta giriniz.";
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return "Geçersiz e-posta.";
    if (password.length < 6) return "Şifre en az 6 karakter olmalı.";
    return null;
  };

  const handleRegister = async () => {
    const err = validate();
    if (err) {
      Alert.alert("Uyarı", err);
      return;
    }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      // görünen ad
      await updateProfile(cred.user, { displayName: fullName.trim() });

      Alert.alert("Hoş geldiniz!", "Hesabınız oluşturuldu.");
      // dilersen ProfileSetup'a yönlendirebilirsin:
      navigation.replace("ProfileSetup");
      // veya direkt ana sekmelere:
      // navigation.replace("HomeTabs");
    } catch (error) {
      console.error("❌ Kayıt hatası:", error);
      let msg = "Kayıt yapılamadı.";
      if (error?.code === "auth/email-already-in-use") msg = "Bu e-posta zaten kayıtlı.";
      if (error?.code === "auth/invalid-email") msg = "Geçersiz e-posta.";
      if (error?.code === "auth/weak-password") msg = "Şifre zayıf.";
      Alert.alert("Hata", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.content}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>
            Aşağıdaki bilgileri doldurarak hızlıca kayıt olabilirsiniz.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ad Soyad"
            placeholderTextColor="#666"
            value={fullName}
            onChangeText={setFullName}
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="E-posta adresi"
            placeholderTextColor="#666"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
            editable={!loading}
          />

          <View style={styles.pwdRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="Şifre (min 6 karakter)"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPwd}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            <TouchableOpacity
              onPress={() => setShowPwd((p) => !p)}
              style={styles.eyeBtn}
              disabled={loading}
            >
              <Text style={{ color: "#7B61FF", fontWeight: "600" }}>
                {showPwd ? "Gizle" : "Göster"}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign up</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginTop: 16 }}
          >
            <Text style={styles.backText}>← Back to Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121212" },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 60 },
  title: { color: "#fff", fontSize: 28, fontWeight: "600", marginBottom: 8 },
  subtitle: { color: "#999", fontSize: 14, marginBottom: 30 },
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
  pwdRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 },
  eyeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#333",
    backgroundColor: "#1E1E1E",
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
  backText: { color: "#7B61FF", textAlign: "center", fontSize: 14 },
});
