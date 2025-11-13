// components/EditFolderModal.js
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
import { FOLDER_ICONS } from "../utils/constants";
import { FirestoreService } from "../services/firestoreService";

export default function EditFolderModal({ 
  visible, 
  onClose, 
  onFolderUpdated,
  folder = null,
}) {
  const [folderName, setFolderName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("📁");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (folder && visible) {
      setFolderName(folder.name || "");
      setSelectedIcon(folder.icon || "📁");
    }
  }, [folder, visible]);

  const handleUpdateFolder = async () => {
    if (!folderName.trim()) {
      Alert.alert("Hata", "Lütfen klasör adı girin.");
      return;
    }

    if (!folder || !folder.id) {
      Alert.alert("Hata", "Klasör bilgisi eksik.");
      return;
    }

    if (folder.isDefault) {
      Alert.alert(
        "Uyarı", 
        "Varsayılan klasörün adı ve ikonu değiştirilemez."
      );
      return;
    }

    try {
      setLoading(true);
      
      const updates = {
        name: folderName.trim(),
        icon: selectedIcon,
        updatedAt: new Date().toISOString(),
      };

      await FirestoreService.updateCategory(folder.id, updates);
      
      Alert.alert("Başarılı", `"${folderName}" klasörü güncellendi!`);
      
      if (onFolderUpdated) {
        onFolderUpdated();
      }
      
      handleClose();
    } catch (error) {
      console.error("❌ Klasör güncellenemedi:", error);
      Alert.alert("Hata", "Klasör güncellenemedi: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFolderName("");
      setSelectedIcon("📁");
      onClose();
    }
  };

  const isDefaultFolder = folder?.isDefault === true;

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      transparent={true} 
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Klasörü Düzenle</Text>
            <TouchableOpacity onPress={handleClose} disabled={loading}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {isDefaultFolder && (
            <View style={styles.warningBox}>
              <Ionicons name="information-circle" size={20} color="#F59E0B" />
              <Text style={styles.warningText}>
                Varsayılan klasörün adı ve ikonu değiştirilemez.
              </Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.label}>Klasör Adı</Text>
            <TextInput
              style={[
                styles.input,
                isDefaultFolder && styles.inputDisabled,
              ]}
              placeholder="Örn: İş Kartları, Arkadaşlar..."
              placeholderTextColor={colors.secondaryText}
              value={folderName}
              onChangeText={setFolderName}
              maxLength={30}
              editable={!isDefaultFolder && !loading}
              autoFocus={!isDefaultFolder}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>İkon Seç</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.iconScroll}
            >
              {FOLDER_ICONS.map((icon, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.iconButton,
                    selectedIcon === icon && styles.iconButtonSelected,
                    isDefaultFolder && styles.iconButtonDisabled,
                  ]}
                  onPress={() => !isDefaultFolder && setSelectedIcon(icon)}
                  disabled={isDefaultFolder || loading}
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
                <Text style={styles.previewName}>
                  {folderName.trim() || folder?.name || "Klasör Adı"}
                </Text>
                <Text style={styles.previewCount}>
                  {folder?.cardCount || 0} kart
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={handleClose} 
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>İptal</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.button, 
                styles.updateButton,
                (loading || !folderName.trim() || isDefaultFolder) && styles.updateButtonDisabled,
              ]} 
              onPress={handleUpdateFolder} 
              disabled={loading || !folderName.trim() || isDefaultFolder}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={20} color="#fff" />
                  <Text style={styles.updateButtonText}>Güncelle</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { 
    flex: 1, 
    backgroundColor: "rgba(0, 0, 0, 0.7)", 
    justifyContent: "flex-end" 
  },
  modalContainer: { 
    backgroundColor: colors.background, 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20, 
    padding: 20, 
    paddingBottom: 40 
  },
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: 24 
  },
  title: { 
    fontSize: 20, 
    fontWeight: "700", 
    color: colors.text 
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: "#92400E",
    lineHeight: 18,
  },
  section: { 
    marginBottom: 24 
  },
  label: { 
    fontSize: 14, 
    fontWeight: "600", 
    color: colors.secondaryText, 
    marginBottom: 8 
  },
  input: { 
    backgroundColor: colors.cardBackground || "#1C1C1E", 
    color: colors.text, 
    fontSize: 16, 
    padding: 16, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: colors.border || "#2C2C2E" 
  },
  inputDisabled: {
    opacity: 0.5,
    color: colors.secondaryText,
  },
  iconScroll: { 
    flexDirection: "row" 
  },
  iconButton: { 
    width: 56, 
    height: 56, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: colors.cardBackground || "#1C1C1E", 
    borderRadius: 12, 
    marginRight: 8, 
    borderWidth: 2, 
    borderColor: "transparent" 
  },
  iconButtonSelected: { 
    borderColor: colors.primary, 
    backgroundColor: colors.primary + "20" 
  },
  iconButtonDisabled: {
    opacity: 0.5,
  },
  iconText: { 
    fontSize: 28 
  },
  preview: { 
    marginBottom: 24 
  },
  previewLabel: { 
    fontSize: 14, 
    fontWeight: "600", 
    color: colors.secondaryText, 
    marginBottom: 8 
  },
  previewCard: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: colors.cardBackground || "#1C1C1E", 
    padding: 16, 
    borderRadius: 12 
  },
  previewIcon: { 
    fontSize: 32, 
    marginRight: 12 
  },
  previewInfo: { 
    flex: 1 
  },
  previewName: { 
    fontSize: 16, 
    fontWeight: "600", 
    color: colors.text, 
    marginBottom: 4 
  },
  previewCount: { 
    fontSize: 12, 
    color: colors.secondaryText 
  },
  buttonContainer: { 
    flexDirection: "row", 
    gap: 12 
  },
  button: { 
    flex: 1, 
    flexDirection: "row",
    padding: 16, 
    borderRadius: 12, 
    alignItems: "center", 
    justifyContent: "center",
    gap: 8,
  },
  cancelButton: { 
    backgroundColor: colors.cardBackground || "#1C1C1E" 
  },
  cancelButtonText: { 
    fontSize: 16, 
    fontWeight: "600", 
    color: colors.text 
  },
  updateButton: { 
    backgroundColor: colors.primary 
  },
  updateButtonDisabled: {
    backgroundColor: colors.border || "#2C2C2E",
    opacity: 0.5,
  },
  updateButtonText: { 
    fontSize: 16, 
    fontWeight: "700", 
    color: "#fff" 
  },
});
