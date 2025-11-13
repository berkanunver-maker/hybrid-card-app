import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Audio } from "expo-av";
import { useTheme } from "../utils/theme";
import { analyzeVoice } from "../services/voiceService";
import { Loader, FeedbackModal, CustomButton } from "../components";

export default function VoiceScreen() {
  const { colors } = useTheme();
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUri, setRecordedUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [result, setResult] = useState(null);

  // 🎙️ Ses izni kontrolü
  useEffect(() => {
    (async () => {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        alert("Mikrofon izni gerekiyor.");
      }
    })();
  }, []);

  // 🔴 Kaydı başlat
  const startRecording = async () => {
    try {
      setIsRecording(true);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (err) {
      console.error("Recording start error:", err);
      setIsRecording(false);
    }
  };

  // ⏹ Kaydı durdur
  const stopRecording = async () => {
    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordedUri(uri);
      setRecording(null);
    } catch (err) {
      console.error("Recording stop error:", err);
    }
  };

  // 🧠 Ses analizi
  const handleAnalyze = async () => {
    if (!recordedUri) {
      alert("Önce bir ses kaydı yapın.");
      return;
    }

    try {
      setLoading(true);
      const response = await analyzeVoice(recordedUri);
      setResult(response || "Sonuç alınamadı.");
      setModalVisible(true);
    } catch (error) {
      console.error("❌ Voice analyze error:", error);
      setResult("Ses analizi başarısız oldu.");
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
          Voice to Text (Speech-to-Text)
        </Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Konuşmanızı kaydedin, AI onu metne dönüştürsün.
        </Text>

        <TouchableOpacity
          style={[
            styles.recordButton,
            {
              backgroundColor: isRecording ? colors.error : colors.primary,
            },
          ]}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <Text style={{ color: colors.white, fontWeight: "700" }}>
            {isRecording ? "Kaydı Durdur" : "Kaydı Başlat"}
          </Text>
        </TouchableOpacity>

        {recordedUri && (
          <Text style={{ color: colors.text, marginTop: 10, textAlign: "center" }}>
            🎧 Kayıt tamamlandı, analiz edebilirsiniz.
          </Text>
        )}

        <CustomButton
          title="Analiz Et"
          onPress={handleAnalyze}
          disabled={!recordedUri}
          style={{ marginTop: 20 }}
        />
      </View>

      {/* Loader */}
      <Loader visible={loading} text="Ses analiz ediliyor..." />

      {/* Feedback Modal */}
      <FeedbackModal
        visible={modalVisible}
        title="Analiz Sonucu"
        message={
          typeof result === "string" ? result : JSON.stringify(result, null, 2)
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
  recordButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
});
