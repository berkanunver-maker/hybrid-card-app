import React, { useState } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import StackNavigator from "./StackNavigator";
import { colors } from "../utils/colors";

export default function AppNavigation() {
  const [loading, setLoading] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState(false);

  const appTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: colors.background,
      primary: colors.primary,
      text: colors.text,
      border: colors.border,
    },
  };

  return (
    <NavigationContainer theme={appTheme}>
      {/* Ana Stack Navigatör */}
      <StackNavigator />
    </NavigationContainer>
  );
}