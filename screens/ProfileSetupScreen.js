// screens/ProfileSetupScreen.js
import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import { useTheme } from "../utils/theme";
import { FirestoreService } from "../services/firestoreService";
import { useTranslation } from "../i18n/I18nProvider";
import {
  ScreenContainer,
  AppText,
  Input,
  Button,
} from "../components/ui";

export default function ProfileSetupScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const styles = useMemo(() => createStyles(spacing), [spacing]);

  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");

  const handleFinish = async () => {
    // 🏢 Girilen şirket/ünvanı users/{uid} profiline kaydet (önceden atılıyordu)
    const user = getAuth().currentUser;
    if (user) {
      await FirestoreService.ensureUserProfile(user, {
        ...(fullName.trim() && { displayName: fullName.trim() }),
        company: company.trim(),
        jobTitle: jobTitle.trim(),
      });
    }
    navigation.replace("Main"); // ✅ replace: geri dönmeyi engeller
  };

  const handleSkip = () => {
    navigation.replace("Main");
  };

  const isDisabled = !fullName || !company || !jobTitle;

  return (
    <ScreenContainer edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <AppText variant="heading" style={styles.headerTitle}>
            {t("auth.profileSetupTitle")}
          </AppText>
          <Button
            title={t("auth.skip")}
            variant="ghost"
            size="sm"
            fullWidth={false}
            onPress={handleSkip}
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Input
            label={t("auth.fullNameLabel")}
            placeholder={t("auth.fullNameSetupPlaceholder")}
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />

          <Input
            label={t("auth.companyLabel")}
            placeholder={t("auth.companyPlaceholder")}
            value={company}
            onChangeText={setCompany}
            autoCapitalize="words"
          />

          <Input
            label={t("auth.jobTitleLabel")}
            placeholder={t("auth.jobTitlePlaceholder")}
            value={jobTitle}
            onChangeText={setJobTitle}
            autoCapitalize="words"
          />

          <Button
            title={t("auth.complete")}
            onPress={handleFinish}
            disabled={isDisabled}
            style={styles.submit}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const createStyles = (spacing) =>
  StyleSheet.create({
    flex: { flex: 1 },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.md,
      gap: spacing.md,
    },
    headerTitle: { flex: 1 },
    content: {
      flexGrow: 1,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: spacing.xl,
    },
    submit: { marginTop: spacing.lg },
  });
