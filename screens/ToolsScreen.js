// screens/ToolsScreen.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useTheme } from "../utils/theme";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function ToolsScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const tools = [
    {
      id: "document",
      title: "Document AI",
      description: "PDF veya kart görüntüsünden QA analizi yapar.",
      icon: "document-text-outline",
      route: "Document",
    },
    {
      id: "vision",
      title: "Vision OCR",
      description: "Görsellerden metin çıkarır (OCR).",
      icon: "eye-outline",
      route: "Vision",
    },
    {
      id: "voice",
      title: "Voice Transcribe",
      description: "Ses kaydını metne dönüştürür.",
      icon: "mic-outline",
      route: "Voice",
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: 20 }}
    >
      <Text style={[styles.title, { color: colors.text }]}>AI Tools</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        Akıllı kart analizi araçlarını buradan kullanabilirsin.
      </Text>

      {tools.map((tool) => (
        <TouchableOpacity
          key={tool.id}
          style={[styles.card, { backgroundColor: colors.surface }]}
          onPress={() => navigation.navigate(tool.route)}
        >
          <View style={styles.iconBox}>
            <Ionicons name={tool.icon} size={30} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              {tool.title}
            </Text>
            <Text style={[styles.cardDesc, { color: colors.textMuted }]}>
              {tool.description}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={colors.textMuted}
            style={{ marginLeft: 6 }}
          />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2c2c2c",
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(123, 97, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  cardDesc: {
    fontSize: 13,
    marginTop: 2,
  },
});
