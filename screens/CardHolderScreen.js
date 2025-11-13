import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../utils/colors";

// 🔹 Eğer Firestore kullanıyorsan import aktif et
// import { getUserCards } from "../services/firestoreService";

export default function CardHolderScreen() {
  const navigation = useNavigation();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      setLoading(true);

      // 🔹 Gerçek veri Firestore'dan çekilecekse:
      // const data = await getUserCards(userId);
      // setCards(data);

      // 🔹 Şimdilik mock veriler (örnek için):
      const mock = [
        {
          id: "1",
          name: "Alexis Razo",
          company: "A Grieco Family Company; Mercedes-Benz",
          email: "arazo@griecocars.com",
          createdAt: "2025-11-01T11:00:00Z",
          voice_note: { text: "Bu bir ses kaydıdır. Deneme yapıyorum." },
        },
        {
          id: "2",
          name: "Serdar Uçan",
          company: "Uçan Kutu Ambalaj Sanayi",
          email: "info@ucankutu.com",
          createdAt: "2025-10-30T09:25:00Z",
          voice_note: null,
        },
      ];

      setCards(mock);
    } catch (error) {
      console.error("Kart yükleme hatası:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("CardDetail", { cardData: item })}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.company}>{item.company}</Text>
          <Text style={styles.email}>{item.email}</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color={colors.primary} />
      </View>

      {item.voice_note?.text && (
        <View style={styles.voiceTag}>
          <Ionicons name="mic-outline" size={14} color="#fff" />
          <Text style={styles.voiceText}>Ses notu ekli</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Kartlar yükleniyor...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📇 Kayıtlı Kartlar</Text>

      {cards.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Henüz kayıtlı bir kart yok.</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Camera")}
            style={styles.newButton}
          >
            <Ionicons name="camera" size={20} color={colors.background} />
            <Text style={styles.newText}>Yeni Kart Tara</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={cards}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.surface || "#1E1E1E",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  company: {
    color: colors.secondaryText || "#bbb",
    fontSize: 14,
    marginTop: 2,
  },
  email: {
    color: colors.secondaryText || "#999",
    fontSize: 13,
    marginTop: 2,
  },
  voiceTag: {
    marginTop: 10,
    backgroundColor: colors.primary,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  voiceText: {
    color: "#fff",
    marginLeft: 4,
    fontSize: 12,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: colors.text,
    fontSize: 15,
    marginBottom: 10,
  },
  newButton: {
    flexDirection: "row",
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  newText: {
    color: colors.background,
    marginLeft: 6,
    fontWeight: "600",
  },
  loadingText: {
    marginTop: 10,
  },
});
