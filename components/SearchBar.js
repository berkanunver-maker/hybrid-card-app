// components/SearchBar.js
import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "../utils/theme";
import { useTranslation } from "../i18n/I18nProvider";
import { Input, Icon } from "./ui";

export default function SearchBar({
  value,
  onChangeText,
  onClear,
  placeholder,
  autoFocus = true,
}) {
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors, spacing), [colors, spacing]);

  const resolvedPlaceholder = placeholder ?? t("search.placeholder");
  const hasValue = value.length > 0;

  return (
    <View style={styles.container}>
      <Icon
        name="search"
        size={20}
        color={colors.textSecondary}
        style={styles.searchIcon}
      />
      <Input
        value={value}
        onChangeText={onChangeText}
        placeholder={resolvedPlaceholder}
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        accessibilityLabel={t("a11y.search")}
        rightIcon={hasValue ? "close-circle" : undefined}
        onRightIconPress={hasValue ? onClear : undefined}
        containerStyle={styles.inputContainer}
        style={styles.input}
      />
    </View>
  );
}

const createStyles = (colors, spacing) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: spacing.xl,
      marginVertical: spacing.lg,
    },
    searchIcon: {
      position: "absolute",
      left: 14,
      zIndex: 1,
    },
    inputContainer: {
      flex: 1,
      marginBottom: 0,
    },
    input: {
      paddingLeft: 26,
    },
  });
