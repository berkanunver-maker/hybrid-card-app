import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../utils/colors";

export default function AIChatAssistant() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Chat Assistant</Text>
      <Text style={styles.subtitle}>
        Bu alan gelecekte Document AI sonuçlarıyla etkileşen sohbet asistanını gösterecek.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginVertical: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
  },
});
