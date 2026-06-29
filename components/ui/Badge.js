// components/ui/Badge.js — durum rozetleri (tinted)
import React from "react";
import { View } from "react-native";
import { useTheme } from "../../utils/theme";
import AppText from "./Text";

// tone: success | warning | danger | info | primary | neutral
export default function Badge({ label, tone = "neutral", icon, style }) {
  const { colors, radius } = useTheme();
  const tones = {
    success: { bg: colors.successSurface, fg: colors.success },
    warning: { bg: colors.warningSurface, fg: colors.warning },
    danger: { bg: colors.dangerSurface, fg: colors.danger },
    info: { bg: colors.primaryMuted, fg: colors.info },
    primary: { bg: colors.primaryMuted, fg: colors.primary },
    neutral: { bg: colors.surfaceAlt, fg: colors.textSecondary },
  };
  const c = tones[tone] || tones.neutral;
  return (
    <View
      style={[
        {
          backgroundColor: c.bg,
          borderRadius: radius.pill,
          paddingHorizontal: 9,
          paddingVertical: 3,
          alignSelf: "flex-start",
        },
        style,
      ]}
    >
      <AppText variant="caption" style={{ color: c.fg }}>
        {label}
      </AppText>
    </View>
  );
}
