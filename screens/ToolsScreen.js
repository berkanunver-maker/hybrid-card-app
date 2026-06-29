// screens/ToolsScreen.js
import React, { useMemo } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { useTheme } from "../utils/theme";
import { useTranslation } from "../i18n/I18nProvider";
import { useNavigation } from "@react-navigation/native";
import { AppText, ScreenContainer, ListRow } from "../components/ui";

export default function ToolsScreen() {
  const { colors, spacing, radius, shadows } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const styles = useMemo(
    () => createStyles(colors, spacing, radius, shadows),
    [colors, spacing, radius, shadows]
  );

  const tools = [
    {
      id: "document",
      title: "Document AI",
      description: t("tools.toolDocumentDesc"),
      icon: "document-text-outline",
      route: "Document",
    },
    {
      id: "vision",
      title: "Vision OCR",
      description: t("tools.toolVisionDesc"),
      icon: "eye-outline",
      route: "Vision",
    },
    {
      id: "voice",
      title: "Voice Transcribe",
      description: t("tools.toolVoiceDesc"),
      icon: "mic-outline",
      route: "Voice",
    },
  ];

  return (
    <ScreenContainer>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        <AppText variant="title">{t("tools.toolsTitle")}</AppText>
        <AppText variant="body" color="textMuted" style={{ marginTop: spacing.xs }}>
          {t("tools.toolsSubtitle")}
        </AppText>

        {tools.map((tool) => (
          <ListRow
            key={tool.id}
            icon={tool.icon}
            title={tool.title}
            subtitle={tool.description}
            onPress={() => navigation.navigate(tool.route)}
            style={{ marginTop: spacing.md }}
          />
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const createStyles = () =>
  StyleSheet.create({
    container: { flex: 1 },
  });
