// components/CreateFolderModal.js
import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Pressable,
  ScrollView,
  Alert,
  StyleSheet,
} from "react-native";
import Icon from "./ui/Icon";
import { useTheme } from "../utils/theme";
import { useTranslation } from "../i18n/I18nProvider";
import { FOLDER_ICONS } from "../utils/constants";
import { FirestoreService } from "../services/firestoreService";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { BottomSheet, AppText, Input, Button } from "./ui";

export default function CreateFolderModal({ visible, onClose, onFolderCreated }) {
  const { colors, spacing, radius } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(
    () => createStyles(colors, spacing, radius),
    [colors, spacing, radius]
  );

  const [folderName, setFolderName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("📁");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      Alert.alert(t("common.error"), t("modals.enterFolderName"));
      return;
    }

    if (!userId) {
      Alert.alert(t("common.error"), t("modals.loginRequired"));
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
      Alert.alert(t("common.success"), t("modals.folderCreatedNamed", { name: folderName }));

      setFolderName("");
      setSelectedIcon("📁");

      if (onFolderCreated) {
        onFolderCreated();
      }
    } catch (error) {
      Alert.alert(t("common.error"), t("modals.folderCreateError") + " " + error.message);
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
    <BottomSheet visible={visible} onClose={handleClose}>
      <View style={styles.header}>
        <AppText variant="title">{t("modals.createFolderTitle")}</AppText>
        <Pressable
          onPress={handleClose}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={t("a11y.close")}
          style={styles.closeBtn}
        >
          <Icon name="close" size={24} color={colors.text} />
        </Pressable>
      </View>

      <Input
        label={t("modals.folderNameLabel")}
        placeholder={t("modals.folderNameExample")}
        value={folderName}
        onChangeText={setFolderName}
        maxLength={30}
        autoFocus
      />

      <AppText variant="label" color="textSecondary" style={styles.iconLabel}>
        {t("modals.selectIcon")}
      </AppText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.iconScroll}
      >
        {FOLDER_ICONS.map((icon, index) => {
          const selected = selectedIcon === icon;
          return (
            <Pressable
              key={index}
              style={[styles.iconButton, selected && styles.iconButtonSelected]}
              onPress={() => setSelectedIcon(icon)}
              accessibilityRole="button"
              accessibilityLabel={`İkon ${icon}`}
              accessibilityState={{ selected }}
            >
              <AppText style={styles.iconText}>{icon}</AppText>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.preview}>
        <AppText variant="label" color="textSecondary" style={styles.previewLabel}>
          {t("modals.preview")}
        </AppText>
        <View style={styles.previewCard}>
          <AppText style={styles.previewIcon}>{selectedIcon}</AppText>
          <View style={styles.previewInfo}>
            <AppText variant="bodyStrong" numberOfLines={1}>
              {folderName.trim() || t("modals.folderNameLabel")}
            </AppText>
            <AppText variant="caption" color="textSecondary" style={{ marginTop: 2 }}>
              {t("modals.cardCount", { count: 0 })}
            </AppText>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title={t("common.cancel")}
          variant="secondary"
          onPress={handleClose}
          disabled={loading}
          style={styles.flexBtn}
        />
        <Button
          title={t("modals.create")}
          onPress={handleCreateFolder}
          loading={loading}
          disabled={loading || !folderName.trim()}
          style={styles.flexBtn}
        />
      </View>
    </BottomSheet>
  );
}

const createStyles = (colors, spacing, radius) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.xxl,
    },
    closeBtn: {
      width: 44,
      height: 44,
      alignItems: "flex-end",
      justifyContent: "center",
    },
    iconLabel: {
      marginBottom: spacing.md,
    },
    iconScroll: {
      paddingRight: spacing.sm,
      gap: spacing.sm,
      marginBottom: spacing.xxl,
    },
    iconButton: {
      width: 56,
      height: 56,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderRadius: radius.md,
      borderWidth: 2,
      borderColor: colors.border,
    },
    iconButtonSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryMuted,
    },
    iconText: { fontSize: 28 },
    preview: {
      marginTop: spacing.xxl,
      marginBottom: spacing.xxl,
    },
    previewLabel: {
      marginBottom: spacing.sm,
    },
    previewCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.lg,
      borderRadius: radius.md,
    },
    previewIcon: { fontSize: 32, marginRight: spacing.md },
    previewInfo: { flex: 1 },
    buttonContainer: {
      flexDirection: "row",
      gap: spacing.md,
    },
    flexBtn: { flex: 1 },
  });
