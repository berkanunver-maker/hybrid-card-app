// screens/FavoritesScreen.js
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { colors } from "../utils/colors";
import { FirestoreService } from "../services/firestoreService";
import { getAuth } from "firebase/auth";

export default function FavoritesScreen() {
  const navigation = useNavigation();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  // Favori kartları yükle
  const loadFavorites = async () => {
    try {
      setLoading(true);
      const fetchedFavorites = await FirestoreService.getFavoriteCards(userId);
      setFavorites(fetchedFavorites);
    } catch (error) {
      console.error("❌ Favoriler yüklenemedi:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // İlk yükleme
  useEffect(() => {
    if (userId) {
      loadFavorites();
    }
  }, [userId]);

  // Ekrana her dönüldüğünde yenile
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        loadFavorites();
      }
    }, [userId])
  );

  // Yenileme
  const onRefresh = () => {
    setRefreshing(true);
    loadFavorites();
  };

  // Kart tıklama
  const handleCardPress = (card) => {
    navigation.navigate("CardDetail", { cardData: card });
  };

  // Kart render
  const renderCard = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleCardPress(item)}>
      <View style={styles.cardLeft}>
        <Ionicons name="star" size={24} color="#FFD700" />
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>
            {item.fields?.name || item.name || "İsimsiz"}
          </Text>
          <Text style={styles.cardCompany} numberOfLines={1}>
            {item.fields?.company || item.company || "Şirket bilgisi yok"}
          </Text>
          <Text style={styles.cardCategory} numberOfLines={1}>
            📁 {item.categoryName || "Genel"}
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.secondaryText} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>⭐ Favoriler</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Favori Listesi */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Favoriler yükleniyor...</Text>
        </View>
      ) : favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>⭐</Text>
          <Text style={styles.emptyText}>Henüz favori kartınız yok</Text>
          <Text style={styles.emptySubtext}>
            Kart detayında yıldız simgesine basarak favori ekleyin
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            <Text style={styles.countText}>
              {favorites.length} favori kart
            </Text>
          }
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: colors.secondaryText,
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: "center",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  countText: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: 12,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.cardBackground || "#1C1C1E",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  cardCompany: {
    fontSize: 14,
    color: colors.secondaryText,
    marginBottom: 4,
  },
  cardCategory: {
    fontSize: 12,
    color: colors.primary,
  },
});