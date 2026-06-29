// components/ui/Text.js — tipografi token'larıyla tutarlı metin bileşeni
import React from "react";
import { Text } from "react-native";
import { useTheme } from "../../utils/theme";
import { fonts } from "../../utils/colors";

// variant: display | title | heading | body | bodyStrong | label | caption | sectionHeader
// color: token adı ("textSecondary") veya doğrudan hex
// font: "serif" | "mono" — varyantın font ailesini geçersiz kılar (örn. kart isimleri serif)
export default function AppText({
  variant = "body",
  color,
  font,
  style,
  children,
  ...rest
}) {
  const { colors, typography } = useTheme();
  const t = typography[variant] || typography.body;
  const resolvedColor = color ? colors[color] || color : colors.text;
  const familyOverride =
    font === "serif" ? fonts.serif : font === "mono" ? fonts.mono : null;
  return (
    <Text
      style={[t, { color: resolvedColor }, familyOverride && { fontFamily: familyOverride }, style]}
      {...rest}
    >
      {children}
    </Text>
  );
}
