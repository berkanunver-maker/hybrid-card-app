// screens/ForgotPasswordScreen.js
import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../utils/theme";
import { mapAuthError } from "../utils/format";
import { useTranslation } from "../i18n/I18nProvider";
import {
  ScreenContainer,
  AppText,
  Input,
  Button,
} from "../components/ui";

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const styles = useMemo(() => createStyles(spacing), [spacing]);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert(t("auth.warning"), t("auth.emailRequired"));
      return;
    }

    setLoading(true);
    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert(
        t("auth.emailSentTitle"),
        t("auth.emailSentMessage"),
        [{ text: t("common.ok"), onPress: () => navigation.goBack() }]
      );
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
          <AppText variant="title" style={styles.title}>
            {t("auth.forgotTitle")}
          </AppText>
          <AppText variant="body" color="textSecondary" style={styles.subtitle}>
            {t("auth.forgotSubtitle")}
          </AppText>

          <Input
            label={t("auth.emailLabel")}
            placeholder={t("auth.forgotEmailPlaceholder")}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          <Button
            title={t("auth.sendResetLink")}
            onPress={handleResetPassword}
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
