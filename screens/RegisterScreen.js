// screens/RegisterScreen.js
import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useTheme } from "../utils/theme";
import { validateEmail, validatePassword, validateDisplayName } from "../utils/validation";
import { mapAuthError } from "../utils/format";
import { FirestoreService } from "../services/firestoreService";
import { useTranslation } from "../i18n/I18nProvider";
import {
  ScreenContainer,
  AppText,
  Input,
  PasswordInput,
  Button,
} from "../components/ui";

export default function RegisterScreen() {
  const navigation = useNavigation();
  const auth = getAuth();
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const styles = useMemo(() => createStyles(spacing), [spacing]);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      Alert.alert(t("auth.warning"), err);
      return;
    }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      // görünen ad
      await updateProfile(cred.user, { displayName: fullName.trim() });

      // 🏢 users/{uid} profilini oluştur (kişisel org dahil)
      await FirestoreService.ensureUserProfile(cred.user, { displayName: fullName.trim() });

      Alert.alert(t("auth.welcomeTitle"), t("auth.accountCreated"));
      // dilersen ProfileSetup'a yönlendirebilirsin:
      navigation.replace("ProfileSetup");
      // veya direkt ana sekmelere:
      // navigation.replace("HomeTabs");
    } catch (error) {
      Alert.alert(t("common.error"), mapAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AppText variant="display" style={styles.title}>
            {t("auth.registerTitle")}
          </AppText>
          <AppText variant="body" color="textSecondary" style={styles.subtitle}>
            {t("auth.registerSubtitle")}
          </AppText>

          <Input
            label={t("auth.fullNameLabel")}
            placeholder={t("auth.fullNamePlaceholder")}
            value={fullName}
            onChangeText={setFullName}
            editable={!loading}
            autoCapitalize="words"
          />

          <Input
            label={t("auth.emailLabel")}
            placeholder={t("auth.registerEmailPlaceholder")}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
            editable={!loading}
          />

          <PasswordInput
            label={t("auth.passwordLabel")}
            placeholder={t("auth.registerPasswordPlaceholder")}
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />

          <Button
            title={t("auth.registerSubmit")}
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
            style={styles.submit}
          />

          <Button
            title={t("auth.backToLogin")}
            icon="arrow-back"
            variant="ghost"
            onPress={() => navigation.goBack()}
            disabled={loading}
            style={styles.back}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const createStyles = (spacing) =>
  StyleSheet.create({
    flex: { flex: 1 },
    content: {
      flexGrow: 1,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xl,
      paddingBottom: spacing.xl,
    },
    title: { marginBottom: spacing.sm },
    subtitle: { marginBottom: spacing.xl },
    submit: { marginTop: spacing.sm },
    back: { marginTop: spacing.md, alignSelf: "center" },
  });
