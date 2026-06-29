// screens/StatsScreen.js
import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../utils/theme";
import { useTranslation } from "../i18n/I18nProvider";
import { FirestoreService } from "../services/firestoreService";
import { getAuth } from "firebase/auth";
import {
  ScreenContainer,
  AppText,
  SurfaceCard,
  SectionHeader,
  Loader,
  Icon,
} from "../components/ui";

const { width } = Dimensions.get("window");

export default function StatsScreen() {
  const navigation = useNavigation();
  const { colors, spacing, radius, shadows } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(
    () => createStyles(colors, spacing, radius, shadows),
    [colors, spacing, radius, shadows]
  );

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
      // İstatistikler yüklenemedi
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
    <SurfaceCard style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: color + "20" }]}>
        <Icon name={icon} size={24} color={color} />
      </View>
      <AppText variant="title">{value}</AppText>
      <AppText variant="caption" color="textSecondary" style={{ marginTop: spacing.xs }}>
        {label}
      </AppText>
    </SurfaceCard>
  );

  // Category Bar Component
  const CategoryBar = ({ category, maxCount }) => {
    const percentage = maxCount > 0 ? (category.count / maxCount) * 100 : 0;
    return (
      <View style={styles.categoryBarContainer}>
        <View style={styles.categoryBarHeader}>
          <View style={styles.categoryBarLeft}>
            {/* category.icon kullanıcı verisi — olduğu gibi bırakılır */}
            <AppText style={styles.categoryBarIcon}>{category.icon}</AppText>
            <AppText variant="label" numberOfLines={1} style={{ flex: 1 }}>
              {category.name}
            </AppText>
          </View>
          <AppText variant="caption" color="textSecondary">
            {t("tools.cardCount", { count: category.count })}
          </AppText>
        </View>
        <View style={styles.categoryBarTrack}>
          <View style={[styles.categoryBarFill, { width: `${percentage}%` }]} />
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <ScreenContainer>
        <Loader visible text={t("tools.statsLoading")} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Geri"
          style={styles.backBtn}
        >
          <Icon name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <AppText variant="title">{t("tools.statsTitle")}</AppText>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Genel İstatistikler */}
        <View style={styles.section}>
          <SectionHeader title={t("tools.sectionGeneral")} />
          <View style={styles.statsGrid}>
            <StatCard
              icon="albums"
              label={t("tools.statTotalCards")}
              value={stats.totalCards}
              color={colors.primary}
            />
            <StatCard
              icon="folder"
              label={t("tools.statFolders")}
              value={stats.totalCategories}
              color={colors.warning}
            />
            <StatCard
              icon="star"
              label={t("tools.statFavorites")}
              value={stats.favoriteCards}
              color={colors.star}
            />
            <StatCard
              icon="mic"
              label={t("tools.statVoiceNotes")}
              value={stats.cardsWithVoiceNotes}
              color={colors.success}
            />
          </View>
        </View>

        {/* Bu Ay */}
        <View style={styles.section}>
          <SectionHeader title={t("tools.sectionThisMonth")} />
          <SurfaceCard style={styles.monthCard}>
            <View style={styles.monthRow}>
              <View style={styles.monthItem}>
                <AppText variant="display" color="primary">
                  {stats.cardsThisMonth}
                </AppText>
                <AppText variant="label" color="textSecondary" style={{ marginTop: spacing.xs }}>
                  {t("tools.newCard")}
                </AppText>
              </View>
              <View style={styles.monthDivider} />
              <View style={styles.monthItem}>
                <AppText variant="display" color="primary">
                  {stats.cardsThisWeek}
                </AppText>
                <AppText variant="label" color="textSecondary" style={{ marginTop: spacing.xs }}>
                  {t("tools.thisWeek")}
                </AppText>
              </View>
            </View>

            {stats.mostActiveCategory && (
              <View style={styles.mostActiveContainer}>
                <AppText variant="caption" color="textSecondary" style={{ marginBottom: spacing.sm }}>
                  {t("tools.mostActiveFolder")}
                </AppText>
                <View style={styles.mostActiveCategory}>
                  {/* mostActiveCategory.icon kullanıcı verisi — olduğu gibi bırakılır */}
                  <AppText style={styles.mostActiveCategoryIcon}>
                    {stats.mostActiveCategory.icon}
                  </AppText>
                  <AppText variant="heading" style={{ marginRight: spacing.xs }}>
                    {stats.mostActiveCategory.name}
                  </AppText>
                  <AppText variant="caption" color="textSecondary">
                    {t("tools.cardCountParens", { count: stats.mostActiveCategory.count })}
                  </AppText>
                </View>
              </View>
            )}
          </SurfaceCard>
        </View>

        {/* Kategori Dağılımı */}
        {stats.categoryDistribution && stats.categoryDistribution.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title={t("tools.sectionCategoryDistribution")} />
            <SurfaceCard style={styles.categoryDistribution}>
              {stats.categoryDistribution.map((category, index) => (
                <CategoryBar
                  key={index}
                  category={category}
                  maxCount={stats.categoryDistribution[0]?.count || 1}
                />
              ))}
            </SurfaceCard>
          </View>
        )}

        {/* Öneriler */}
        <View style={styles.section}>
          <SectionHeader title={t("tools.sectionSuggestions")} />
          <SurfaceCard style={styles.suggestionCard}>
            <Icon name="bulb-outline" size={24} color={colors.warning} />
            <View style={styles.suggestionContent}>
              <AppText variant="body">
                {stats.favoriteCards === 0
                  ? t("tools.suggestionNoFavorites")
                  : stats.cardsWithVoiceNotes === 0
                  ? t("tools.suggestionNoVoiceNotes")
                  : stats.cardsThisMonth === 0
                  ? t("tools.suggestionNoCardsThisMonth")
                  : t("tools.suggestionGreat")}
              </AppText>
            </View>
          </SurfaceCard>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const createStyles = (colors, spacing, radius, shadows) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.lg,
    },
    backBtn: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    scrollContent: {
      paddingBottom: spacing.xxxxl,
    },

    // Sections
    section: {
      marginBottom: spacing.xxl,
      paddingHorizontal: spacing.xl,
    },

    // Stat Cards
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.md,
    },
    statCard: {
      flex: 1,
      minWidth: (width - 52) / 2, // 2 columns
      alignItems: "center",
    },
    statIconContainer: {
      width: 48,
      height: 48,
      borderRadius: radius.pill,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: spacing.sm,
    },

    // Month Card
    monthCard: {},
    monthRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.lg,
    },
    monthItem: {
      flex: 1,
      alignItems: "center",
    },
    monthDivider: {
      width: 1,
      height: 40,
      backgroundColor: colors.border,
    },
    mostActiveContainer: {
      paddingTop: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    mostActiveCategory: {
      flexDirection: "row",
      alignItems: "center",
    },
    mostActiveCategoryIcon: {
      fontSize: 20,
      marginRight: spacing.sm,
    },

    // Category Distribution
    categoryDistribution: {},
    categoryBarContainer: {
      marginBottom: spacing.lg,
    },
    categoryBarHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.sm,
    },
    categoryBarLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      gap: spacing.sm,
    },
    categoryBarIcon: {
      fontSize: 20,
    },
    categoryBarTrack: {
      height: 6,
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.sm,
      overflow: "hidden",
    },
    categoryBarFill: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: radius.sm,
    },

    // Suggestions
    suggestionCard: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    suggestionContent: {
      flex: 1,
      marginLeft: spacing.md,
    },
  });
