// screens/CameraScreen.js - FIXED VERSION
import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { colors } from "../utils/colors";
import { uploadFile } from "../services/storageService";
import { DocumentAIService } from "../services/documentAIService";
import voiceService from "../services/voiceService";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function CameraScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [userId, setUserId] = useState(null);

  const auth = getAuth();

  // 🔧 FIX: Auth state'i düzgün takip et
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("✅ User authenticated:", user.uid);
        setUserId(user.uid);
      } else {
        console.log("⚠️ No user authenticated");
        setUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // 📁 Route'dan kategori bilgisi al (FolderScreen'den geliyorsa)
  const { categoryId, categoryName } = route.params || {};

  // 📸 Fotoğraf çekimi
  const handleCapture = async () => {
    if (!cameraRef.current) return;

    try {
      setLoading(true);
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (!photo?.uri) throw new Error(t('screens.camera.errors.photoCaptureFailed'));

      // ✅ Fotoğrafı göster ama işleme başlama
      setCapturedPhoto(photo.uri);
      setLoading(false); // Loading'i kapat ki butonlar görünsün

    } catch (error) {
      console.error("📸 Kamera hatası:", error);
      Alert.alert(t('screens.camera.errors.errorTitle'), t('screens.camera.errors.photoCaptureFailed'));
      setLoading(false);
    }
  };

  // ✅ Kullanıcı fotoğrafı onayladı
  const handleConfirmPhoto = async () => {
    // 🔧 FIX: userId kontrolü ekle
    if (!userId) {
      Alert.alert(t('screens.camera.errors.errorTitle'), t('screens.camera.errors.notLoggedIn'));
      navigation.navigate("Login");
      return;
    }

    setStatusText(t('screens.camera.status.analyzing'));
    await processImage(capturedPhoto);
  };

  // ❌ Kullanıcı tekrar çekmek istiyor
  const handleRetakePhoto = () => {
    setCapturedPhoto(null);
    setStatusText("");
  };

  // 🧠 Görseli işle, AI analizi
  const processImage = async (uri) => {
    try {
      setLoading(true);
      setStatusText(t('screens.camera.status.uploading'));

      // 1️⃣ Görseli yükle
      const upload = await uploadFile({
        uri,
        path: `cards/${Date.now()}.jpg`,
      });
      console.log("📸 Firebase yükleme tamam:", upload.url);

      // 2️⃣ Document AI analizi
      setStatusText(t('screens.camera.status.aiAnalyzing'));
      const result = await DocumentAIService.analyzeImageUrl({
        image_url: upload.url,
      });

      console.log("🧾 [DEBUG] analyzeImageUrl full response:", result);

      if (!result) throw new Error(t('screens.camera.errors.analysisFailed'));

      // 3️⃣ Kart verisini hazırla
      const fields = result.fields || {};
      const cardData = {
        imageUrl: upload.url,
        cardId: result.card_id || "unknown",
        qaScore: typeof result.qa_score === "number" ? result.qa_score : 0,
        qaStatus: result.qa_status || "unknown",
        missingFields: Array.isArray(result.missing_fields)
          ? result.missing_fields
          : [],
        status: result.status || "pending",
        message: result.message || "",
        createdAt: new Date().toISOString(),
        userId: userId, // 🔧 FIX: userId artık garanti
        
        // ✅ Kategori bilgisi varsa ekle
        ...(categoryId && {
          categoryId: categoryId,
          categoryName: categoryName,
        }),
        
        // ✅ Fields'ı hem nested hem de spread olarak kaydet
        fields: fields,
        ...fields,
      };

      console.log("✅ cardData oluşturuldu, userId:", userId);

      setStatusText(t('screens.camera.status.complete'));
      setLoading(false);

      // 4️⃣ Ses notu sor
      Alert.alert(t('screens.camera.voicePrompt.title'), t('screens.camera.voicePrompt.message'), [
        {
          text: t('screens.camera.voicePrompt.no'),
          style: "cancel",
          onPress: () => {
            // ✅ Ses notu olmadan CardDetail'e git
            navigateToCardDetail(cardData);
          },
        },
        {
          text: t('screens.camera.voicePrompt.yes'),
          onPress: async () => {
            await handleVoiceRecord(cardData);
          },
        },
      ]);
    } catch (err) {
      console.error("🔥 processImage hata:", err);
      setLoading(false);
      Alert.alert(t('screens.camera.errors.errorTitle'), t('screens.camera.errors.analysisError'));
    }
  };

  // 🎙️ Ses kaydı işlemleri
  const handleVoiceRecord = async (cardData) => {
    try {
      setLoading(true);
      setStatusText(t('screens.camera.status.voiceStarting'));
      const recording = await voiceService.recordAudio();
      setStatusText(t('screens.camera.status.voiceRecording'));
      await new Promise((resolve) => setTimeout(resolve, 10000));
      const uri = await voiceService.stopRecording(recording);

      setStatusText(t('screens.camera.status.voiceUploading'));
      const upload = await uploadFile({
        uri: uri,
        path: `voices/${Date.now()}.m4a`,
      });

      setStatusText(t('screens.camera.status.voiceAnalyzing'));
      const transcript = await voiceService.transcribeAudio(uri);

      console.log("🎙️ [DEBUG] transcribeAudio response:", transcript);

      const voiceNote = {
        text: transcript.text || transcript.voice_note?.text || t('screens.camera.status.voiceRecorded'),
        audioUrl: upload.url,
        language: transcript.language || transcript.voice_note?.language || "tr-tr",
        duration: transcript.duration || transcript.voice_note?.duration || 10,
      };

      console.log("🎙️ [DEBUG] Oluşturulan voice_note:", voiceNote);

      const updatedCard = {
        ...cardData,
        voice_note: voiceNote,
      };

      setLoading(false);

      // ✅ Ses notu ile CardDetail'e git
      navigateToCardDetail(updatedCard);

    } catch (error) {
      console.error("🎙️ Ses kaydı hatası:", error);
      setLoading(false);
      Alert.alert(t('screens.camera.errors.errorTitle'), t('screens.camera.errors.voiceError'));
    }
  };

  // ✅ CardDetail'e yönlendir (KAYDETMEDEN)
  const navigateToCardDetail = (cardData) => {
    navigation.navigate("CardDetail", {
      cardData: cardData,
      isNewCard: true, // ← Bu yeni kart, henüz kaydedilmedi
    });
  };

  // 🔐 Kamera izinleri
  if (!permission) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>{t('screens.camera.permissions.checking')}</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>{t('screens.camera.permissions.required')}</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>{t('screens.camera.permissions.grant')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 🎥 Kamera arayüzü
  return (
    <View style={styles.container}>
      {capturedPhoto ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedPhoto }} style={styles.preview} />
          
          {loading ? (
            // ⏳ İşlem devam ediyor
            <View style={styles.loaderBox}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.status}>{statusText}</Text>
            </View>
          ) : (
            // ✅ Önizleme: Tekrar Çek veya Kullan
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.retakeBtn}
                onPress={handleRetakePhoto}
              >
                <Ionicons name="close-circle" size={24} color="#fff" />
                <Text style={styles.retakeText}>{t('screens.camera.buttons.retake')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleConfirmPhoto}
              >
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                <Text style={styles.confirmText}>{t('screens.camera.buttons.use')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.cameraWrapper}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {categoryName ? `${categoryName}` : t('screens.camera.title')}
            </Text>
            <View style={{ width: 40 }} />
          </View>

          <CameraView ref={cameraRef} style={styles.camera} facing="back" />
          
          <View style={styles.bottomControls}>
            {loading ? (
              <ActivityIndicator color="#fff" size="large" />
            ) : (
              <TouchableOpacity
                style={styles.captureBtn}
                onPress={handleCapture}
              >
                <Ionicons name="camera" size={36} color={colors.background} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

// 🎨 Stiller
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  cameraWrapper: { flex: 1, position: "relative" },
  camera: { flex: 1 },
  
  // Header
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  
  bottomControls: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    alignItems: "center",
  },
  captureBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  previewContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  preview: { width: "90%", height: "70%", borderRadius: 12 },
  loaderBox: { alignItems: "center", marginTop: 20 },
  status: { color: "#fff", marginTop: 8 },
  
  // ✅ Önizleme butonları
  actionButtons: {
    flexDirection: "row",
    marginTop: 20,
    gap: 20,
  },
  retakeBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF3B30",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  retakeText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#34C759",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  confirmText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  text: { color: colors.text, marginBottom: 20 },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
});