// components/CreateFolderModal.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../utils/colors";
import { FirestoreService } from "../services/firestoreService";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const FOLDER_ICONS = [
  "📁", "💼", "🏢", "🏍️", "🚗", "✈️", 
  "🏠", "🎓", "💻", "📱", "🎨", "🎮",
  "⚽", "🎵", "📚", "🍕", "☕", "🛍️",
  "💡", "🔧", "⚙️", "🎯", "🌟", "❤️"
];

export default function CreateFolderModal({ visible, onClose, onFolderCreated }) {
  const [folderName, setFolderName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("📁");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("✅ CreateFolderModal - User:", user.uid);
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      Alert.alert("Hata", "Lütfen klasör adı girin.");
      return;
    }

    if (!userId) {
      Alert.alert("Hata", "Kullanıcı girişi gerekli.");
      return;
    }

    try {
      setLoading(true);
      const newCategory = {
        name: folderName.trim(),
        icon: selectedIcon,
        color: colors.primary,
        cardCount: 0,
      };

      await FirestoreService.addCategory(userId, newCategory);
      Alert.alert("Başarılı", `"${folderName}" klasörü oluşturuldu!`);
      
      setFolderName("");
      setSelectedIcon("📁");
      
      if (onFolderCreated) {
        onFolderCreated();
      }
    } catch (error) {
      console.error("❌ Klasör oluşturulamadı:", error);
      Alert.alert("Hata", "Klasör oluşturulamadı: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFolderName("");
    setSelectedIcon("📁");
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Yeni Klasör Oluştur</Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Klasör Adı</Text>
            <TextInput
              style={styles.input}
              placeholder="Örn: İş Kartları, Arkadaşlar..."
              placeholderTextColor={colors.secondaryText}
              value={folderName}
              onChangeText={setFolderName}
              maxLength={30}
              autoFocus
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>İkon Seç</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconScroll}>
              {FOLDER_ICONS.map((icon, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.iconButton, selectedIcon === icon && styles.iconButtonSelected]}
                  onPress={() => setSelectedIcon(icon)}
                >
                  <Text style={styles.iconText}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.preview}>
            <Text style={styles.previewLabel}>Önizleme:</Text>
            <View style={styles.previewCard}>
              <Text style={styles.previewIcon}>{selectedIcon}</Text>
              <View style={styles.previewInfo}>
                <Text style={styles.previewName}>{folderName.trim() || "Klasör Adı"}</Text>
                <Text style={styles.previewCount}>0 kart</Text>
              </View>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={handleClose} disabled={loading}>
              <Text style={styles.cancelButtonText}>İptal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.createButton]} onPress={handleCreateFolder} disabled={loading || !folderName.trim()}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.createButtonText}>Oluştur</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.7)", justifyContent: "flex-end" },
  modalContainer: { backgroundColor: colors.background, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: 40 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  title: { fontSize: 20, fontWeight: "700", color: colors.text },
  section: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: "600", color: colors.secondaryText, marginBottom: 8 },
  input: { backgroundColor: colors.cardBackground || "#1C1C1E", color: colors.text, fontSize: 16, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border || "#2C2C2E" },
  iconScroll: { flexDirection: "row" },
  iconButton: { width: 56, height: 56, justifyContent: "center", alignItems: "center", backgroundColor: colors.cardBackground || "#1C1C1E", borderRadius: 12, marginRight: 8, borderWidth: 2, borderColor: "transparent" },
  iconButtonSelected: { borderColor: colors.primary, backgroundColor: colors.primary + "20" },
  iconText: { fontSize: 28 },
  preview: { marginBottom: 24 },
  previewLabel: { fontSize: 14, fontWeight: "600", color: colors.secondaryText, marginBottom: 8 },
  previewCard: { flexDirection: "row", alignItems: "center", backgroundColor: colors.cardBackground || "#1C1C1E", padding: 16, borderRadius: 12 },
  previewIcon: { fontSize: 32, marginRight: 12 },
  previewInfo: { flex: 1 },
  previewName: { fontSize: 16, fontWeight: "600", color: colors.text, marginBottom: 4 },
  previewCount: { fontSize: 12, color: colors.secondaryText },
  buttonContainer: { flexDirection: "row", gap: 12 },
  button: { flex: 1, padding: 16, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cancelButton: { backgroundColor: colors.cardBackground || "#1C1C1E" },
  cancelButtonText: { fontSize: 16, fontWeight: "600", color: colors.text },
  createButton: { backgroundColor: colors.primary },
  createButtonText: { fontSize: 16, fontWeight: "700", color: "#fff" },
});