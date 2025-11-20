// screens/SelectCategoryModal.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { colors } from "../utils/colors";
import { FirestoreService } from "../services/firestoreService";
import { getAuth } from "firebase/auth";

export default function SelectCategoryModal({ visible, onClose, onSelect, cardData }) {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryIcon, setNewCategoryIcon] = useState("📁");

  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  const iconOptions = ["📁", "🏍️", "💼", "🎯", "🌟", "🎨", "⚡", "🚀", "🏆", "💡"];

  // Kategorileri yükle
  useEffect(() => {
    if (visible && userId) {
      loadCategories();
    }
  }, [visible, userId]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const fetchedCategories = await FirestoreService.getUserCategories(userId);
      setCategories(fetchedCategories);
    } catch (error) {
      console.error("❌ Kategoriler yüklenemedi:", error);
      Alert.alert(t('common.error'), t('selectCategory.errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  // Yeni kategori oluştur
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert(t('common.warning'), t('selectCategory.errors.nameRequired'));
      return;
    }

    try {
      setLoading(true);
      const newCategory = await FirestoreService.addCategory(userId, {
        name: newCategoryName.trim(),
        icon: newCategoryIcon,
        color: colors.primary,
        order: categories.length + 1,
      });

      setCategories([...categories, newCategory]);
      setShowNewCategory(false);
      setNewCategoryName("");
      setNewCategoryIcon("📁");
      Alert.alert(t('common.success'), t('selectCategory.success.created'));
    } catch (error) {
      console.error("❌ Kategori oluşturulamadı:", error);
      Alert.alert(t('common.error'), t('selectCategory.errors.createFailed'));
    } finally {
      setLoading(false);
    }
  };

  // Kategori seç ve kaydet
  const handleSave = async () => {
    if (!selectedCategory) {
      Alert.alert(t('common.warning'), t('selectCategory.errors.folderRequired'));
      return;
    }

    try {
      setLoading(true);

      // Kartı seçilen kategoriye ekle
      const updatedCard = {
        ...cardData,
        categoryId: selectedCategory.id,
        categoryName: selectedCategory.name,
        userId,
      };

      const savedCard = await FirestoreService.addCard(updatedCard);

      onSelect(selectedCategory, savedCard);
      onClose();
    } catch (error) {
      console.error("❌ Kart kaydedilemedi:", error);
      Alert.alert(t('common.error'), t('selectCategory.errors.saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  // Kategori render
  const renderCategory = ({ item }) => {
    const isSelected = selectedCategory?.id === item.id;
    return (
      <TouchableOpacity
        style={[styles.categoryItem, isSelected && styles.categoryItemSelected]}
        onPress={() => setSelectedCategory(item)}
      >
        <View style={styles.categoryLeft}>
          <Text style={styles.categoryIcon}>{item.icon}</Text>
          <View>
            <Text style={styles.categoryName}>{item.name}</Text>
            <Text style={styles.categoryCount}>{t('selectCategory.cardCount', { count: item.cardCount || 0 })}</Text>
          </View>
        </View>
        {isSelected && <Ionicons name="checkmark-circle" size={24} color={colors.primary} />}
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{t('selectCategory.title')}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : showNewCategory ? (
            // Yeni Kategori Formu
            <View style={styles.newCategoryForm}>
              <Text style={styles.formTitle}>{t('selectCategory.createNewFolder')}</Text>

              <TextInput
                style={styles.input}
                placeholder={t('selectCategory.folderNamePlaceholder')}
                placeholderTextColor={colors.secondaryText}
                value={newCategoryName}
                onChangeText={setNewCategoryName}
              />

              <Text style={styles.iconLabel}>{t('selectCategory.iconSelectLabel')}</Text>
              <View style={styles.iconGrid}>
                {iconOptions.map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.iconOption,
                      newCategoryIcon === icon && styles.iconOptionSelected,
                    ]}
                    onPress={() => setNewCategoryIcon(icon)}
                  >
                    <Text style={styles.iconOptionText}>{icon}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.formButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowNewCategory(false);
                    setNewCategoryName("");
                    setNewCategoryIcon("📁");
                  }}
                >
                  <Text style={styles.cancelButtonText}>{t('selectCategory.cancelButton')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.createButton} onPress={handleCreateCategory}>
                  <Text style={styles.createButtonText}>{t('selectCategory.createButton')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            // Kategori Listesi
            <>
              <FlatList
                data={categories}
                keyExtractor={(item) => item.id}
                renderItem={renderCategory}
                contentContainerStyle={styles.list}
                ListFooterComponent={
                  <TouchableOpacity
                    style={styles.newCategoryButton}
                    onPress={() => setShowNewCategory(true)}
                  >
                    <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
                    <Text style={styles.newCategoryText}>{t('selectCategory.createNewFolder')}</Text>
                  </TouchableOpacity>
                }
              />

              {/* Kaydet Butonu */}
              <TouchableOpacity
                style={[styles.saveButton, !selectedCategory && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={!selectedCategory}
              >
                <Text style={styles.saveButtonText}>{t('selectCategory.saveButton')}</Text>
              </TouchableOpacity>
            </>
          )}
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
  modal: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border || "#333",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  loadingContainer: {
    padding: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    padding: 20,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: colors.cardBackground || "#1C1C1E",
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  categoryItemSelected: {
    borderColor: colors.primary,
  },
  categoryLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  categoryIcon: {
    fontSize: 32,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 12,
    color: colors.secondaryText,
  },
  newCategoryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: colors.cardBackground || "#1C1C1E",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: "dashed",
    gap: 8,
  },
  newCategoryText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },
  saveButton: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 16,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  newCategoryForm: {
    padding: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 20,
  },
  input: {
    backgroundColor: colors.cardBackground || "#1C1C1E",
    padding: 16,
    borderRadius: 12,
    color: colors.text,
    fontSize: 16,
    marginBottom: 20,
  },
  iconLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 12,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  iconOption: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.cardBackground || "#1C1C1E",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "transparent",
  },
  iconOptionSelected: {
    borderColor: colors.primary,
  },
  iconOptionText: {
    fontSize: 24,
  },
  formButtons: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.cardBackground || "#1C1C1E",
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  createButton: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: "center",
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
});