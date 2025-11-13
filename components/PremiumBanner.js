import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "../utils/colors";

export default function PremiumBanner({ onUpgrade }) {
  return (
    <View style={styles.banner}>
      <Text style={styles.title}>✨ Premium Özellikleri Deneyin!</Text>
      <Text style={styles.subtitle}>
        Daha hızlı analiz, gelişmiş OCR ve öncelikli destek için yükseltin.
      </Text>
      <TouchableOpacity style={styles.button} onPress={onUpgrade}>
        <Text style={styles.buttonText}>Yükselt</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    padding: 16,
    marginVertical: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.white,
  },
  subtitle: {
    color: colors.white,
    marginTop: 4,
    marginBottom: 12,
    fontSize: 13,
  },
  button: {
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
  },
  buttonText: {
    color: colors.accent,
    fontWeight: "700",
  },
});
