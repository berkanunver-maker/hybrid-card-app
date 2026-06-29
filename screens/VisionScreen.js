// screens/VisionScreen.js
import React, { useState, useMemo } from "react";
import { View, Pressable, Image, ScrollView, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "../utils/theme";
import { useTranslation } from "../i18n/I18nProvider";
import { VisionService } from "../services/visionService";
import { FeedbackModal } from "../components";
import {
  ScreenContainer,
  AppText,
  Button,
  Loader,
  SectionHeader,
  Icon,
} from "../components/ui";

export default function VisionScreen() {
  const { colors, spacing, radius } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(
    () => createStyles(colors, spacing, radius),
    [colors, spacing, radius]
  );

  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Görsel seçimi
  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // Görsel analizi
  const handleAnalyze = async () => {
    if (!imageUri) {
      alert(t("tools.visionSelectImageAlert"));
      return;
    }

    try {
      setLoading(true);
      const response = await VisionService.extractText(imageUri);
      setAnalysisResult(response || t("tools.noResult"));
      setModalVisible(true);
    } catch (error) {
      setAnalysisResult(t("tools.visionError"));
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
        <AppText variant="title">{t("tools.visionTitle")}</AppText>
        <AppText
          variant="body"
          color="textSecondary"
          style={{ marginTop: spacing.xs, marginBottom: spacing.xl }}
        >
          {t("tools.visionSubtitle")}
        </AppText>

        <SectionHeader title={t("tools.imageSection")} />

        {/* Görsel Önizleme */}
        <Pressable
          style={({ pressed }) => [styles.imageBox, pressed && { opacity: 0.92 }]}
          onPress={handlePickImage}
          accessibilityRole="button"
          accessibilityLabel={imageUri ? "Görseli değiştir" : "Görsel seç"}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          ) : (
            <View style={styles.placeholder}>
              <View style={styles.placeholderIcon}>
                <Icon name="image-outline" size={28} color={colors.primary} />
              </View>
              <AppText variant="bodyStrong" style={{ marginTop: spacing.md }}>
                {t("tools.selectImage")}
              </AppText>
              <AppText variant="caption" color="textMuted" style={{ marginTop: 2 }}>
                {t("tools.selectImageHint")}
              </AppText>
            </View>
          )}
        </Pressable>

        <Button
          title={t("tools.analyze")}
          icon="scan-outline"
          onPress={handleAnalyze}
          disabled={!imageUri}
          loading={loading}
          style={{ marginTop: spacing.xl }}
        />
      </ScrollView>

      {/* Loader */}
      <Loader visible={loading} text={t("tools.visionLoading")} />

      {/* Feedback Modal */}
      <FeedbackModal
        visible={modalVisible}
        title={t("tools.ocrResult")}
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
    imageBox: {
      borderWidth: 1.4,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      height: 220,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    placeholder: {
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.lg,
    },
    placeholderIcon: {
      width: 56,
      height: 56,
      borderRadius: radius.pill,
      backgroundColor: colors.primaryMuted,
      alignItems: "center",
      justifyContent: "center",
    },
    imagePreview: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
  });
