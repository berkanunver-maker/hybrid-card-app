// components/ui/BottomSheet.js — alttan açılan sheet + ortalı Dialog
import React from "react";
import { Modal, View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../utils/theme";

export default function BottomSheet({ visible, onClose, children, dismissable = true }) {
  const { colors, radius } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: colors.overlay, justifyContent: "flex-end" }}
        onPress={dismissable ? onClose : undefined}
        accessibilityViewIsModal
      >
        <Pressable
          onPress={() => {}}
          style={{
            backgroundColor: colors.surfaceElevated,
            borderTopLeftRadius: radius.xl,
            borderTopRightRadius: radius.xl,
            paddingHorizontal: 20,
            paddingTop: 10,
            paddingBottom: 20 + insets.bottom,
          }}
        >
          <View
            style={{
              alignSelf: "center",
              width: 36,
              height: 4,
              borderRadius: 2,
              backgroundColor: colors.borderStrong,
              marginBottom: 16,
            }}
          />
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function Dialog({ visible, onClose, children, dismissable = true }) {
  const { colors, radius, shadows } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={{
          flex: 1,
          backgroundColor: colors.overlay,
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
        onPress={dismissable ? onClose : undefined}
        accessibilityViewIsModal
      >
        <Pressable
          onPress={() => {}}
          style={{
            width: "100%",
            maxWidth: 380,
            backgroundColor: colors.surfaceElevated,
            borderRadius: radius.lg,
            padding: 20,
            ...shadows.lg,
          }}
        >
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
