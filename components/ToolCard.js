import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { colors } from "../utils/colors";

export default function ToolCard({
  title = "AI Aracı",
  description = "",
  iconUri = null,
  onPress,
  disabled = false,
  style,
}) {
  return (
    <TouchableOpacity
      activeOpacity={disabled ? 1 : 0.85}
      onPress={!disabled ? onPress : null}
      style={[
        styles.card,
        disabled && styles.disabled,
        style,
      ]}
    >
      {/* İkon veya Görsel */}
      <View style={styles.iconContainer}>
        {iconUri ? (
          <Image source={{ uri: iconUri }} style={styles.iconImage} />
        ) : (
          <View style={styles.iconPlaceholder}>
            <Text style={styles.iconEmoji}>🤖</Text>
          </View>
        )}
      </View>

      {/* Bilgi */}
      <View style={styles.info}>
        <Text style={styles.title}>{title}</Text>
        {description ? (
          <Text style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        ) : null}
      </View>

      {/* Ok veya yön göstergesi */}
      {!disabled && (
        <View style={styles.arrow}>
          <Text style={styles.arrowText}>›</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  disabled: {
    opacity: 0.5,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.backgroundAlt,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  iconImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  iconPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconEmoji: {
    fontSize: 28,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  description: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  arrow: {
    paddingHorizontal: 6,
  },
  arrowText: {
    fontSize: 22,
    fontWeight: "300",
    color: colors.textMuted,
  },
});
