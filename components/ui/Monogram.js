// components/ui/Monogram.js
// Şirketten türeyen renkli monogram avatarı — kart sistemini tüm listelere taşır.
import React from "react";
import { View } from "react-native";
import { useTheme } from "../../utils/theme";
import AppText from "./Text";
import { accentFor, monogramOf } from "./DigitalCard";

export default function Monogram({ name, company, size = 44, style }) {
  const { radius } = useTheme();
  const accent = accentFor(company);
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: radius.pill,
          backgroundColor: accent + "22", // %13 tint
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      <AppText variant="bodyStrong" style={{ color: accent, fontSize: size < 40 ? 13 : 15 }}>
        {monogramOf(name)}
      </AppText>
    </View>
  );
}
