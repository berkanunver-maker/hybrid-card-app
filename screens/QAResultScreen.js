import React from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../utils/theme";
import { useTranslation } from "../i18n/I18nProvider";
import { ScreenContainer, AppText, EmptyState, Button } from "../components/ui";

export default function QAResultScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { spacing } = useTheme();

  return (
    <ScreenContainer padded>
      <View style={{ marginTop: spacing.lg }}>
        <AppText variant="title">{t("misc.qaResultTitle")}</AppText>
      </View>

      <EmptyState
        icon="checkmark-done-outline"
        title={t("misc.qaResultSoon")}
        description={t("misc.qaResultSoonDesc")}
      />

      <View style={{ marginTop: spacing.md }}>
        <Button
          title={t("misc.backToHome")}
          icon="home-outline"
          variant="secondary"
          onPress={() => navigation.navigate("Home")}
        />
      </View>
    </ScreenContainer>
  );
}
