import React, { useMemo } from "react";
import { View, Image, StyleSheet } from "react-native";
import Icon from "./ui/Icon";
import { useTheme } from "../utils/theme";
import { useTranslation } from "../i18n/I18nProvider";
import { SurfaceCard, AppText } from "./ui";

export default function ToolCard({
  title,
  description = "",
  iconUri = null,
  onPress,
  disabled = false,
  style,
}) {
  const { colors, spacing, radius } = useTheme();
  const { t } = useTranslation();
  const resolvedTitle = title ?? t("tools.defaultToolTitle");
  const styles = useMemo(
    () => createStyles(colors, spacing, radius),
    [colors, spacing, radius]
  );

  return (
    <SurfaceCard
      onPress={!disabled ? onPress : undefined}
      accessibilityLabel={resolvedTitle}
      style={[styles.card, disabled && styles.disabled, style]}
    >
      <View style={styles.row}>
        {/* İkon veya Görsel */}
        <View style={styles.iconContainer}>
          {iconUri ? (
            <Image source={{ uri: iconUri }} style={styles.iconImage} />
          ) : (
            <Icon name="hardware-chip-outline" size={28} color={colors.primary} />
          )}
        </View>

        {/* Bilgi */}
        <View style={styles.info}>
          <AppText variant="heading" numberOfLines={1}>
            {resolvedTitle}
          </AppText>
          {description ? (
            <AppText
              variant="caption"
              color="textMuted"
              numberOfLines={2}
              style={{ marginTop: spacing.xs }}
            >
              {description}
            </AppText>
          ) : null}
        </View>

        {/* Yön göstergesi */}
        {!disabled && (
          <Icon name="chevron-forward" size={20} color={colors.textMuted} />
        )}
      </View>
    </SurfaceCard>
  );
}

const createStyles = (colors, spacing, radius) =>
  StyleSheet.create({
    card: {
      marginVertical: spacing.xs,
    },
    disabled: {
      opacity: 0.5,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
    },
    iconContainer: {
      width: 52,
      height: 52,
      borderRadius: radius.md,
      backgroundColor: colors.primaryMuted,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    iconImage: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    info: {
      flex: 1,
      minWidth: 0,
    },
  });
