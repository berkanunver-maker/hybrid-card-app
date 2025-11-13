import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from "react-native";
import { colors } from "../utils/colors";
import { constants } from "../utils/constants";

export default function CustomButton({
  title = "Buton",
  onPress = () => {},
  type = "primary", // "primary" | "outline"
  disabled = false,
  loading = false,
  style,
  textStyle,
}) {
  const isPrimary = type === "primary";

  const buttonStyle = [
    styles.button,
    isPrimary ? styles.primary : styles.outline,
    disabled && styles.disabled,
    style,
  ];

  const textColor = isPrimary ? colors.white : colors.primary;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={buttonStyle}
      onPress={!disabled && !loading ? onPress : null}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={isPrimary ? colors.white : colors.primary} />
      ) : (
        <Text
          style={[
            styles.text,
            { color: disabled ? colors.textMuted : textColor },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 6,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  outline: {
    borderWidth: 1.4,
    borderColor: colors.primary,
    backgroundColor: "transparent",
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
