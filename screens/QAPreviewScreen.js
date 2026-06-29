import React from "react";
import { View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../utils/theme";
import { useTranslation } from "../i18n/I18nProvider";
import { ScreenContainer, AppText, EmptyState, Button } from "../components/ui";

export default function QAPreviewScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { spacing } = useTheme();

  return (
    <ScreenContainer padded>
      <View style={{ marginTop: spacing.lg }}>
        <AppText variant="title">{t("misc.qaPreviewTitle")}</AppText>
      </View>

      <EmptyState
        icon="eye-outline"
        title={t("misc.qaPreviewSoon")}
        description={t("misc.qaPreviewSoonDesc")}
      />

      <View style={{ gap: spacing.md, marginTop: spacing.md }}>
        <Button
          title={t("misc.goToDetails")}
          icon="arrow-forward"
          onPress={() => navigation.navigate("QADetail")}
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
