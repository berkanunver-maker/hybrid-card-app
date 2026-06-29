// screens/FavoritesScreen.js
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, StyleSheet, FlatList, Pressable, RefreshControl } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../utils/theme";
import { useTranslation } from "../i18n/I18nProvider";
import { FirestoreService } from "../services/firestoreService";
import { getAuth } from "firebase/auth";
import {
  ScreenContainer,
  AppText,
  SurfaceCard,
  Badge,
  EmptyState,
  Loader,
  Monogram,
  Icon,
} from "../components/ui";

export default function FavoritesScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { colors, spacing, radius } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, spacing, radius),
    [colors, spacing, radius]
  );

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
      // sessiz geç
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
  const renderCard = ({ item }) => {
    const name = item.fields?.name || item.name || t("lists.unnamed");
    const companyRaw = item.fields?.company || item.company || "";
    const company = companyRaw || t("lists.noCompany");
    const categoryName = item.categoryName || t("lists.general");
    return (
      <SurfaceCard
        onPress={() => handleCardPress(item)}
        accessibilityLabel={`${name}, ${company}, ${categoryName}`}
        style={styles.card}
      >
        <Monogram name={name} company={companyRaw} />
        <View style={styles.cardInfo}>
          <AppText variant="bodyStrong" numberOfLines={1}>
            {name}
          </AppText>
          <AppText
            variant="caption"
            color="textSecondary"
            numberOfLines={1}
            style={{ marginTop: 2 }}
          >
            {company}
          </AppText>
          <Badge tone="primary" label={categoryName} style={{ marginTop: 6 }} />
        </View>
        <Icon name="chevron-forward" size={18} color={colors.textMuted} />
      </SurfaceCard>
    );
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Geri"
          style={styles.iconBtn}
        >
          <Icon name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Icon name="star" size={20} color={colors.star} style={{ marginRight: 8 }} />
          <AppText variant="title">{t("lists.favoritesTitle")}</AppText>
        </View>
        <View style={styles.iconBtn} />
      </View>

      {/* Favori Listesi */}
      {loading && !refreshing ? (
        <Loader visible text={t("lists.loadingFavorites")} />
      ) : favorites.length === 0 ? (
        <EmptyState
          icon="star-outline"
          title={t("lists.favoritesEmptyTitle")}
          description={t("lists.favoritesEmptyDescription")}
        />
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            <AppText
              variant="caption"
              color="textSecondary"
              style={{ marginBottom: spacing.md }}
            >
              {t("lists.favoriteCardCount", { count: favorites.length })}
            </AppText>
          }
        />
      )}
    </ScreenContainer>
  );
}

const createStyles = (colors, spacing, radius) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    iconBtn: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    headerCenter: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      justifyContent: "center",
    },
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: spacing.md,
    },
    cardInfo: {
      flex: 1,
      minWidth: 0,
    },
    starAvatar: {
      width: 44,
      height: 44,
      borderRadius: radius.pill,
      backgroundColor: colors.warningSurface,
      alignItems: "center",
      justifyContent: "center",
    },
    listContent: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: spacing.xl,
    },
  });
