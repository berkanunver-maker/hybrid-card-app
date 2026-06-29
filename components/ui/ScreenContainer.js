// components/ui/ScreenContainer.js — tema zemini + safe-area sarmalayıcı
import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../utils/theme";

export default function ScreenContainer({
  children,
  style,
  edges = ["top"],
  padded = false,
}) {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const pad = {};
  if (edges.includes("top")) pad.paddingTop = insets.top;
  if (edges.includes("bottom")) pad.paddingBottom = insets.bottom;
  return (
    <View
      style={[
        { flex: 1, backgroundColor: colors.bg },
        pad,
        padded && { paddingHorizontal: spacing.lg },
        style,
      ]}
    >
      {children}
    </View>
  );
}
