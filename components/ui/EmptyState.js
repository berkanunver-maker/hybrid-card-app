// components/ui/EmptyState.js — boş durum bileşeni
import React from "react";
import { View } from "react-native";
import Icon from "./Icon";
import { useTheme } from "../../utils/theme";
import AppText from "./Text";
import Button from "./Button";

export default function EmptyState({
  icon = "documents-outline",
  title,
  description,
  actionLabel,
  onAction,
  style,
}) {
  const { colors, radius } = useTheme();
  return (
    <View
      style={[
        { alignItems: "center", justifyContent: "center", paddingVertical: 48, paddingHorizontal: 24 },
        style,
      ]}
    >
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: radius.pill,
          backgroundColor: colors.primaryMuted,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <Icon name={icon} size={32} color={colors.primary} />
      </View>
      {title ? (
        <AppText variant="heading" style={{ textAlign: "center", marginBottom: 6 }}>
          {title}
        </AppText>
      ) : null}
      {description ? (
        <AppText variant="body" color="textMuted" style={{ textAlign: "center", maxWidth: 280 }}>
          {description}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} fullWidth={false} style={{ marginTop: 20 }} />
      ) : null}
    </View>
  );
}
