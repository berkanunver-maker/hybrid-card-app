// screens/AllCardsScreen.js
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import { colors } from "../utils/colors";
import { FirestoreService } from "../services/firestoreService";

export default function AllCardsScreen() {
  const navigation = useNavigation();
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCards = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const allCards = await FirestoreService.getAllUserCards(userId);
      setCards(allCards);
    } catch (error) {
      console.error("❌ Kartlar yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, [userId]);

  // Ekran focus olduğunda kartları yenile
  useFocusEffect(
    useCallback(() => {
      loadCards();
    }, [userId])
  );

  const renderCard = ({ item }) => {
    const fields = item.fields || item;
    const name = fields.name || item.name || "İsimsiz";
    const company = fields.company || item.company || "";
    const email = fields.email || item.email || "";
    const phone = fields.phone || item.phone || "";

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("CardDetail", { cardData: item })}
      >
        <View style={styles.cardIconContainer}>
          <Ionicons name="person" size={32} color={colors.primary} />
        </View>

        <View style={styles.cardContent}>
          <Text style={styles.cardName} numberOfLines={1}>
            {name}
          </Text>
          {company ? (
            <Text style={styles.cardCompany} numberOfLines={1}>
              {company}
            </Text>
          ) : null}
          {email ? (
            <Text style={styles.cardDetail} numberOfLines={1}>
              📧 {email}
            </Text>
          ) : null}
          {phone ? (
            <Text style={styles.cardDetail} numberOfLines={1}>
              📱 {phone}
            </Text>
          ) : null}
        </View>

        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Kartlar yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tüm Kartlar</Text>
        <View style={styles.headerRight}>
          <Text style={styles.cardCount}>{cards.length} kart</Text>
        </View>
      </View>

      {/* Cards List */}
      {cards.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="albums-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyText}>Henüz kart eklenmemiş</Text>
          <Text style={styles.emptySubtext}>
            "Yeni Kart Tara" butonunu kullanarak kart ekleyebilirsiniz
          </Text>
        </View>
      ) : (
        <FlatList
          data={cards}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: 16,
    fontSize: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: "#2A2A2A",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  headerRight: {
    minWidth: 40,
  },
  cardCount: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  cardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(123, 97, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardCompany: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  cardDetail: {
    color: colors.textSecondary,
    fontSize: 12,
    marginBottom: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtext: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
});
