// screens/CameraScreen.js
import React, { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { View, Image, Alert, Linking, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "../utils/theme";
import { uploadFile } from "../services/storageService";
import { DocumentAIService } from "../services/documentAIService";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import NetInfo from "@react-native-community/netinfo";
import { ScreenContainer, AppText, Button, EmptyState, Loader, Icon, VoiceRecorder } from "../components/ui";
import { enqueueCard } from "../services/offlineQueueService";
import { useOfflineQueue } from "../context/OfflineQueueProvider";
import { useTranslation } from "../i18n/I18nProvider";

export default function CameraScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const { colors, spacing, radius } = useTheme();
  const styles = useMemo(() => createStyles(colors, spacing, radius), [colors, spacing, radius]);
  const { refresh: refreshQueue } = useOfflineQueue();

  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [userId, setUserId] = useState(null);
  const [permDenied, setPermDenied] = useState(false);
  const [voiceRecVisible, setVoiceRecVisible] = useState(false);
  const [voiceMode, setVoiceMode] = useState("online");
  const [pendingCardData, setPendingCardData] = useState(null);
  const [pendingOfflineUri, setPendingOfflineUri] = useState(null);
  const autoLaunched = useRef(false);

  const auth = getAuth();

  // Auth state'i takip et
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user ? user.uid : null);
    });
    return () => unsubscribe();
  }, []);

  // Route'dan kategori bilgisi al (FolderScreen'den geliyorsa)
  const { categoryId, categoryName } = route.params || {};

  // 📷 Telefonun kendi kamerasını aç (sistem kamerası — daha net çekim)
  const launchCamera = useCallback(async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        setPermDenied(true);
        return;
      }
      setPermDenied(false);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.85,
        allowsEditing: false,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        setStatusText("");
        setCapturedPhoto(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert(t("common.error"), t("camera.cameraOpenError"));
    }
  }, []);

  // 🖼️ Galeriden seç (yedek)
  const pickFromGallery = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.85,
        allowsEditing: false,
      });
      if (!result.canceled && result.assets?.[0]?.uri) {
        setStatusText("");
        setCapturedPhoto(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert(t("common.error"), t("camera.galleryOpenError"));
    }
  }, []);

  // Ekrana girince kamerayı otomatik aç (hızlı akış)
  useEffect(() => {
    if (!autoLaunched.current) {
      autoLaunched.current = true;
      launchCamera();
    }
  }, [launchCamera]);

  // Kullanıcı fotoğrafı onayladı
  const handleConfirmPhoto = async () => {
    if (!userId) {
      Alert.alert(t("common.error"), t("camera.notLoggedIn"));
      navigation.navigate("Login");
      return;
    }
    // Çevrimiçi mi? Değilse kuyruğa al.
    const net = await NetInfo.fetch();
    const online = net.isConnected && net.isInternetReachable !== false;
    if (!online) {
      handleOfflineCapture(capturedPhoto);
      return;
    }
    setStatusText(t("camera.captured"));
    await processImage(capturedPhoto);
  };

  // Çevrimdışı: fotoğraf (+ses) yerel kuyruğa
  const enqueueAndGo = async (imageUri, audioUri) => {
    try {
      await enqueueCard({ userId, imageUri, audioUri, categoryId, categoryName });
      await refreshQueue();
      setLoading(false);
      Alert.alert(
        t("camera.queuedTitle"),
        t("camera.queuedMessage"),
        [{ text: t("common.ok"), onPress: () => navigation.navigate("Main") }]
      );
    } catch (e) {
      setLoading(false);
      Alert.alert(t("common.error"), t("camera.queueError"));
    }
  };

  const handleOfflineCapture = (imageUri) => {
    Alert.alert(
      t("camera.offlineTitle"),
      t("camera.offlineMessage"),
      [
        { text: t("camera.cardOnly"), onPress: () => enqueueAndGo(imageUri, null) },
        {
          text: t("camera.addVoiceNote"),
          onPress: () => {
            setPendingOfflineUri(imageUri);
            setVoiceMode("offline");
            setVoiceRecVisible(true);
          },
        },
      ]
    );
  };

  // Tekrar çek
  const handleRetakePhoto = () => {
    setCapturedPhoto(null);
    setStatusText("");
    launchCamera();
  };

  // Görseli işle, AI analizi
  const processImage = async (uri) => {
    try {
      setLoading(true);
      setStatusText(t("camera.uploading"));

      const upload = await uploadFile({
        uri,
        path: `cards/${userId}/${Date.now()}.jpg`,
      });

      setStatusText(t("camera.analyzing"));
      const result = await DocumentAIService.analyzeImageUrl({
        image_url: upload.url,
      });

      if (!result) throw new Error("Analiz sonucu alınamadı.");

      const fields = result.fields || {};
      const cardData = {
        imageUrl: upload.url,
        cardId: result.card_id || "unknown",
        qaScore: typeof result.qa_score === "number" ? result.qa_score : 0,
        qaStatus: result.qa_status || "unknown",
        missingFields: Array.isArray(result.missing_fields) ? result.missing_fields : [],
        status: result.status || "pending",
        message: result.message || "",
        createdAt: new Date().toISOString(),
        userId: userId,
        ...(categoryId && { categoryId: categoryId, categoryName: categoryName }),
        fields: fields,
        ...fields,
      };

      setStatusText(t("camera.analysisDone"));
      setLoading(false);

      Alert.alert(t("camera.voiceTitle"), t("camera.voiceMessage"), [
        {
          text: t("camera.no"),
          style: "cancel",
          onPress: () => navigateToCardDetail(cardData),
        },
        {
          text: t("camera.yes"),
          onPress: () => {
            setPendingCardData(cardData);
            setVoiceMode("online");
            setVoiceRecVisible(true);
          },
        },
      ]);
    } catch (err) {
      setLoading(false);
      Alert.alert(t("common.error"), t("camera.analysisError"));
    }
  };

  // Kaydedici tamamlandı
  const onVoiceComplete = (result) => {
    setVoiceRecVisible(false);
    if (voiceMode === "online") {
      navigateToCardDetail({ ...(pendingCardData || {}), voice_note: result });
    } else if (pendingOfflineUri) {
      enqueueAndGo(pendingOfflineUri, result?.uri || null);
    }
  };

  // Kaydedici kapatıldı (ses eklemeden devam)
  const onVoiceClose = () => {
    setVoiceRecVisible(false);
    if (voiceMode === "online") {
      if (pendingCardData) navigateToCardDetail(pendingCardData);
    } else if (pendingOfflineUri) {
      enqueueAndGo(pendingOfflineUri, null);
    }
  };

  // CardDetail'e yönlendir (KAYDETMEDEN)
  const navigateToCardDetail = (cardData) => {
    navigation.navigate("CardDetail", { cardData: cardData, isNewCard: true });
  };

  // ── Fotoğraf önizleme + işleme ──
  if (capturedPhoto) {
    return (
      <View style={styles.container}>
        <View style={styles.previewContainer}>
          <Image
            source={{ uri: capturedPhoto }}
            style={styles.preview}
            accessibilityLabel="Çekilen kartvizit fotoğrafı"
          />
          {loading ? (
            <View style={styles.loaderBox} accessibilityLiveRegion="polite">
              <AppText variant="body" style={{ color: colors.onPrimary, textAlign: "center" }}>
                {statusText}
              </AppText>
            </View>
          ) : (
            <View style={styles.actionButtons}>
              <Button
                title={t("camera.retake")}
                icon="camera-reverse"
                variant="secondary"
                fullWidth={false}
                onPress={handleRetakePhoto}
                style={styles.actionButton}
              />
              <Button
                title={t("camera.use")}
                icon="checkmark-circle"
                fullWidth={false}
                onPress={handleConfirmPhoto}
                style={styles.actionButton}
              />
            </View>
          )}
        </View>
        <Loader visible={loading} text={statusText} />
        <VoiceRecorder
          visible={voiceRecVisible}
          onClose={onVoiceClose}
          onComplete={onVoiceComplete}
          userId={userId}
          transcribe={voiceMode === "online"}
        />
      </View>
    );
  }

  // ── İzin reddedildi ──
  if (permDenied) {
    return (
      <ScreenContainer padded>
        <View style={styles.center}>
          <EmptyState
            icon="camera-outline"
            title={t("camera.permTitle")}
            description={t("camera.permDescription")}
            actionLabel={t("camera.openSettings")}
            onAction={() => Linking.openSettings()}
          />
          <Button
            title={t("common.retry")}
            variant="ghost"
            onPress={launchCamera}
            style={{ marginTop: spacing.sm }}
            fullWidth={false}
          />
        </View>
      </ScreenContainer>
    );
  }

  // ── Giriş ekranı (kamera/galeri seçimi) ──
  return (
    <ScreenContainer padded edges={["top", "bottom"]}>
      <View style={styles.intro}>
        <View style={styles.introIcon}>
          <Icon name="scan-outline" size={40} color={colors.primary} />
        </View>
        <AppText variant="title" style={{ textAlign: "center", marginTop: spacing.lg }}>
          {categoryName ? categoryName : t("camera.scanTitle")}
        </AppText>
        <AppText
          variant="body"
          color="textMuted"
          style={{ textAlign: "center", marginTop: spacing.sm, maxWidth: 300 }}
        >
          {t("camera.scanDescription")}
        </AppText>

        <View style={styles.introButtons}>
          <Button title={t("camera.takePhoto")} icon="camera" onPress={launchCamera} />
          <Button
            title={t("camera.pickFromGallery")}
            icon="images-outline"
            variant="secondary"
            onPress={pickFromGallery}
            style={{ marginTop: spacing.md }}
          />
          <Button
            title={t("camera.addManual")}
            icon="create-outline"
            variant="ghost"
            onPress={() =>
              navigation.navigate("AddContact", { categoryId, categoryName })
            }
            style={{ marginTop: spacing.sm }}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const createStyles = (colors, spacing, radius) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.overlayCamera },

    center: { flex: 1, alignItems: "center", justifyContent: "center" },

    // Giriş ekranı
    intro: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingBottom: spacing.xxxxl,
    },
    introIcon: {
      width: 88,
      height: 88,
      borderRadius: radius.pill,
      backgroundColor: colors.primaryMuted,
      alignItems: "center",
      justifyContent: "center",
    },
    introButtons: {
      alignSelf: "stretch",
      marginTop: spacing.xxxl,
    },

    // Önizleme
    previewContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.overlayCamera,
    },
    preview: { width: "90%", height: "70%", borderRadius: radius.md },
    loaderBox: { alignItems: "center", marginTop: spacing.xl, paddingHorizontal: spacing.xl },
    actionButtons: {
      flexDirection: "row",
      marginTop: spacing.xl,
      gap: spacing.lg,
    },
    actionButton: { minWidth: 150, justifyContent: "center" },
  });
