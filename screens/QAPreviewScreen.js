import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function QAPreviewScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>QA Preview Screen</Text>
      <Text style={styles.subtitle}>
        Bu ekran test için oluşturuldu. OCR/Document AI sonuç önizlemesi burada olacak.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("QADetail")}
      >
        <Text style={styles.buttonText}>Detaylara Git</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: "#444" }]}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={styles.buttonText}>Ana Sayfaya Dön</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  title: { color: "#fff", fontSize: 22, fontWeight: "600" },
  subtitle: {
    color: "#bbb",
    marginVertical: 10,
    textAlign: "center",
  },
  button: {
    marginTop: 20,
    backgroundColor: "#7B61FF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "500" },
});
