// components/ui/VoiceRecorder.js
// Premium ses kaydedici: manuel durdur + canlı sayaç + dalga animasyonu + haptik.
// transcribe=true → kaydı yükler + transkript eder, onComplete(voiceNote) döner.
// transcribe=false → sadece yerel kaydı döner (offline kuyruk için): onComplete({ uri, duration }).
import React, { useState, useRef, useEffect, useCallback } from "react";
import { View, Pressable, Animated, ActivityIndicator } from "react-native";
import * as Haptics from "expo-haptics";
import { useTheme } from "../../utils/theme";
import { useTranslation } from "../../i18n/I18nProvider";
import AppText from "./Text";
import BottomSheet from "./BottomSheet";
import voiceService from "../../services/voiceService";
import { uploadFile } from "../../services/storageService";

const MAX_SECONDS = 120;
const BAR_COUNT = 7;

export default function VoiceRecorder({ visible, onClose, onComplete, userId, transcribe = true }) {
  const { colors, radius, spacing } = useTheme();
  const { t } = useTranslation();
  const [phase, setPhase] = useState("idle"); // idle | recording | processing
  const [seconds, setSeconds] = useState(0);

  const recordingRef = useRef(null);
  const timerRef = useRef(null);
  const bars = useRef([...Array(BAR_COUNT)].map(() => new Animated.Value(0.3))).current;

  const startWave = useCallback(() => {
    bars.forEach((b, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(b, { toValue: 1, duration: 280 + i * 55, useNativeDriver: false }),
          Animated.timing(b, { toValue: 0.3, duration: 280 + i * 55, useNativeDriver: false }),
        ])
      ).start();
    });
  }, [bars]);

  const stopWave = useCallback(() => bars.forEach((b) => b.stopAnimation()), [bars]);

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    stopWave();
    const r = recordingRef.current;
    recordingRef.current = null;
    if (r) voiceService.stopRecording(r).catch(() => {});
    setSeconds(0);
    setPhase("idle");
  }, [stopWave]);

  const finishRecording = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    stopWave();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});

    const rec = recordingRef.current;
    recordingRef.current = null;
    if (!rec) {
      onClose && onClose();
      return;
    }
    try {
      const uri = await voiceService.stopRecording(rec);
      const dur = seconds;
      if (!transcribe) {
        onComplete && onComplete({ uri, duration: dur });
        return;
      }
      setPhase("processing");
      let audioUrl = uri;
      try {
        const up = await uploadFile({ uri, path: `voices/${userId}/${Date.now()}.m4a` });
        audioUrl = up.url;
      } catch (e) {
        // yükleme başarısızsa yerel uri ile devam
      }
      const transcript = await voiceService.transcribeAudio(uri);
      onComplete &&
        onComplete({
          text: transcript?.text || transcript?.voice_note?.text || "",
          audioUrl,
          language: transcript?.language || transcript?.voice_note?.language || "tr-tr",
          duration: dur,
        });
    } catch (e) {
      onClose && onClose();
    }
  }, [seconds, transcribe, userId, onComplete, onClose, stopWave]);

  const start = useCallback(async () => {
    try {
      const rec = await voiceService.recordAudio();
      recordingRef.current = rec;
      setSeconds(0);
      setPhase("recording");
      startWave();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= MAX_SECONDS) {
            finishRecording();
            return MAX_SECONDS;
          }
          return s + 1;
        });
      }, 1000);
    } catch (e) {
      onClose && onClose();
    }
  }, [startWave, finishRecording, onClose]);

  useEffect(() => {
    if (visible) {
      start();
    } else {
      cleanup();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const mmss = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <BottomSheet
      visible={visible}
      onClose={phase === "processing" ? undefined : onClose}
      dismissable={phase !== "processing"}
    >
      {phase === "processing" ? (
        <View style={{ alignItems: "center", paddingVertical: spacing.xl }}>
          <ActivityIndicator size="large" color={colors.primary} />
          <AppText variant="body" color="textSecondary" style={{ marginTop: spacing.md }}>
            {t("ui.voiceProcessing")}
          </AppText>
        </View>
      ) : (
        <View style={{ alignItems: "center", paddingBottom: spacing.sm }}>
          <AppText variant="caption" color="textMuted">
            {t("ui.voiceRecording")}
          </AppText>
          <AppText font="mono" style={{ fontSize: 34, color: colors.text, marginTop: spacing.sm }}>
            {mmss}
          </AppText>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, height: 40, marginTop: spacing.lg }}>
            {bars.map((b, i) => (
              <Animated.View
                key={i}
                style={{
                  width: 4,
                  borderRadius: 2,
                  backgroundColor: colors.primary,
                  height: b.interpolate({ inputRange: [0, 1], outputRange: [8, 36] }),
                }}
              />
            ))}
          </View>

          <Pressable
            onPress={finishRecording}
            accessibilityRole="button"
            accessibilityLabel="Kaydı durdur"
            style={{
              width: 64,
              height: 64,
              borderRadius: radius.pill,
              backgroundColor: colors.danger,
              alignItems: "center",
              justifyContent: "center",
              marginTop: spacing.xl,
            }}
          >
            <View style={{ width: 22, height: 22, borderRadius: 5, backgroundColor: colors.onPrimary }} />
          </Pressable>
          <AppText variant="caption" color="textMuted" style={{ marginTop: spacing.md }}>
            {t("ui.voiceTapToStop")}
          </AppText>
        </View>
      )}
    </BottomSheet>
  );
}
