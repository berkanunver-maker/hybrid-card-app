// components/ui/Loader.js — tam ekran yükleyici + iskelet (skeleton)
import React from "react";
import { View, ActivityIndicator, Modal } from "react-native";
import { useTheme } from "../../utils/theme";
import AppText from "./Text";

export function Loader({ visible, text }) {
  const { colors, radius } = useTheme();
  if (!visible) return null;
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: colors.overlay,
          alignItems: "center",
          justifyContent: "center",
        }}
        accessibilityLiveRegion="polite"
      >
        <View
          style={{
            backgroundColor: colors.surfaceElevated,
            borderRadius: radius.lg,
            paddingVertical: 24,
            paddingHorizontal: 28,
            alignItems: "center",
            minWidth: 140,
          }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          {text ? (
            <AppText variant="body" color="textSecondary" style={{ marginTop: 12, textAlign: "center" }}>
              {text}
            </AppText>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

export function Skeleton({ width = "100%", height = 16, radius: r, style }) {
  const { colors, radius } = useTheme();
  return (
    <View
      style={[
        { width, height, backgroundColor: colors.surfaceAlt, borderRadius: r ?? radius.sm },
        style,
      ]}
    />
  );
}

export default Loader;
