// screens/DocumentScreen.js
import React, { useState, useMemo } from "react";
import { View, Pressable, ScrollView, StyleSheet } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useTheme } from "../utils/theme";
import { useTranslation } from "../i18n/I18nProvider";
import { FeedbackModal } from "../components";
import { DocumentAIService } from "../services/documentAIService";
import {
  ScreenContainer,
  AppText,
  Button,
  Loader,
  SectionHeader,
  Icon,
} from "../components/ui";

export default function DocumentScreen() {
  const { colors, spacing, radius } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(
    () => createStyles(colors, spacing, radius),
    [colors, spacing, radius]
  );

  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Dosya seçimi
  const handlePickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*"],
      copyToCacheDirectory: true,
    });

    if (result.canceled) return;
    setSelectedFile(result.assets ? result.assets[0] : result);
  };

  // Belge analizi
  const handleAnalyze = async () => {
    if (!selectedFile) {
      alert(t("tools.documentSelectFileAlert"));
      return;
    }

    try {
      setLoading(true);
      const response = await DocumentAIService.analyzeCard(selectedFile.uri);
      setAnalysisResult(response || t("tools.noResult"));
      setModalVisible(true);
    } catch (error) {
      setAnalysisResult(t("tools.documentError"));
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <AppText variant="title">{t("tools.documentTitle")}</AppText>
        <AppText
          variant="body"
          color="textSecondary"
          style={{ marginTop: spacing.xs, marginBottom: spacing.xl }}
        >
          {t("tools.documentSubtitle")}
        </AppText>

        <SectionHeader title={t("tools.fileSection")} />

        <Pressable
          style={({ pressed }) => [styles.uploadBox, pressed && { opacity: 0.92 }]}
          onPress={handlePickFile}
          accessibilityRole="button"
          accessibilityLabel={
            selectedFile ? `Seçili dosya ${selectedFile.name}, değiştir` : "Dosya seç"
          }
        >
          <View style={styles.uploadIcon}>
            <Icon
              name={selectedFile ? "document-text" : "cloud-upload-outline"}
              size={24}
              color={colors.primary}
            />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <AppText variant="bodyStrong" numberOfLines={1}>
              {selectedFile ? selectedFile.name : t("tools.selectFile")}
            </AppText>
            <AppText variant="caption" color="textMuted" style={{ marginTop: 2 }}>
              {selectedFile ? t("tools.tapToChange") : t("tools.uploadFileHint")}
            </AppText>
          </View>
        </Pressable>

        <Button
          title={t("tools.analyze")}
          icon="sparkles-outline"
          onPress={handleAnalyze}
          disabled={!selectedFile}
          loading={loading}
          style={{ marginTop: spacing.xl }}
        />
      </ScrollView>

      {/* Loader */}
      <Loader visible={loading} text={t("tools.analyzing")} />

      {/* Feedback Modal */}
      <FeedbackModal
        visible={modalVisible}
        title={t("tools.analysisResult")}
        message={
          typeof analysisResult === "string"
            ? analysisResult
            : JSON.stringify(analysisResult, null, 2)
        }
        primaryAction={{
          text: t("tools.close"),
          onPress: () => setModalVisible(false),
        }}
        onClose={() => setModalVisible(false)}
      />
    </ScreenContainer>
  );
}

const createStyles = (colors, spacing, radius) =>
  StyleSheet.create({
    uploadBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      borderWidth: 1.4,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      padding: spacing.lg,
    },
    uploadIcon: {
      width: 48,
      height: 48,
      borderRadius: radius.pill,
      backgroundColor: colors.primaryMuted,
      alignItems: "center",
      justifyContent: "center",
    },
  });
