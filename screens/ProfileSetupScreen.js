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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import { useTranslation } from "react-i18next";
import { FirestoreService } from "../services/firestoreService";

export default function ProfileSetupScreen() {
  const navigation = useNavigation();
  const auth = getAuth();
  const { t } = useTranslation();

  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    const userId = auth.currentUser?.uid;

    if (!userId) {
      Alert.alert(t('common.error'), t('profileSetup.errors.userNotFound'));
      return;
    }

    try {
      setLoading(true);

      // Profil bilgilerini Firestore'a kaydet
      await FirestoreService.updateUserProfile(userId, {
        displayName: fullName,
        company: company,
        jobTitle: jobTitle,
        profileCompleted: true,
        createdAt: new Date().toISOString(),
      });

      console.log("✅ Profil kaydedildi:", { fullName, company, jobTitle });
      navigation.replace("Main"); // ✅ replace: geri dönmeyi engeller
    } catch (error) {
      console.error("❌ Profil kaydetme hatası:", error);
      Alert.alert(t('common.error'), t('profileSetup.errors.saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigation.replace("Main");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{t('profileSetup.title')}</Text>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipButton}>{t('profileSetup.skip')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>{t('profileSetup.fullNameLabel')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('profileSetup.fullNamePlaceholder')}
          placeholderTextColor="#666"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
        />

        <Text style={styles.label}>{t('profileSetup.companyLabel')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('profileSetup.companyPlaceholder')}
          placeholderTextColor="#666"
          value={company}
          onChangeText={setCompany}
          autoCapitalize="words"
        />

        <Text style={styles.label}>{t('profileSetup.jobTitleLabel')}</Text>
        <TextInput
          style={styles.input}
          placeholder={t('profileSetup.jobTitlePlaceholder')}
          placeholderTextColor="#666"
          value={jobTitle}
          onChangeText={setJobTitle}
          autoCapitalize="words"
        />

        <TouchableOpacity
          style={[
            styles.button,
            (loading || !fullName || !company || !jobTitle) && styles.buttonDisabled,
          ]}
          onPress={handleFinish}
          disabled={loading || !fullName || !company || !jobTitle}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{t('profileSetup.finishButton')}</Text>
          )}
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  skipButton: {
    color: "#7B61FF",
    fontSize: 16,
    fontWeight: "500",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  label: {
    color: "#999",
    fontSize: 14,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 16,
    color: "#fff",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  button: {
    backgroundColor: "#7B61FF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 32,
  },
  buttonDisabled: {
    backgroundColor: "#2A2A2A",
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
