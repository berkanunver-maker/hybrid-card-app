// components/ui/SectionHeader.js — bölüm başlığı (emojisiz, sentence-case)
import React from "react";
import { View } from "react-native";
import { useTheme } from "../../utils/theme";
import AppText from "./Text";

export default function SectionHeader({ title, action, style }) {
  const { spacing } = useTheme();
  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: spacing.md,
        },
        style,
      ]}
    >
      <AppText variant="sectionHeader" color="textMuted">
        {title}
      </AppText>
      {action || null}
    </View>
  );
}
