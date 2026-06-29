import React from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../utils/theme";
import { useTranslation } from "../i18n/I18nProvider";
import { ScreenContainer, AppText, EmptyState, Button } from "../components/ui";

export default function QADetailScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { spacing } = useTheme();

  return (
    <ScreenContainer padded>
      <View style={{ marginTop: spacing.lg }}>
        <AppText variant="title">{t("misc.qaDetailTitle")}</AppText>
      </View>

      <EmptyState
        icon="document-text-outline"
        title={t("misc.qaDetailSoon")}
        description={t("misc.qaDetailSoonDesc")}
      />

      <View style={{ gap: spacing.md, marginTop: spacing.md }}>
        <Button
          title={t("misc.goToResult")}
          icon="arrow-forward"
          onPress={() => navigation.navigate("QAResult")}
        />
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
