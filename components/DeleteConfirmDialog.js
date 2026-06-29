// components/DeleteConfirmDialog.js
import React, { useState, useMemo } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import Icon from "./ui/Icon";
import { useTheme } from "../utils/theme";
import { useTranslation } from "../i18n/I18nProvider";
import { Dialog, AppText, Button } from "./ui";

export default function DeleteConfirmDialog({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  itemName = "",
  itemCount = 0,
  showMoveOption = false,
  confirmText,
  cancelText,
}) {
  const { colors, spacing, radius } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(
    () => createStyles(colors, spacing, radius),
    [colors, spacing, radius]
  );

  const resolvedTitle = title ?? t("modals.deleteConfirmTitle");
  const resolvedMessage = message ?? t("modals.deleteConfirmMessage");
  const resolvedConfirmText = confirmText ?? t("common.delete");
  const resolvedCancelText = cancelText ?? t("common.cancel");

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
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSelectedOption("delete");
      onClose();
    }
  };

  const renderOption = (value, optionTitle, description, danger) => {
    const selected = selectedOption === value;
    return (
      <Pressable
        style={[styles.optionButton, selected && styles.optionButtonSelected]}
        onPress={() => setSelectedOption(value)}
        disabled={loading}
        accessibilityRole="radio"
        accessibilityState={{ checked: selected, disabled: loading }}
        accessibilityLabel={optionTitle}
      >
        <View style={[styles.radioButton, selected && styles.radioButtonActive]}>
          {selected && <View style={styles.radioButtonInner} />}
        </View>
        <View style={styles.optionContent}>
          <AppText
            variant="bodyStrong"
            color={danger ? "danger" : "text"}
            style={{ marginBottom: 4 }}
          >
            {optionTitle}
          </AppText>
          <AppText variant="caption" color="textSecondary">
            {description}
          </AppText>
        </View>
      </Pressable>
    );
  };

  return (
    <Dialog visible={visible} onClose={handleClose} dismissable={!loading}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Icon name="warning" size={32} color={colors.danger} />
        </View>
        <AppText variant="title" style={styles.title}>
          {resolvedTitle}
        </AppText>
      </View>

      <View style={styles.content}>
        {itemName ? (
          <AppText variant="bodyStrong" style={styles.itemName}>
            "{itemName}"
          </AppText>
        ) : null}
        <AppText variant="body" color="textSecondary" style={styles.message}>
          {resolvedMessage}
        </AppText>

        {itemCount > 0 && (
          <View style={styles.infoBox}>
            <Icon
              name="information-circle"
              size={20}
              color={colors.primary}
            />
            <AppText variant="caption" color="text" style={styles.infoText}>
              {t("modals.folderCardCountInfoPre")}{" "}
              <AppText variant="caption" style={styles.infoTextBold}>
                {t("modals.cardCount", { count: itemCount })}
              </AppText>{" "}
              {t("modals.folderCardCountInfoPost")}
            </AppText>
          </View>
        )}

        {showMoveOption && itemCount > 0 && (
          <View style={styles.optionsContainer}>
            <AppText variant="bodyStrong" style={{ marginBottom: spacing.md }}>
              {t("modals.whatAboutCards")}
            </AppText>

            {renderOption(
              "move",
              t("modals.moveCardsToGeneral"),
              t("modals.moveCardsDescription"),
              false
            )}
            {renderOption(
              "delete",
              t("modals.deleteWithCards"),
              t("modals.deleteWithCardsDescription"),
              true
            )}
          </View>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title={resolvedCancelText}
          variant="secondary"
          onPress={handleClose}
          disabled={loading}
          style={styles.flexBtn}
        />
        <Button
          title={resolvedConfirmText}
          variant="danger"
          icon="trash"
          loading={loading}
          onPress={handleConfirm}
          style={styles.flexBtn}
        />
      </View>
    </Dialog>
  );
}

const createStyles = (colors, spacing, radius) =>
  StyleSheet.create({
    header: {
      alignItems: "center",
      marginBottom: spacing.lg,
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: radius.pill,
      backgroundColor: colors.dangerSurface,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: spacing.lg,
    },
    title: {
      textAlign: "center",
    },
    content: {
      marginBottom: spacing.lg,
    },
    itemName: {
      textAlign: "center",
      marginBottom: spacing.sm,
    },
    message: {
      textAlign: "center",
    },
    infoBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primaryMuted,
      padding: spacing.md,
      borderRadius: radius.md,
      marginTop: spacing.lg,
      gap: spacing.sm,
    },
    infoText: {
      flex: 1,
      lineHeight: 18,
    },
    infoTextBold: {
      fontWeight: "700",
      color: colors.text,
    },
    optionsContainer: {
      marginTop: spacing.xxl,
    },
    optionButton: {
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor: colors.surface,
      padding: spacing.lg,
      borderRadius: radius.md,
      marginBottom: spacing.sm,
      borderWidth: 2,
      borderColor: colors.border,
    },
    optionButtonSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primaryMuted,
    },
    radioButton: {
      width: 20,
      height: 20,
      borderRadius: radius.pill,
      borderWidth: 2,
      borderColor: colors.borderStrong,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 2,
      marginRight: spacing.md,
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
    optionContent: {
      flex: 1,
    },
    buttonContainer: {
      flexDirection: "row",
      gap: spacing.md,
    },
    flexBtn: {
      flex: 1,
    },
  });
