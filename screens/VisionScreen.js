import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "../utils/theme";
import { analyzeImage } from "../services/visionService";
import { Loader, FeedbackModal, CustomButton } from "../components";

export default function VisionScreen() {
  const { colors } = useTheme();
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // 📸 Görsel seçimi
  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // 🧠 Görsel analizi
  const handleAnalyze = async () => {
    if (!imageUri) {
      alert("Lütfen bir görsel seçin.");
      return;
    }

    try {
      setLoading(true);
      const response = await analyzeImage(imageUri);
      setAnalysisResult(response || "Sonuç alınamadı.");
      setModalVisible(true);
    } catch (error) {
      console.error("❌ Vision analyze error:", error);
      setAnalysisResult("Görsel analizinde hata oluştu.");
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
          Vision OCR Analizi
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Görsellerden metin tanıma (OCR) işlemi yapabilirsiniz.
        </Text>

        {/* Görsel Önizleme */}
        <TouchableOpacity
          style={[
            styles.imageBox,
            { borderColor: colors.border, backgroundColor: colors.surface },
          ]}
          onPress={handlePickImage}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          ) : (
            <Text style={{ color: colors.text }}>📷 Görsel Seç</Text>
          )}
        </TouchableOpacity>

        <CustomButton
          title="Analiz Et"
          onPress={handleAnalyze}
          disabled={!imageUri}
          style={{ marginTop: 20 }}
        />
      </View>

      {/* Loader */}
      <Loader visible={loading} text="OCR işlemi yapılıyor..." />

      {/* Feedback Modal */}
      <FeedbackModal
        visible={modalVisible}
        title="OCR Sonucu"
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
  container: { flex: 1 },
  content: { padding: 20 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 14, marginBottom: 20, lineHeight: 20 },
  imageBox: {
    borderWidth: 1.4,
    borderRadius: 12,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
});
