import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function FairSelectScreen() {
  const navigation = useNavigation();
  const [selectedFair, setSelectedFair] = useState(null);

  // 🔹 Mock fuar verileri (backend eklendiğinde Firestore'dan çekilecek)
  const fairs = [
    { id: "1", name: "TechConnect 2025 - İstanbul" },
    { id: "2", name: "AI & Robotics Expo 2025 - Berlin" },
    { id: "3", name: "Future Business Summit - London" },
    { id: "4", name: "Global Industry Fair - Dubai" },
  ];

  const handleSelect = (fair) => {
    setSelectedFair(fair.id);
    console.log("Seçilen Fuar:", fair.name);

    // 📸 Kamera ekranına geçiş (fuar seçildikten sonra)
    navigation.navigate("Camera");
  };

  const renderItem = ({ item }) => {
    const isSelected = selectedFair === item.id;
    return (
      <TouchableOpacity
        style={[styles.card, isSelected && styles.cardSelected]}
        onPress={() => handleSelect(item)}
      >
        <Text style={styles.cardText}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Select Your Fair</Text>
      <Text style={styles.subtitle}>
        Please choose the fair or event you are attending.
      </Text>

      <FlatList
        data={fairs}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={styles.backButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    color: "#999",
    fontSize: 14,
    marginBottom: 20,
  },
  list: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  cardSelected: {
    borderColor: "#7B61FF",
    backgroundColor: "#202040",
  },
  cardText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  backButton: {
    marginTop: 30,
    backgroundColor: "#7B61FF",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
