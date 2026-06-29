// components/EditFolderModal.js
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
import { BottomSheet, AppText, Input, Button } from "./ui";

export default function EditFolderModal({
  visible,
  onClose,
  onFolderUpdated,
  folder = null,
}) {
  const { colors, spacing, radius } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(
    () => createStyles(colors, spacing, radius),
    [colors, spacing, radius]
  );

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
      Alert.alert(t("common.error"), t("modals.enterFolderName"));
      return;
    }

    if (!folder || !folder.id) {
      Alert.alert(t("common.error"), t("modals.folderInfoMissing"));
      return;
    }

    if (folder.isDefault) {
      Alert.alert(t("modals.warning"), t("modals.defaultFolderLocked"));
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

      Alert.alert(t("common.success"), t("modals.folderUpdatedNamed", { name: folderName }));

      if (onFolderUpdated) {
        onFolderUpdated();
      }

      handleClose();
    } catch (error) {
      Alert.alert(t("common.error"), t("modals.folderUpdateError") + " " + error.message);
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
    <BottomSheet visible={visible} onClose={handleClose} dismissable={!loading}>
      <View style={styles.header}>
        <AppText variant="title">{t("modals.editFolderTitle")}</AppText>
        <Pressable
          onPress={handleClose}
          disabled={loading}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Kapat"
          style={styles.closeBtn}
        >
          <Icon name="close" size={24} color={colors.text} />
        </Pressable>
      </View>

      {isDefaultFolder && (
        <View style={styles.warningBox}>
          <Icon name="information-circle" size={20} color={colors.warning} />
          <AppText variant="caption" color="text" style={styles.warningText}>
            {t("modals.defaultFolderLocked")}
          </AppText>
        </View>
      )}

      <Input
        label={t("modals.folderNameLabel")}
        placeholder={t("modals.folderNameExample")}
        value={folderName}
        onChangeText={setFolderName}
        maxLength={30}
        editable={!isDefaultFolder && !loading}
        autoFocus={!isDefaultFolder}
        style={isDefaultFolder ? styles.inputDisabled : undefined}
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
              style={[
                styles.iconButton,
                selected && styles.iconButtonSelected,
                isDefaultFolder && styles.iconButtonDisabled,
              ]}
              onPress={() => !isDefaultFolder && setSelectedIcon(icon)}
              disabled={isDefaultFolder || loading}
              accessibilityRole="button"
              accessibilityLabel={`İkon ${icon}`}
              accessibilityState={{ selected, disabled: isDefaultFolder || loading }}
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
              {folderName.trim() || folder?.name || t("modals.folderNameLabel")}
            </AppText>
            <AppText variant="caption" color="textSecondary" style={{ marginTop: 2 }}>
              {t("modals.cardCount", { count: folder?.cardCount || 0 })}
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
          title={t("modals.update")}
          icon="checkmark"
          onPress={handleUpdateFolder}
          loading={loading}
          disabled={loading || !folderName.trim() || isDefaultFolder}
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
    warningBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.warningSurface,
      padding: spacing.md,
      borderRadius: radius.md,
      marginBottom: spacing.lg,
      gap: spacing.sm,
    },
    warningText: {
      flex: 1,
      lineHeight: 18,
    },
    inputDisabled: {
      opacity: 0.5,
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
    iconButtonDisabled: {
      opacity: 0.5,
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
