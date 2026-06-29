// components/MoveCardModal.js
import React, { useState, useMemo } from "react";
import { View, Pressable, ScrollView, StyleSheet } from "react-native";
import Icon from "./ui/Icon";
import { useTheme } from "../utils/theme";
import { useTranslation } from "../i18n/I18nProvider";
import { BottomSheet, AppText, Button, Badge, EmptyState } from "./ui";

export default function MoveCardModal({
  visible,
  onClose,
  onMove,
  currentFolderId,
  folders = [],
  cardName = "",
}) {
  const { colors, spacing, radius } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(
    () => createStyles(colors, spacing, radius),
    [colors, spacing, radius]
  );

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
    .filter((folder) => folder.id !== currentFolderId)
    .sort((a, b) => {
      if (a.isDefault) return -1;
      if (b.isDefault) return 1;
      return (a.name || "").localeCompare(b.name || "");
    });

  const currentFolder = folders.find((f) => f.id === currentFolderId);

  return (
    <BottomSheet visible={visible} onClose={handleClose} dismissable={!loading}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon name="folder-open" size={24} color={colors.primary} />
          <AppText variant="title">{t("modals.selectFolderTitle")}</AppText>
        </View>
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

      {cardName ? (
        <View style={styles.cardInfo}>
          <Icon name="card" size={16} color={colors.textSecondary} />
          <AppText
            variant="body"
            color="textSecondary"
            numberOfLines={1}
            style={{ flex: 1 }}
          >
            {cardName}
          </AppText>
        </View>
      ) : null}

      {currentFolder ? (
        <View style={styles.currentFolderContainer}>
          <AppText variant="caption" color="textSecondary" style={styles.label}>
            {t("modals.currentFolder")}
          </AppText>
          <View style={styles.currentFolderCard}>
            <AppText style={styles.currentFolderIcon}>
              {currentFolder.icon}
            </AppText>
            <AppText variant="bodyStrong">{currentFolder.name}</AppText>
          </View>
        </View>
      ) : null}

      <View style={styles.separator}>
        <View style={styles.separatorLine} />
        <AppText variant="caption" color="textSecondary" style={styles.separatorText}>
          {t("modals.targetFolder")}
        </AppText>
        <View style={styles.separatorLine} />
      </View>

      <ScrollView style={styles.folderList} showsVerticalScrollIndicator={false}>
        {availableFolders.length === 0 ? (
          <EmptyState
            icon="folder-open-outline"
            title={t("modals.noOtherFolders")}
          />
        ) : (
          availableFolders.map((folder) => {
            const selected = selectedFolderId === folder.id;
            return (
              <Pressable
                key={folder.id}
                style={[styles.folderItem, selected && styles.folderItemSelected]}
                onPress={() => setSelectedFolderId(folder.id)}
                disabled={loading}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected, disabled: loading }}
                accessibilityLabel={`${folder.name}, ${folder.cardCount || 0} kart`}
              >
                <View style={styles.folderItemLeft}>
                  <View
                    style={[styles.radioButton, selected && styles.radioButtonActive]}
                  >
                    {selected && <View style={styles.radioButtonInner} />}
                  </View>
                  <AppText style={styles.folderIcon}>{folder.icon}</AppText>
                  <View style={styles.folderInfo}>
                    <AppText variant="bodyStrong" numberOfLines={1}>
                      {folder.name}
                    </AppText>
                    <AppText
                      variant="caption"
                      color="textSecondary"
                      style={{ marginTop: 2 }}
                    >
                      {t("modals.cardCount", { count: folder.cardCount || 0 })}
                    </AppText>
                  </View>
                </View>
                {folder.isDefault && (
                  <Badge tone="primary" label={t("modals.default")} />
                )}
              </Pressable>
            );
          })
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <Button
          title={t("common.cancel")}
          variant="secondary"
          onPress={handleClose}
          disabled={loading}
          style={styles.flexBtn}
        />
        <Button
          title={t("modals.move")}
          icon="arrow-forward"
          onPress={handleMove}
          loading={loading}
          disabled={
            !selectedFolderId || selectedFolderId === currentFolderId || loading
          }
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
      marginBottom: spacing.lg,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
    },
    closeBtn: {
      width: 44,
      height: 44,
      alignItems: "flex-end",
      justifyContent: "center",
    },
    cardInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    currentFolderContainer: {
      marginBottom: spacing.lg,
    },
    label: {
      marginBottom: spacing.sm,
      letterSpacing: 0.5,
    },
    currentFolderCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      borderRadius: radius.md,
      gap: spacing.md,
    },
    currentFolderIcon: {
      fontSize: 24,
    },
    separator: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.lg,
      gap: spacing.md,
    },
    separatorLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    separatorText: {
      letterSpacing: 0.5,
    },
    folderList: {
      maxHeight: 300,
    },
    folderItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.surface,
      padding: spacing.lg,
      borderRadius: radius.md,
      marginBottom: spacing.sm,
      borderWidth: 2,
      borderColor: colors.border,
    },
    folderItemSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryMuted,
    },
    folderItemLeft: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
    },
    radioButton: {
      width: 20,
      height: 20,
      borderRadius: radius.pill,
      borderWidth: 2,
      borderColor: colors.borderStrong,
      justifyContent: "center",
      alignItems: "center",
    },
    radioButtonActive: {
      borderColor: colors.primary,
    },
    radioButtonInner: {
      width: 10,
      height: 10,
      borderRadius: radius.pill,
      backgroundColor: colors.primary,
    },
    folderIcon: {
      fontSize: 28,
    },
    folderInfo: {
      flex: 1,
    },
    buttonContainer: {
      flexDirection: "row",
      paddingTop: spacing.lg,
      gap: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    flexBtn: {
      flex: 1,
    },
  });
