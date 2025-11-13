import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useTheme } from "../utils/theme";
import { Loader, FeedbackModal, CustomButton } from "../components";
import { analyzeDocument } from "../services/documentAIService";

export default function DocumentScreen() {
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
      alert("Lütfen önce bir dosya seçin.");
      return;
    }

    try {
      setLoading(true);
      const response = await analyzeDocument(selectedFile);
      setAnalysisResult(response || "Sonuç alınamadı");
      setModalVisible(true);
    } catch (error) {
      console.error("❌ Document analyze error:", error);
      setAnalysisResult("Belge analizinde hata oluştu.");
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
          Document AI Analizi
        </Text>

        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          PDF veya görsel yükleyerek AI destekli analiz yapabilirsiniz.
        </Text>

        <TouchableOpacity
          style={[
            styles.uploadBox,
            { borderColor: colors.border, backgroundColor: colors.surface },
          ]}
          onPress={handlePickFile}
        >
          <Text style={{ color: colors.text }}>
            {selectedFile ? selectedFile.name : "📄 Dosya Seç"}
          </Text>
        </TouchableOpacity>

        <CustomButton
          title="Analiz Et"
          onPress={handleAnalyze}
          disabled={!selectedFile}
          style={{ marginTop: 20 }}
        />
      </View>

      {/* Loader */}
      <Loader visible={loading} text="Analiz ediliyor..." />

      {/* Feedback Modal */}
      <FeedbackModal
        visible={modalVisible}
        title="Analiz Sonucu"
        message={
          typeof analysisResult === "string"
            ? analysisResult
            : JSON.stringify(analysisResult, null, 2)
        }
        primaryAction={{
          text: "Kapat",
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
