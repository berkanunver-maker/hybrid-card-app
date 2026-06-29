// screens/SelectCategoryModal.js
import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Pressable,
  FlatList,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useTheme } from "../utils/theme";
import { useTranslation } from "../i18n/I18nProvider";
import { FirestoreService } from "../services/firestoreService";
import { getAuth } from "firebase/auth";
import { BottomSheet, AppText, Input, Button, Icon } from "../components/ui";

export default function SelectCategoryModal({ visible, onClose, onSelect, cardData }) {
  const { colors, spacing, radius } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(
    () => createStyles(colors, spacing, radius),
    [colors, spacing, radius]
  );

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
      Alert.alert(t("common.error"), t("modals.categoriesLoadError"));
    } finally {
      setLoading(false);
    }
  };

  // Yeni kategori oluştur
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert(t("modals.warning"), t("modals.enterCategoryName"));
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
      Alert.alert(t("common.success"), t("modals.folderCreated"));
    } catch (error) {
      Alert.alert(t("common.error"), t("modals.categoryCreateError"));
    } finally {
      setLoading(false);
    }
  };

  // Kategori seç ve kaydet
  const handleSave = async () => {
    if (!selectedCategory) {
      Alert.alert(t("modals.warning"), t("modals.selectFolder"));
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
      Alert.alert(t("common.error"), t("modals.cardSaveError"));
    } finally {
      setLoading(false);
    }
  };

  // Kategori render
  const renderCategory = ({ item }) => {
    const isSelected = selectedCategory?.id === item.id;
    return (
      <Pressable
        style={[styles.categoryItem, isSelected && styles.categoryItemSelected]}
        onPress={() => setSelectedCategory(item)}
        accessibilityRole="radio"
        accessibilityState={{ checked: isSelected }}
        accessibilityLabel={`${item.name}, ${item.cardCount || 0} kart`}
      >
        <View style={styles.categoryLeft}>
          <AppText style={styles.categoryIcon}>{item.icon}</AppText>
          <View>
            <AppText variant="bodyStrong">{item.name}</AppText>
            <AppText variant="caption" color="textSecondary" style={{ marginTop: 2 }}>
              {t("modals.cardCount", { count: item.cardCount || 0 })}
            </AppText>
          </View>
        </View>
        {isSelected && (
          <Icon name="checkmark-circle" size={24} color={colors.primary} />
        )}
      </Pressable>
    );
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      {/* Header */}
      <View style={styles.header}>
        <AppText variant="title">{t("modals.selectFolderTitle")}</AppText>
        <Pressable
          onPress={onClose}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Kapat"
          style={styles.closeBtn}
        >
          <Icon name="close" size={28} color={colors.text} />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : showNewCategory ? (
        // Yeni Kategori Formu
        <View>
          <AppText variant="heading" style={styles.formTitle}>
            {t("modals.createFolderTitle")}
          </AppText>

          <Input
            placeholder={t("modals.folderNamePlaceholder")}
            value={newCategoryName}
            onChangeText={setNewCategoryName}
          />

          <AppText variant="label" color="textSecondary" style={styles.iconLabel}>
            {t("modals.selectIcon")}
          </AppText>
          <View style={styles.iconGrid}>
            {iconOptions.map((icon) => {
              const selected = newCategoryIcon === icon;
              return (
                <Pressable
                  key={icon}
                  style={[styles.iconOption, selected && styles.iconOptionSelected]}
                  onPress={() => setNewCategoryIcon(icon)}
                  accessibilityRole="button"
                  accessibilityLabel={`İkon ${icon}`}
                  accessibilityState={{ selected }}
                >
                  <AppText style={styles.iconOptionText}>{icon}</AppText>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.formButtons}>
            <Button
              title={t("common.cancel")}
              variant="secondary"
              onPress={() => {
                setShowNewCategory(false);
                setNewCategoryName("");
                setNewCategoryIcon("📁");
              }}
              style={styles.flexBtn}
            />
            <Button
              title={t("modals.create")}
              onPress={handleCreateCategory}
              style={styles.flexBtn}
            />
          </View>
        </View>
      ) : (
        // Kategori Listesi
        <>
          <FlatList
            data={categories}
            keyExtractor={(item) => item.id}
            renderItem={renderCategory}
            style={styles.list}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              <Pressable
                style={styles.newCategoryButton}
                onPress={() => setShowNewCategory(true)}
                accessibilityRole="button"
                accessibilityLabel="Yeni klasör oluştur"
              >
                <Icon
                  name="add-circle-outline"
                  size={24}
                  color={colors.primary}
                />
                <AppText variant="bodyStrong" color="primary">
                  {t("modals.createFolderTitle")}
                </AppText>
              </Pressable>
            }
          />

          {/* Kaydet Butonu */}
          <Button
            title={t("common.save")}
            onPress={handleSave}
            disabled={!selectedCategory}
            style={{ marginTop: spacing.md }}
          />
        </>
      )}
    </BottomSheet>
  );
}

const createStyles = (colors, spacing, radius) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.lg,
    },
    closeBtn: {
      width: 44,
      height: 44,
      alignItems: "flex-end",
      justifyContent: "center",
    },
    loadingContainer: {
      paddingVertical: spacing.xxxxl,
      justifyContent: "center",
      alignItems: "center",
    },
    list: {
      maxHeight: 360,
    },
    categoryItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: spacing.lg,
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      marginBottom: spacing.md,
      borderWidth: 2,
      borderColor: colors.border,
    },
    categoryItemSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryMuted,
    },
    categoryLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
    },
    categoryIcon: {
      fontSize: 32,
    },
    newCategoryButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.lg,
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 2,
      borderColor: colors.primary,
      borderStyle: "dashed",
      gap: spacing.sm,
    },
    formTitle: {
      marginBottom: spacing.lg,
    },
    iconLabel: {
      marginBottom: spacing.md,
    },
    iconGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.md,
      marginBottom: spacing.xl,
    },
    iconOption: {
      width: 50,
      height: 50,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 2,
      borderColor: colors.border,
    },
    iconOptionSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryMuted,
    },
    iconOptionText: {
      fontSize: 24,
    },
    formButtons: {
      flexDirection: "row",
      gap: spacing.md,
    },
    flexBtn: {
      flex: 1,
    },
  });
