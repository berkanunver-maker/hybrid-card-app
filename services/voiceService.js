// services/voiceService.js
import { Audio } from "expo-av";
import { ApiService } from "./api";

export const voiceService = {
  // 🎙️ Ses kaydı başlat
  recordAudio: async () => {
    try {
      console.log("🎙️ Ses kaydı başlatılıyor...");

      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) throw new Error("Mikrofon izni verilmedi");

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        staysActiveInBackground: false,
        playThroughEarpieceAndroid: false,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      await recording.startAsync();

      console.log("🎙️ Ses kaydı başladı...");
      return recording;
    } catch (error) {
      console.error("❌ voiceService recordAudio error:", error);
      throw error;
    }
  },

  // 🛑 Ses kaydını durdur
  stopRecording: async (recording) => {
    try {
      console.log("🛑 Ses kaydı durduruluyor...");
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log("✅ Ses kaydı tamam:", uri);
      return uri;
    } catch (error) {
      console.error("❌ voiceService stopRecording error:", error);
      throw error;
    }
  },

  // 🎧 Ses dosyasını oynat (YENİ!)
  playAudio: async (audioUri) => {
    try {
      console.log("🎧 Ses oynatılıyor:", audioUri);

      // Ses modunu ayarla
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        staysActiveInBackground: false,
        playThroughEarpieceAndroid: false,
      });

      // Sound objesi oluştur
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true } // Otomatik oynat
      );

      console.log("✅ Ses oynatılıyor...");
      
      // Ses bitince temizle
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          console.log("✅ Ses oynatma tamamlandı");
          sound.unloadAsync();
        }
      });

      return sound;
    } catch (error) {
      console.error("❌ voiceService playAudio error:", error);
      throw error;
    }
  },

  // ⏹️ Ses oynatmayı durdur (YENİ!)
  stopAudio: async (sound) => {
    try {
      if (sound) {
        console.log("⏹️ Ses durduruluyor...");
        await sound.stopAsync();
        await sound.unloadAsync();
        console.log("✅ Ses durduruldu");
      }
    } catch (error) {
      console.error("❌ voiceService stopAudio error:", error);
      throw error;
    }
  },

  // 🎤 Kayıt durumunu kontrol et (YENİ!)
  getRecordingStatus: async (recording) => {
    try {
      const status = await recording.getStatusAsync();
      return {
        isRecording: status.isRecording,
        durationMillis: status.durationMillis,
      };
    } catch (error) {
      console.error("❌ voiceService getRecordingStatus error:", error);
      return { isRecording: false, durationMillis: 0 };
    }
  },

  // 📡 Ses transkribe et
  transcribeAudio: async (audioUri) => {
    try {
      console.log("📡 Transcribe API çağrısı başlatıldı:", audioUri);
      const result = await ApiService.transcribeAudio(audioUri);
      console.log("✅ Voice transcription tamamlandı:", result);
      return result;
    } catch (error) {
      console.error("❌ voiceService transcribeAudio error:", error.message);
      return {
        status: "mock",
        text:
          "Mock transcribe sonucu: Ses analizi başarısız oldu, örnek metin gösteriliyor.",
      };
    }
  },
};

export default voiceService;