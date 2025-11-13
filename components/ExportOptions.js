import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../utils/colors";
import { Ionicons } from "@expo/vector-icons";

export default function ExportOptions({ onExportPDF, onShare, onCopy }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dışa Aktarım Seçenekleri</Text>

      <View style={styles.row}>
        <TouchableOpacity style={styles.option} onPress={onExportPDF}>
          <Ionicons name="document-text-outline" size={22} color={colors.primary} />
          <Text style={styles.text}>PDF</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={onShare}>
          <Ionicons name="share-social-outline" size={22} color={colors.primary} />
          <Text style={styles.text}>Paylaş</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.option} onPress={onCopy}>
          <Ionicons name="copy-outline" size={22} color={colors.primary} />
          <Text style={styles.text}>Kopyala</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
    padding: 14,
    backgroundColor: colors.surface,
    borderRadius: 12,
  },
  title: {
    fontWeight: "700",
    color: colors.text,
    fontSize: 15,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  option: {
    alignItems: "center",
  },
  text: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textMuted,
  },
});
