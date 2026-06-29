// components/ui/Button.js — tasarım sistemi butonu
import React from "react";
import { Pressable, ActivityIndicator } from "react-native";
import Icon from "./Icon";
import { useTheme } from "../../utils/theme";
import AppText from "./Text";

const SIZES = { sm: 40, md: 48, lg: 52 };

// variant: primary | secondary | ghost | danger
export default function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  fullWidth = true,
  style,
  ...rest
}) {
  const { colors, radius } = useTheme();
  const height = SIZES[size] || SIZES.md;
  const isDisabled = disabled || loading;

  const variants = {
    primary: { bg: colors.primary, pressedBg: colors.primaryPressed, fg: colors.onPrimary, border: null },
    secondary: { bg: colors.surface, pressedBg: colors.surfaceAlt, fg: colors.text, border: colors.border },
    ghost: { bg: "transparent", pressedBg: colors.surfaceAlt, fg: colors.primary, border: null },
    danger: { bg: colors.danger, pressedBg: colors.danger, fg: colors.onPrimary, border: null },
  };
  const v = variants[variant] || variants.primary;
  const fg = isDisabled ? colors.disabledText : v.fg;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityLabel={title}
      style={({ pressed }) => [
        {
          height,
          borderRadius: radius.md,
          backgroundColor: isDisabled ? colors.disabledBg : pressed ? v.pressedBg : v.bg,
          borderWidth: v.border ? 1 : 0,
          borderColor: v.border || "transparent",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          paddingHorizontal: 18,
          opacity: pressed && !isDisabled ? 0.96 : 1,
          alignSelf: fullWidth ? "stretch" : "flex-start",
        },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon ? <Icon name={icon} size={18} color={fg} /> : null}
          <AppText variant="bodyStrong" style={{ color: fg }}>
            {title}
          </AppText>
        </>
      )}
    </Pressable>
  );
}
