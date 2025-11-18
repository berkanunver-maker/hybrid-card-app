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
import { useTranslation } from "react-i18next";
import { validateEmail, validatePassword, validateDisplayName } from "../utils/validation";

export default function RegisterScreen() {
  const navigation = useNavigation();
  const auth = getAuth();
  const { t } = useTranslation();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    // Validate display name
    const nameValidation = validateDisplayName(fullName);
    if (!nameValidation.valid) {
      return nameValidation.error;
    }

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return emailValidation.error;
    }

    // Validate password with security requirements
    const passwordValidation = validatePassword(password, {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumber: true,
      requireSpecialChar: false, // Optional for better UX
    });
    if (!passwordValidation.valid) {
      return passwordValidation.error;
    }

    return null;
  };

  const handleRegister = async () => {
    const err = validate();
    if (err) {
      Alert.alert(t('common.warning'), err);
      return;
    }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      // görünen ad
      await updateProfile(cred.user, { displayName: fullName.trim() });

      Alert.alert(t('common.success'), t('register.signUpButton'));
      // dilersen ProfileSetup'a yönlendirebilirsin:
      navigation.replace("ProfileSetup");
      // veya direkt ana sekmelere:
      // navigation.replace("HomeTabs");
    } catch (error) {
      console.error("❌ Kayıt hatası:", error);
      let msg = t('register.errors.emailInvalid');
      if (error?.code === "auth/email-already-in-use") msg = t('register.errors.emailInUse');
      if (error?.code === "auth/invalid-email") msg = t('register.errors.emailInvalid');
      if (error?.code === "auth/weak-password") msg = t('register.errors.passwordTooShort');
      Alert.alert(t('common.error'), msg);
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
          <Text style={styles.title}>{t('register.title')}</Text>
          <Text style={styles.subtitle}>{t('register.subtitle')}</Text>

          <TextInput
            style={styles.input}
            placeholder={t('register.fullNamePlaceholder')}
            placeholderTextColor="#666"
            value={fullName}
            onChangeText={setFullName}
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder={t('register.emailPlaceholder')}
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
              placeholder={t('register.passwordPlaceholder')}
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
                {showPwd ? t('login.hidePassword') : t('login.showPassword')}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{t('register.signUpButton')}</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ marginTop: 16 }}
          >
            <Text style={styles.backText}>{t('register.backToLogin')}</Text>
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
