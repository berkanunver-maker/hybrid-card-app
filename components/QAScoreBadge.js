import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../utils/colors";

export default function QAScoreBadge({ score = 0 }) {
  const getColor = () => {
    if (score >= 85) return colors.success;
    if (score >= 60) return colors.warning;
    return colors.error || "#E53935";
  };

  return (
    <View style={[styles.badge, { backgroundColor: getColor() }]}>
      <Text style={styles.text}>{score}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  text: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 13,
  },
});
