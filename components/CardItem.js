import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../utils/colors";
import { constants } from "../utils/constants";

export default function CardItem({
  title = "Kart Başlığı",
  subtitle = "",
  imageUri = null,
  status = "",
  score = null,
  onPress,
  style,
}) {
  return (
    <TouchableOpacity
      style={[styles.card, style]}
      activeOpacity={onPress ? 0.8 : 1}
      onPress={onPress}
    >
      {/* Görsel Alanı */}
      <View style={styles.imageContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>📄</Text>
          </View>
        )}
      </View>

      {/* Bilgi Alanı */}
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}

        {/* Durum veya Skor */}
        {(status || score) && (
          <View style={styles.metaRow}>
            {status ? (
              <Text style={[styles.status, { color: colors.accent }]}>
                {status}
              </Text>
            ) : null}
            {score !== null && (
              <Text style={[styles.score, { color: colors.success }]}>
                {score}%
              </Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    marginVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    padding: 10,
  },
  imageContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.backgroundAlt,
    marginRight: 10,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: 28,
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    justifyContent: "space-between",
  },
  status: {
    fontSize: 13,
    fontWeight: "500",
  },
  score: {
    fontSize: 13,
    fontWeight: "600",
  },
});
