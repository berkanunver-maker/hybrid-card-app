// screens/StatsScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../utils/colors";
import { FirestoreService } from "../services/firestoreService";
import { getAuth } from "firebase/auth";

const { width } = Dimensions.get("window");

export default function StatsScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCards: 0,
    totalCategories: 0,
    favoriteCards: 0,
    cardsWithVoiceNotes: 0,
    cardsThisMonth: 0,
    cardsThisWeek: 0,
    mostActiveCategory: null,
    recentActivity: [],
  });

  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  // İstatistikleri yükle
  const loadStats = async () => {
    try {
      setLoading(true);

      // Tüm kartları çek
      const allCards = await FirestoreService.getAllUserCards(userId);
      
      // Kategorileri çek
      const categories = await FirestoreService.getUserCategories(userId);
      
      // Favori kartları çek
      const favorites = await FirestoreService.getFavoriteCards(userId);

      // Bu ay eklenen kartlar
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const cardsThisMonth = allCards.filter(
        card => new Date(card.createdAt) >= startOfMonth
      );

      // Bu hafta eklenen kartlar
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const cardsThisWeek = allCards.filter(
        card => new Date(card.createdAt) >= startOfWeek
      );

      // Ses notu olan kartlar
      const cardsWithVoiceNotes = allCards.filter(
        card => card.voice_note || card.fields?.voice_note
      );

      // En aktif kategori
      const categoryCardCounts = categories
        .map(cat => ({ name: cat.name, icon: cat.icon, count: cat.cardCount || 0 }))
        .filter(cat => cat.count > 0)
        .sort((a, b) => b.count - a.count);
      
      const mostActive = categoryCardCounts.length > 0 ? categoryCardCounts[0] : null;

      setStats({
        totalCards: allCards.length,
        totalCategories: categories.length,
        favoriteCards: favorites.length,
        cardsWithVoiceNotes: cardsWithVoiceNotes.length,
        cardsThisMonth: cardsThisMonth.length,
        cardsThisWeek: cardsThisWeek.length,
        mostActiveCategory: mostActive,
        categoryDistribution: categoryCardCounts.slice(0, 5), // İlk 5 kategori
      });
    } catch (error) {
      console.error("❌ İstatistikler yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadStats();
    }
  }, [userId]);

  // Stat Card Component
  const StatCard = ({ icon, label, value, color = colors.primary }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: color + "20" }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  // Category Bar Component
  const CategoryBar = ({ category, maxCount }) => {
    const percentage = maxCount > 0 ? (category.count / maxCount) * 100 : 0;
    return (
      <View style={styles.categoryBarContainer}>
        <View style={styles.categoryBarHeader}>
          <View style={styles.categoryBarLeft}>
            <Text style={styles.categoryBarIcon}>{category.icon}</Text>
            <Text style={styles.categoryBarName}>{category.name}</Text>
          </View>
          <Text style={styles.categoryBarCount}>{category.count} kart</Text>
        </View>
        <View style={styles.categoryBarTrack}>
          <View 
            style={[
              styles.categoryBarFill, 
              { width: `${percentage}%` }
            ]} 
          />
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>İstatistikler yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>İstatistikler</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Genel İstatistikler */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 GENEL</Text>
          <View style={styles.statsGrid}>
            <StatCard 
              icon="albums" 
              label="Toplam Kart" 
              value={stats.totalCards}
              color={colors.primary}
            />
            <StatCard 
              icon="folder" 
              label="Klasör" 
              value={stats.totalCategories}
              color="#FF9500"
            />
            <StatCard 
              icon="star" 
              label="Favori" 
              value={stats.favoriteCards}
              color="#FFD700"
            />
            <StatCard 
              icon="mic" 
              label="Ses Notu" 
              value={stats.cardsWithVoiceNotes}
              color="#34C759"
            />
          </View>
        </View>

        {/* Bu Ay */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📈 BU AY</Text>
          <View style={styles.monthCard}>
            <View style={styles.monthRow}>
              <View style={styles.monthItem}>
                <Text style={styles.monthValue}>{stats.cardsThisMonth}</Text>
                <Text style={styles.monthLabel}>Yeni Kart</Text>
              </View>
              <View style={styles.monthDivider} />
              <View style={styles.monthItem}>
                <Text style={styles.monthValue}>{stats.cardsThisWeek}</Text>
                <Text style={styles.monthLabel}>Bu Hafta</Text>
              </View>
            </View>

            {stats.mostActiveCategory && (
              <View style={styles.mostActiveContainer}>
                <Text style={styles.mostActiveLabel}>En Aktif Klasör:</Text>
                <View style={styles.mostActiveCategory}>
                  <Text style={styles.mostActiveCategoryIcon}>
                    {stats.mostActiveCategory.icon}
                  </Text>
                  <Text style={styles.mostActiveCategoryName}>
                    {stats.mostActiveCategory.name}
                  </Text>
                  <Text style={styles.mostActiveCategoryCount}>
                    ({stats.mostActiveCategory.count} kart)
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Kategori Dağılımı */}
        {stats.categoryDistribution && stats.categoryDistribution.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📁 KATEGORİ DAĞILIMI</Text>
            <View style={styles.categoryDistribution}>
              {stats.categoryDistribution.map((category, index) => (
                <CategoryBar 
                  key={index} 
                  category={category}
                  maxCount={stats.categoryDistribution[0]?.count || 1}
                />
              ))}
            </View>
          </View>
        )}

        {/* Öneriler */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💡 ÖNERİLER</Text>
          <View style={styles.suggestionCard}>
            <Ionicons name="bulb-outline" size={24} color="#FF9500" />
            <View style={styles.suggestionContent}>
              <Text style={styles.suggestionText}>
                {stats.favoriteCards === 0
                  ? "Henüz favori kartınız yok. Önemli kartları favorilere ekleyin!"
                  : stats.cardsWithVoiceNotes === 0
                  ? "Kartlarınıza ses notu ekleyerek daha fazla bilgi saklayın!"
                  : stats.cardsThisMonth === 0
                  ? "Bu ay henüz kart eklemediniz. Yeni kartlar taramaya başlayın!"
                  : "Harika gidiyorsunuz! Kartlarınızı düzenli tutmaya devam edin."}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  scrollContent: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    color: colors.secondaryText,
    marginTop: 12,
  },
  
  // Sections
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.secondaryText,
    marginBottom: 12,
  },
  
  // Stat Cards
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 52) / 2, // 2 columns
    backgroundColor: colors.cardBackground || "#1C1C1E",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.secondaryText,
  },
  
  // Month Card
  monthCard: {
    backgroundColor: colors.cardBackground || "#1C1C1E",
    borderRadius: 12,
    padding: 16,
  },
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  monthItem: {
    flex: 1,
    alignItems: "center",
  },
  monthValue: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 4,
  },
  monthLabel: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  monthDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border || "#2C2C2E",
  },
  mostActiveContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border || "#2C2C2E",
  },
  mostActiveLabel: {
    fontSize: 12,
    color: colors.secondaryText,
    marginBottom: 8,
  },
  mostActiveCategory: {
    flexDirection: "row",
    alignItems: "center",
  },
  mostActiveCategoryIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  mostActiveCategoryName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginRight: 4,
  },
  mostActiveCategoryCount: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  
  // Category Distribution
  categoryDistribution: {
    backgroundColor: colors.cardBackground || "#1C1C1E",
    borderRadius: 12,
    padding: 16,
  },
  categoryBarContainer: {
    marginBottom: 16,
  },
  categoryBarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryBarLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryBarIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  categoryBarName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  categoryBarCount: {
    fontSize: 12,
    color: colors.secondaryText,
  },
  categoryBarTrack: {
    height: 6,
    backgroundColor: colors.background,
    borderRadius: 3,
    overflow: "hidden",
  },
  categoryBarFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  
  // Suggestions
  suggestionCard: {
    flexDirection: "row",
    backgroundColor: colors.cardBackground || "#1C1C1E",
    borderRadius: 12,
    padding: 16,
    alignItems: "flex-start",
  },
  suggestionContent: {
    flex: 1,
    marginLeft: 12,
  },
  suggestionText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});