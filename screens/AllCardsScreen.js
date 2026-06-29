// screens/AllCardsScreen.js
// 🗂️ Tüm Kartlar — kullanıcının (org'unun) tüm kartlarını düz liste olarak gösterir.
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

export default function AllCardsScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { colors, spacing, radius } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, spacing, radius),
    [colors, spacing, radius]
  );

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  const loadCards = async () => {
    try {
      setLoading(true);
      const fetched = await FirestoreService.getAllUserCards(userId);
      setCards(fetched);
    } catch (error) {
      // sessiz geç (UI bozulmasın)
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (userId) loadCards();
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      if (userId) loadCards();
    }, [userId])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadCards();
  };

  const handleCardPress = (card) => {
    navigation.navigate("CardDetail", { cardData: card });
  };

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
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t("common.back")}
          style={styles.iconBtn}
        >
          <Icon name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Icon name="albums" size={20} color={colors.primary} style={{ marginRight: 8 }} />
          <AppText variant="title">{t("lists.allCardsTitle")}</AppText>
        </View>
        <View style={styles.iconBtn} />
      </View>

      {loading && !refreshing ? (
        <Loader visible text={t("lists.loadingCards")} />
      ) : cards.length === 0 ? (
        <EmptyState
          icon="albums-outline"
          title={t("lists.allCardsEmptyTitle")}
          description={t("lists.allCardsEmptyDescription")}
        />
      ) : (
        <FlatList
          data={cards}
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
              {t("lists.cardCount", { count: cards.length })}
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
    listContent: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: spacing.xl,
    },
  });
