// components/FeedbackModal.js
import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "../utils/theme";
import { useTranslation } from "../i18n/I18nProvider";
import { Dialog, AppText, Button } from "./ui";

export default function FeedbackModal({
  visible = false,
  title,
  message = "",
  primaryAction, // { text, onPress }
  secondaryAction, // { text, onPress }
  onClose,
}) {
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(spacing), [spacing]);

  const resolvedTitle = title ?? t("modals.actionCompleted");

  return (
    <Dialog visible={visible} onClose={onClose}>
      {/* Başlık */}
      <AppText variant="heading" style={styles.title}>
        {resolvedTitle}
      </AppText>

      {/* Mesaj */}
      {message ? (
        <AppText variant="body" color="textSecondary" style={styles.message}>
          {message}
        </AppText>
      ) : null}

      {/* Butonlar */}
      {primaryAction || secondaryAction ? (
        <View style={styles.buttons}>
          {secondaryAction ? (
            <Button
              title={secondaryAction.text}
              variant="secondary"
              onPress={secondaryAction.onPress}
              style={styles.btnLeft}
            />
          ) : null}

          {primaryAction ? (
            <Button
              title={primaryAction.text}
              onPress={primaryAction.onPress}
              style={styles.btnRight}
            />
          ) : null}
        </View>
      ) : null}

      {/* Kapat */}
      {!primaryAction && !secondaryAction ? (
        <Button
          title={t("modals.close")}
          variant="ghost"
          onPress={onClose}
          style={{ marginTop: spacing.md }}
        />
      ) : null}
    </Dialog>
  );
}

const createStyles = (spacing) =>
  StyleSheet.create({
    title: { textAlign: "center", marginBottom: spacing.sm },
    message: { textAlign: "center", marginBottom: spacing.lg },
    buttons: {
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
      gap: spacing.md,
    },
    btnLeft: { flex: 1 },
    btnRight: { flex: 1 },
  });
