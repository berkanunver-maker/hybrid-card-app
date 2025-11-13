// components/MoveCardModal.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../utils/colors";

export default function MoveCardModal({
  visible,
  onClose,
  onMove,
  currentFolderId,
  folders = [],
  cardName = "",
}) {
  const [selectedFolderId, setSelectedFolderId] = useState(currentFolderId);
  const [loading, setLoading] = useState(false);

  const handleMove = async () => {
    if (!selectedFolderId || selectedFolderId === currentFolderId) {
      return;
    }

    try {
      setLoading(true);
      await onMove(selectedFolderId);
      setLoading(false);
      onClose();
    } catch (error) {
      console.error("❌ MoveCardModal error:", error);
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSelectedFolderId(currentFolderId);
      onClose();
    }
  };

  const availableFolders = folders
    .filter(folder => folder.id !== currentFolderId)
    .sort((a, b) => {
      if (a.isDefault) return -1;
      if (b.isDefault) return 1;
      return (a.name || "").localeCompare(b.name || "");
    });

  const currentFolder = folders.find(f => f.id === currentFolderId);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="folder-open" size={24} color={colors.primary} />
              <Text style={styles.title}>Klasör Seç</Text>
            </View>
            <TouchableOpacity onPress={handleClose} disabled={loading}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {cardName && (
            <View style={styles.cardInfo}>
              <Ionicons name="card" size={16} color={colors.secondaryText} />
              <Text style={styles.cardName} numberOfLines={1}>
                {cardName}
              </Text>
            </View>
          )}

          {currentFolder && (
            <View style={styles.currentFolderContainer}>
              <Text style={styles.label}>Şu anki klasör:</Text>
              <View style={styles.currentFolderCard}>
                <Text style={styles.currentFolderIcon}>{currentFolder.icon}</Text>
                <Text style={styles.currentFolderName}>{currentFolder.name}</Text>
              </View>
            </View>
          )}

          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>Taşınacak klasör</Text>
            <View style={styles.separatorLine} />
          </View>

          <ScrollView 
            style={styles.folderList}
            showsVerticalScrollIndicator={false}
          >
            {availableFolders.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="folder-open-outline" size={48} color={colors.secondaryText} />
                <Text style={styles.emptyText}>Başka klasör yok</Text>
              </View>
            ) : (
              availableFolders.map((folder) => (
                <TouchableOpacity
                  key={folder.id}
                  style={[
                    styles.folderItem,
                    selectedFolderId === folder.id && styles.folderItemSelected,
                  ]}
                  onPress={() => setSelectedFolderId(folder.id)}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <View style={styles.folderItemLeft}>
                    <View style={styles.radioButton}>
                      {selectedFolderId === folder.id && (
                        <View style={styles.radioButtonInner} />
                      )}
                    </View>
                    <Text style={styles.folderIcon}>{folder.icon}</Text>
                    <View style={styles.folderInfo}>
                      <Text style={styles.folderName}>{folder.name}</Text>
                      <Text style={styles.folderCount}>
                        {folder.cardCount || 0} kart
                      </Text>
                    </View>
                  </View>
                  {folder.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>Varsayılan</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>

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
                styles.moveButton,
                (!selectedFolderId || selectedFolderId === currentFolderId || loading) &&
                  styles.moveButtonDisabled,
              ]}
              onPress={handleMove}
              disabled={!selectedFolderId || selectedFolderId === currentFolderId || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                  <Text style={styles.moveButtonText}>Taşı</Text>
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
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  cardInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  cardName: {
    flex: 1,
    fontSize: 14,
    color: colors.secondaryText,
  },
  currentFolderContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.secondaryText,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  currentFolderCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardBackground || "#1C1C1E",
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  currentFolderIcon: {
    fontSize: 24,
  },
  currentFolderName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  separator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border || "#2C2C2E",
  },
  separatorText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.secondaryText,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  folderList: {
    maxHeight: 300,
    paddingHorizontal: 20,
  },
  folderItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.cardBackground || "#1C1C1E",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  folderItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "15",
  },
  folderItemLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border || "#2C2C2E",
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  folderIcon: {
    fontSize: 28,
  },
  folderInfo: {
    flex: 1,
  },
  folderName: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 2,
  },
  folderCount: {
    fontSize: 12,
    color: colors.secondaryText,
  },
  defaultBadge: {
    backgroundColor: colors.primary + "25",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: colors.secondaryText,
    marginTop: 12,
  },
  buttonContainer: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border || "#2C2C2E",
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
    backgroundColor: colors.cardBackground || "#1C1C1E",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  moveButton: {
    backgroundColor: colors.primary,
  },
  moveButtonDisabled: {
    backgroundColor: colors.border || "#2C2C2E",
    opacity: 0.5,
  },
  moveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});
