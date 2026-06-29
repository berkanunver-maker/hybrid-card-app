import React from "react";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import StackNavigator from "./StackNavigator";
import { useTheme } from "../utils/theme";

export default function AppNavigation() {
  const { colors, isDark } = useTheme();

  const base = isDark ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      background: colors.bg,
      card: colors.surface,
      primary: colors.primary,
      text: colors.text,
      border: colors.border,
      notification: colors.danger,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <StackNavigator />
    </NavigationContainer>
  );
}
