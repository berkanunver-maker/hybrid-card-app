// components/ui/Input.js — etiketli, hata destekli metin girişi + PasswordInput
import React, { useState, forwardRef } from "react";
import { View, TextInput, Pressable } from "react-native";
import Icon from "./Icon";
import { useTheme } from "../../utils/theme";
import AppText from "./Text";

const Input = forwardRef(function Input(
  {
    label,
    error,
    rightIcon,
    onRightIconPress,
    style,
    containerStyle,
    ...rest
  },
  ref
) {
  const { colors, radius, typography } = useTheme();
  const [focused, setFocused] = useState(false);
  const borderColor = error
    ? colors.danger
    : focused
    ? colors.primary
    : colors.border;

  return (
    <View style={[{ marginBottom: 16 }, containerStyle]}>
      {label ? (
        <AppText variant="label" color="textSecondary" style={{ marginBottom: 6 }}>
          {label}
        </AppText>
      ) : null}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          minHeight: 48,
          borderWidth: 1,
          borderColor,
          backgroundColor: colors.surface,
          borderRadius: radius.sm,
          paddingHorizontal: 14,
        }}
      >
        <TextInput
          ref={ref}
          placeholderTextColor={colors.textMuted}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityLabel={label}
          style={[{ flex: 1, color: colors.text, paddingVertical: 12 }, typography.body, style]}
          {...rest}
        />
        {rightIcon ? (
          <Pressable
            onPress={onRightIconPress}
            hitSlop={10}
            accessibilityRole="button"
          >
            <Icon name={rightIcon} size={20} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <AppText variant="caption" color="danger" style={{ marginTop: 6 }}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
});

export function PasswordInput(props) {
  const [hidden, setHidden] = useState(true);
  return (
    <Input
      {...props}
      secureTextEntry={hidden}
      autoCapitalize="none"
      rightIcon={hidden ? "eye-outline" : "eye-off-outline"}
      onRightIconPress={() => setHidden((h) => !h)}
    />
  );
}

export default Input;
