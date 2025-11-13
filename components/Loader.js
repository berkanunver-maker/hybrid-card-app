import React from "react";
import { View, ActivityIndicator, Text, Modal, StyleSheet } from "react-native";
import { colors } from "../utils/colors";

export default function Loader({
  visible = false,
  text = "Yükleniyor...",
  fullscreen = true,
}) {
  if (!visible) return null;

  const Container = fullscreen ? Modal : View;
  const containerProps = fullscreen
    ? { transparent: true, animationType: "fade", visible }
    : {};

  return (
    <Container {...containerProps}>
      <View style={[styles.overlay, fullscreen && styles.fullscreen]}>
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          {text ? <Text style={styles.text}>{text}</Text> : null}
        </View>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  overlay: {
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreen: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  loaderBox: {
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  text: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
});
