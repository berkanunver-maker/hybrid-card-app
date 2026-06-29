// screens/VoiceScreen.js
import React, { useState, useEffect, useMemo } from "react";
import { View, Pressable, ScrollView, StyleSheet } from "react-native";
import { Audio } from "expo-av";
import { useTheme } from "../utils/theme";
import { useTranslation } from "../i18n/I18nProvider";
import voiceService from "../services/voiceService";
import { FeedbackModal } from "../components";
import {
  ScreenContainer,
  AppText,
  Button,
  Loader,
  SectionHeader,
  Icon,
} from "../components/ui";

export default function VoiceScreen() {
  const { colors, spacing, radius } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(
    () => createStyles(colors, spacing, radius),
    [colors, spacing, radius]
  );

  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUri, setRecordedUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [result, setResult] = useState(null);

  // Ses izni kontrolü
  useEffect(() => {
    (async () => {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        alert(t("tools.micPermission"));
      }
    })();
  }, []);

  // Kaydı başlat
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
      setIsRecording(false);
    }
  };

  // Kaydı durdur
  const stopRecording = async () => {
    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecordedUri(uri);
      setRecording(null);
    } catch (err) {
      // kayıt durdurulurken oluşan hatayı yut
    }
  };

  // Ses analizi
  const handleAnalyze = async () => {
    if (!recordedUri) {
      alert(t("tools.voiceRecordFirstAlert"));
      return;
    }

    try {
      setLoading(true);
      const response = await voiceService.transcribeAudio(recordedUri);
      setResult(response || t("tools.noResult"));
      setModalVisible(true);
    } catch (error) {
      setResult(t("tools.voiceError"));
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
        <AppText variant="title">{t("tools.voiceTitle")}</AppText>
        <AppText
          variant="body"
          color="textSecondary"
          style={{ marginTop: spacing.xs, marginBottom: spacing.xl }}
        >
          {t("tools.voiceSubtitle")}
        </AppText>

        <SectionHeader title={t("tools.recordingSection")} />

        <Pressable
          style={({ pressed }) => [
            styles.recordButton,
            { backgroundColor: isRecording ? colors.danger : colors.primary },
            pressed && { opacity: 0.92 },
          ]}
          onPress={isRecording ? stopRecording : startRecording}
          accessibilityRole="button"
          accessibilityState={{ selected: isRecording }}
          accessibilityLabel={isRecording ? "Kaydı durdur" : "Kaydı başlat"}
        >
          <Icon
            name={isRecording ? "stop-circle" : "mic"}
            size={20}
            color={colors.onPrimary}
          />
          <AppText variant="bodyStrong" style={{ color: colors.onPrimary }}>
            {isRecording ? t("tools.stopRecording") : t("tools.startRecording")}
          </AppText>
        </Pressable>

        {recordedUri && (
          <View style={styles.statusRow}>
            <Icon name="checkmark-circle" size={18} color={colors.success} />
            <AppText variant="body" color="textSecondary">
              {t("tools.recordingComplete")}
            </AppText>
          </View>
        )}

        <Button
          title={t("tools.analyze")}
          icon="sparkles-outline"
          onPress={handleAnalyze}
          disabled={!recordedUri}
          loading={loading}
          style={{ marginTop: spacing.xl }}
        />
      </ScrollView>

      {/* Loader */}
      <Loader visible={loading} text={t("tools.voiceLoading")} />

      {/* Feedback Modal */}
      <FeedbackModal
        visible={modalVisible}
        title={t("tools.analysisResult")}
        message={
          typeof result === "string" ? result : JSON.stringify(result, null, 2)
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
    recordButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      borderRadius: radius.md,
      height: 52,
    },
    statusRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      marginTop: spacing.md,
    },
  });
