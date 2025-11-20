import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useTranslation } from "react-i18next";
import { useTheme } from "../utils/theme";
import { Loader, FeedbackModal, CustomButton } from "../components";
import { analyzeDocument } from "../services/documentAIService";

export default function DocumentScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // 📂 Dosya seçimi
  const handlePickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*"],
      copyToCacheDirectory: true,
    });

    if (result.canceled) return;
    setSelectedFile(result.assets ? result.assets[0] : result);
  };

  // 🧠 Belge analizi
  const handleAnalyze = async () => {
    if (!selectedFile) {
      alert(t('document.errors.noFile'));
      return;
    }

    try {
      setLoading(true);
      const response = await analyzeDocument(selectedFile);
      setAnalysisResult(response || t('document.errors.noResult'));
      setModalVisible(true);
    } catch (error) {
      console.error("❌ Document analyze error:", error);
      setAnalysisResult(t('document.errors.analysisFailed'));
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('document.title')}
        </Text>

        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {t('document.subtitle')}
        </Text>

        <TouchableOpacity
          style={[
            styles.uploadBox,
            { borderColor: colors.border, backgroundColor: colors.surface },
          ]}
          onPress={handlePickFile}
        >
          <Text style={{ color: colors.text }}>
            {selectedFile ? selectedFile.name : t('document.selectFileButton')}
          </Text>
        </TouchableOpacity>

        <CustomButton
          title={t('document.analyzeButton')}
          onPress={handleAnalyze}
          disabled={!selectedFile}
          style={{ marginTop: 20 }}
        />
      </View>

      {/* Loader */}
      <Loader visible={loading} text={t('document.analyzing')} />

      {/* Feedback Modal */}
      <FeedbackModal
        visible={modalVisible}
        title={t('document.resultTitle')}
        message={
          typeof analysisResult === "string"
            ? analysisResult
            : JSON.stringify(analysisResult, null, 2)
        }
        primaryAction={{
          text: t('document.closeButton'),
          onPress: () => setModalVisible(false),
        }}
        onClose={() => setModalVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  uploadBox: {
    borderWidth: 1.4,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
