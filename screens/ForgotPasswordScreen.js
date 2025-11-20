// screens/ForgotPasswordScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert(t('common.warning'), t('forgotPassword.errors.emailRequired'));
      return;
    }

    setLoading(true);
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert(
        t('forgotPassword.success.title'),
        t('forgotPassword.success.message'),
        [{ text: t('forgotPassword.success.button'), onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error("❌ Şifre sıfırlama hatası:", error);
      if (error.code === "auth/user-not-found") {
        Alert.alert(t('common.error'), t('forgotPassword.errors.userNotFound'));
      } else if (error.code === "auth/invalid-email") {
        Alert.alert(t('common.error'), t('forgotPassword.errors.invalidEmail'));
      } else if (error.code === "auth/too-many-requests") {
        Alert.alert(t('common.error'), t('forgotPassword.errors.tooManyRequests'));
      } else if (error.code === "auth/network-request-failed") {
        Alert.alert(t('common.error'), t('forgotPassword.errors.networkError'));
      } else {
        Alert.alert(t('common.error'), t('forgotPassword.errors.genericError'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{t('forgotPassword.title')}</Text>
        <Text style={styles.subtitle}>
          {t('forgotPassword.subtitle')}
        </Text>

        <TextInput
          style={styles.input}
          placeholder={t('forgotPassword.emailPlaceholder')}
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleResetPassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{t('forgotPassword.sendButton')}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginTop: 20 }}
        >
          <Text style={styles.backText}>{t('forgotPassword.backToLogin')}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "600",
    marginBottom: 8,
  },
  subtitle: {
    color: "#999",
    fontSize: 14,
    marginBottom: 30,
  },
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
  buttonDisabled: {
    backgroundColor: "#555",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  backText: {
    color: "#7B61FF",
    textAlign: "center",
    fontSize: 14,
  },
});
