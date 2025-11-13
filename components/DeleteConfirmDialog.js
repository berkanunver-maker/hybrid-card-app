// components/DeleteConfirmDialog.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../utils/colors";

export default function DeleteConfirmDialog({
  visible,
  onClose,
  onConfirm,
  title = "Silme Onayı",
  message = "Bu işlemi geri alamazsınız.",
  itemName = "",
  itemCount = 0,
  showMoveOption = false,
  confirmText = "Sil",
  cancelText = "İptal",
}) {
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState("delete");

  const handleConfirm = async () => {
    try {
      setLoading(true);
      
      if (showMoveOption) {
        await onConfirm(selectedOption === "move");
      } else {
        await onConfirm();
      }
      
      setLoading(false);
      onClose();
    } catch (error) {
      console.error("❌ DeleteConfirmDialog error:", error);
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSelectedOption("delete");
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.dialogContainer}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="warning" size={32} color="#EF4444" />
            </View>
            <Text style={styles.title}>{title}</Text>
          </View>

          <View style={styles.content}>
            {itemName && (
              <Text style={styles.itemName}>"{itemName}"</Text>
            )}
            <Text style={styles.message}>{message}</Text>
            
            {itemCount > 0 && (
              <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={20} color={colors.primary} />
                <Text style={styles.infoText}>
                  Bu klasörde <Text style={styles.infoTextBold}>{itemCount} kart</Text> bulunuyor.
                </Text>
              </View>
            )}

            {showMoveOption && itemCount > 0 && (
              <View style={styles.optionsContainer}>
                <Text style={styles.optionsLabel}>Kartlar ne olsun?</Text>
                
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    selectedOption === "move" && styles.optionButtonSelected,
                  ]}
                  onPress={() => setSelectedOption("move")}
                  disabled={loading}
                >
                  <View style={styles.radioButton}>
                    {selectedOption === "move" && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={styles.optionTitle}>
                      Kartları "Genel" klasörüne taşı
                    </Text>
                    <Text style={styles.optionDescription}>
                      Kartlar korunur, sadece klasör silinir
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    selectedOption === "delete" && styles.optionButtonSelected,
                  ]}
                  onPress={() => setSelectedOption("delete")}
                  disabled={loading}
                >
                  <View style={styles.radioButton}>
                    {selectedOption === "delete" && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                  <View style={styles.optionContent}>
                    <Text style={[styles.optionTitle, styles.dangerText]}>
                      Kartlarla birlikte sil
                    </Text>
                    <Text style={styles.optionDescription}>
                      Tüm kartlar kalıcı olarak silinir
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="trash" size={18} color="#fff" />
                  <Text style={styles.deleteButtonText}>{confirmText}</Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  dialogContainer: {
    backgroundColor: colors.background,
    borderRadius: 20,
    width: "100%",
    maxWidth: 400,
    overflow: "hidden",
  },
  header: {
    alignItems: "center",
    paddingTop: 32,
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  content: {
    padding: 24,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: "center",
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary + "15",
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
  infoTextBold: {
    fontWeight: "700",
  },
  optionsContainer: {
    marginTop: 24,
  },
  optionsLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: colors.cardBackground || "#1C1C1E",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionButtonSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "15",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border || "#2C2C2E",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
    marginRight: 12,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 12,
    color: colors.secondaryText,
    lineHeight: 16,
  },
  dangerText: {
    color: "#EF4444",
  },
  buttonContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    backgroundColor: colors.cardBackground || "#1C1C1E",
  },
  button: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: colors.border || "#2C2C2E",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  deleteButton: {
    backgroundColor: "#EF4444",
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
