// components/ui/Card.js — SurfaceCard (yüzey) + ListRow (liste satırı)
import React from "react";
import { View, Pressable } from "react-native";
import Icon from "./Icon";
import { useTheme } from "../../utils/theme";
import AppText from "./Text";

export function SurfaceCard({ children, style, onPress, accessibilityLabel, ...rest }) {
  const { colors, radius, shadows } = useTheme();
  const base = {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: 16,
    ...shadows.sm,
  };
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={({ pressed }) => [base, { opacity: pressed ? 0.92 : 1 }, style]}
        {...rest}
      >
        {children}
      </Pressable>
    );
  }
  return (
    <View style={[base, style]} {...rest}>
      {children}
    </View>
  );
}

export function ListRow({
  icon,
  iconColor,
  leading,
  title,
  subtitle,
  trailing,
  onPress,
  showChevron = true,
  accessibilityLabel,
  style,
  ...rest
}) {
  const { colors, radius, shadows } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel || [title, subtitle].filter(Boolean).join(", ")
      }
      style={({ pressed }) => [
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: radius.lg,
          padding: 14,
          opacity: pressed && onPress ? 0.92 : 1,
          ...shadows.sm,
        },
        style,
      ]}
      {...rest}
    >
      {leading
        ? leading
        : icon
        ? (
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: radius.pill,
              backgroundColor: colors.primaryMuted,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name={icon} size={20} color={iconColor || colors.primary} />
          </View>
        )
        : null}
      <View style={{ flex: 1, minWidth: 0 }}>
        {title ? (
          <AppText variant="heading" numberOfLines={1}>
            {title}
          </AppText>
        ) : null}
        {subtitle ? (
          <AppText
            variant="caption"
            color="textSecondary"
            numberOfLines={1}
            style={{ marginTop: 2 }}
          >
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {trailing
        ? trailing
        : showChevron && onPress
        ? <Icon name="chevron-forward" size={18} color={colors.textMuted} />
        : null}
    </Pressable>
  );
}

export default SurfaceCard;
