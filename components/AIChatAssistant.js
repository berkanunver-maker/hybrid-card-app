import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Icon from "./ui/Icon";
import { useTheme } from "../utils/theme";
import { useTranslation } from "../i18n/I18nProvider";
import { SurfaceCard, AppText } from "./ui";

export default function AIChatAssistant() {
  const { t } = useTranslation();
  const { colors, spacing, radius } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, spacing, radius),
    [colors, spacing, radius]
  );

  return (
    <SurfaceCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Icon name="sparkles-outline" size={18} color={colors.primary} />
        </View>
        <AppText variant="bodyStrong">{t("misc.aiChatTitle")}</AppText>
      </View>
      <AppText variant="caption" color="textMuted" style={styles.subtitle}>
        {t("misc.aiChatSubtitle")}
      </AppText>
    </SurfaceCard>
  );
}

const createStyles = (colors, spacing, radius) =>
  StyleSheet.create({
    card: {
      marginVertical: spacing.sm,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginBottom: spacing.xs,
    },
    iconWrap: {
      width: 32,
      height: 32,
      borderRadius: radius.pill,
      backgroundColor: colors.primaryMuted,
      alignItems: "center",
      justifyContent: "center",
    },
    subtitle: {
      lineHeight: 18,
    },
  });
