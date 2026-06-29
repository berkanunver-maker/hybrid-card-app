// screens/LoginScreen.js
import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useTheme } from "../utils/theme";
import { validateEmail } from "../utils/validation";
import { useTranslation } from "../i18n/I18nProvider";
import {
  ScreenContainer,
  AppText,
  Input,
  PasswordInput,
  Button,
  Icon,
} from "../components/ui";

export default function LoginScreen() {
  const navigation = useNavigation();
  const auth = getAuth();
  const { t } = useTranslation();
  const { colors, spacing, radius } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, spacing, radius),
    [colors, spacing, radius]
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // -------- Email & Password Giriş --------
  const handleLogin = async () => {
    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      Alert.alert(t("common.error"), emailValidation.error);
      return;
    }

    // Validate password is not empty
    if (!password.trim()) {
      Alert.alert(t("common.error"), t("auth.passwordRequired"));
      return;
    }

    if (password.length < 6) {
      Alert.alert(t("common.error"), t("auth.passwordMinLength"));
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigation.replace("Main");
    } catch (error) {
      if (error?.code === "auth/user-not-found") {
        Alert.alert(
          t("auth.userNotFoundTitle"),
          t("auth.userNotFoundMessage")
        );
      } else if (error?.code === "auth/invalid-credential") {
        Alert.alert(t("auth.invalidCredentialTitle"), t("auth.invalidCredentialMessage"));
      } else if (error?.code === "auth/wrong-password") {
        Alert.alert(t("auth.wrongPasswordTitle"), t("auth.wrongPasswordMessage"));
      } else if (error?.code === "auth/too-many-requests") {
        Alert.alert(
          t("auth.tooManyRequestsTitle"),
          t("auth.tooManyRequestsMessage")
        );
      } else {
        Alert.alert(t("common.error"), error?.message || t("auth.loginFailed"));
      }
    } finally {
      setLoading(false);
    }
  };

  // -------- Test Login (Sadece Development) --------
  const handleTestLogin = async () => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, "test@test.com", "test123");
      navigation.replace("Main");
    } catch (error) {
      Alert.alert(
        t("auth.testAccountErrorTitle"),
        t("auth.testAccountErrorMessage")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <AppText variant="display" style={{ marginBottom: spacing.sm }}>
              {t("auth.loginTitle")}
            </AppText>
            <AppText
              variant="body"
              color="textSecondary"
              style={{ marginBottom: spacing.xxxl }}
            >
              {t("auth.loginSubtitle")}
            </AppText>

            {/* Email */}
            <Input
              label={t("auth.emailLabel")}
              placeholder={t("auth.emailPlaceholder")}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!loading}
            />

            {/* Password */}
            <PasswordInput
              label={t("auth.passwordLabel")}
              placeholder={t("auth.passwordPlaceholder")}
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />

            {/* Login button */}
            <Button
              title={t("auth.loginButton")}
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={{ marginTop: spacing.sm }}
            />

            {/* Forgot Password */}
            <Button
              title={t("auth.forgotPasswordButton")}
              variant="ghost"
              size="sm"
              onPress={() => navigation.navigate("ForgotPassword")}
              style={{ marginTop: spacing.lg, alignSelf: "center" }}
              fullWidth={false}
            />

            {/* Kayıt Ol */}
            <View style={styles.signupRow}>
              <AppText variant="body" color="textSecondary">
                {t("auth.noAccountQuestion")}{" "}
              </AppText>
              <Button
                title={t("auth.registerButton")}
                variant="ghost"
                size="sm"
                onPress={() => navigation.navigate("Register")}
                fullWidth={false}
                style={styles.signupBtn}
              />
            </View>

            {/* Divider */}
            {__DEV__ && (
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <AppText
                  variant="caption"
                  color="textMuted"
                  style={{ marginHorizontal: spacing.lg }}
                >
                  {t("auth.or")}
                </AppText>
                <View style={styles.dividerLine} />
              </View>
            )}

            {/* Test Login Button - Only in development */}
            {__DEV__ && (
              <Button
                title={t("auth.testLoginButton")}
                icon="flask-outline"
                variant="secondary"
                onPress={handleTestLogin}
                disabled={loading}
                style={styles.testButton}
              />
            )}

            {/* Test info - Only visible in development mode */}
            {__DEV__ && (
              <View style={styles.testInfo}>
                <View style={styles.testInfoHeader}>
                  <Icon
                    name="bulb-outline"
                    size={16}
                    color={colors.primary}
                  />
                  <AppText
                    variant="label"
                    color="primary"
                    style={{ marginLeft: spacing.sm }}
                  >
                    {t("auth.testInfoTitle")}
                  </AppText>
                </View>
                <AppText
                  variant="caption"
                  color="textSecondary"
                  style={styles.mono}
                >
                  Email: test@test.com
                </AppText>
                <AppText
                  variant="caption"
                  color="textSecondary"
                  style={styles.mono}
                >
                  {t("auth.testInfoPassword")}
                </AppText>
                <AppText
                  variant="caption"
                  color="textMuted"
                  style={{ marginTop: spacing.sm, fontStyle: "italic" }}
                >
                  {t("auth.testInfoNote")}
                </AppText>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const createStyles = (colors, spacing, radius) =>
  StyleSheet.create({
    scroll: {
      flexGrow: 1,
    },
    content: {
      flex: 1,
      paddingHorizontal: spacing.xxl,
      paddingTop: spacing.xxxl,
      paddingBottom: spacing.xxxl,
    },
    signupRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: spacing.md,
    },
    signupBtn: {
      paddingHorizontal: 0,
    },
    divider: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: spacing.xxxl,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    testButton: {
      borderStyle: "dashed",
      borderWidth: 2,
      borderColor: colors.primary,
    },
    testInfo: {
      marginTop: spacing.xxxl,
      padding: spacing.lg,
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    testInfoHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.sm,
    },
    mono: {
      marginBottom: spacing.xs,
      fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    },
  });
