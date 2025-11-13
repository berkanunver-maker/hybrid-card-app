import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { colors } from "../utils/colors";
import CustomButton from "./CustomButton";

const { width } = Dimensions.get("window");

export default function FeedbackModal({
  visible = false,
  title = "İşlem Tamamlandı",
  message = "",
  primaryAction, // { text, onPress }
  secondaryAction, // { text, onPress }
  onClose,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          {/* Başlık */}
          <Text style={styles.title}>{title}</Text>

          {/* Mesaj */}
          {message ? <Text style={styles.message}>{message}</Text> : null}

          {/* Butonlar */}
          <View style={styles.buttons}>
            {secondaryAction ? (
              <CustomButton
                title={secondaryAction.text}
                type="outline"
                onPress={secondaryAction.onPress}
                style={{ flex: 1, marginRight: 8 }}
              />
            ) : null}

            {primaryAction ? (
              <CustomButton
                title={primaryAction.text}
                onPress={primaryAction.onPress}
                style={{ flex: 1 }}
              />
            ) : null}
          </View>

          {/* Kapat */}
          {!primaryAction && !secondaryAction ? (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>Kapat</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalBox: {
    width: width * 0.85,
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  closeButton: {
    marginTop: 12,
    paddingVertical: 8,
  },
  closeText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 15,
  },
});
