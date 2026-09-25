// screens/FolderScreen.js
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  Alert,
} from "react-native";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../utils/theme";
import { useTranslation } from "../i18n/I18nProvider";
import { FirestoreService } from "../services/firestoreService";
import ExcelService from "../services/excelService";
import { getAuth } from "firebase/auth";
import {
  ScreenContainer,
  AppText,
  ListRow,
  EmptyState,
  Button,
  Loader,
  BottomSheet,
  Monogram,
  Icon,
} from "../components/ui";

export default function FolderScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { category } = route.params; // { id, name, icon, color }

  const { t } = useTranslation();
  const { colors, spacing, radius } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, spacing, radius),
    [colors, spacing, radius]
  );

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [exporting, setExporting] = useState(false);

  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  const hasLoadedRef = useRef(false);

  // Kartları yükle. İlk yüklemede tam-ekran loader gösterilir; odak yenilemelerinde
  // liste yerinde kalır (her dönüşte boş spinner + scroll sıfırlanması yaşanmasın — #47).
  const loadCards = async () => {
    try {
      if (!hasLoadedRef.current) setLoading(true);
      const fetchedCards = await FirestoreService.getCardsByCategory(category.id, userId);
      setCards(fetchedCards);
      hasLoadedRef.current = true;
    } catch (error) {
      Alert.alert(t("common.error"), t("lists.loadCardsError"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // İlk yükleme
  useEffect(() => {
    if (userId) {
      loadCards();
    }
  }, [userId, category.id]);

  // Ekrana her dönüldüğünde yenile
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        loadCards();
      }
    }, [userId, category.id])
  );

  // Yenileme
  const onRefresh = () => {
    setRefreshing(true);
    loadCards();
  };

  // Kart tıklama
  const handleCardPress = (card) => {
    navigation.navigate("CardDetail", { cardData: card });
  };

  // Bu klasöre kart ekle
  const handleAddCard = () => {
    navigation.navigate("Camera", { categoryId: category.id, categoryName: category.name });
  };

  // Excel'e aktar
  const handleExportToExcel = async () => {
    try {
      setMenuVisible(false);

      if (cards.length === 0) {
        Alert.alert(t("lists.warning"), t("lists.exportEmptyFolder"));
        return;
      }

      setExporting(true);

      // Excel oluştur ve paylaş
      await ExcelService.exportFolderToExcel(cards, category.name);

      Alert.alert(t("common.success"), t("lists.exportSuccess", { count: cards.length }));

      setExporting(false);
    } catch (error) {
      setExporting(false);
      Alert.alert(t("common.error"), t("lists.exportError"));
    }
  };

  // Kart render
  const renderCard = ({ item }) => {
    const name = item.fields?.name || item.name || t("lists.unnamed");
    const companyRaw = item.fields?.company || item.company || "";
    return (
      <ListRow
        onPress={() => handleCardPress(item)}
        title={name}
        subtitle={companyRaw || t("lists.noCompany")}
        style={{ marginBottom: spacing.md }}
        leading={<Monogram name={name} company={companyRaw} />}
      />
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
          accessibilityLabel={t("a11y.back")}
          style={styles.iconBtn}
        >
          <Icon name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <AppText style={{ fontSize: 22, marginRight: 8 }}>{category.icon}</AppText>
          <AppText variant="title" numberOfLines={1}>
            {category.name}
          </AppText>
        </View>
        <Pressable
          onPress={() => setMenuVisible(true)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t("a11y.folderMenu")}
          style={styles.iconBtn}
        >
          <Icon name="ellipsis-vertical" size={24} color={colors.text} />
        </Pressable>
      </View>

      {/* Kart Listesi */}
      {loading && !refreshing ? (
        <Loader visible text={t("lists.loadingCards")} />
      ) : cards.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title={t("lists.folderEmptyTitle")}
          description={t("lists.folderEmptyDescription")}
          actionLabel={t("lists.addFirstCard")}
          onAction={handleAddCard}
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

      {/* Floating Ekle Butonu */}
      {cards.length > 0 && (
        <View style={styles.fabWrap} pointerEvents="box-none">
          <Pressable
            onPress={handleAddCard}
            accessibilityRole="button"
            accessibilityLabel={t("a11y.addCard")}
            style={({ pressed }) => [styles.fab, { opacity: pressed ? 0.92 : 1 }]}
          >
            <Icon name="add" size={28} color={colors.onPrimary} />
          </Pressable>
        </View>
      )}

      {/* Klasör menüsü */}
      <BottomSheet visible={menuVisible} onClose={() => setMenuVisible(false)}>
        <Pressable
          style={styles.sheetRow}
          onPress={handleExportToExcel}
          disabled={exporting}
          accessibilityRole="button"
          accessibilityLabel={t("a11y.exportExcel")}
        >
          <Icon name="document-text-outline" size={22} color={colors.primary} />
          <AppText variant="bodyStrong" style={{ marginLeft: 12, flex: 1 }}>
            {exporting ? t("lists.exporting") : t("lists.exportToExcel")}
          </AppText>
          {!exporting && cards.length > 0 ? (
            <View style={styles.sheetBadge}>
              <AppText variant="caption" style={{ color: colors.primary }}>
                {cards.length}
              </AppText>
            </View>
          ) : null}
        </Pressable>

        <View style={styles.sheetDivider} />

        <Pressable
          style={styles.sheetRow}
          onPress={() => setMenuVisible(false)}
          accessibilityRole="button"
          accessibilityLabel={t("a11y.cancel")}
        >
          <Icon name="close-outline" size={22} color={colors.textSecondary} />
          <AppText variant="bodyStrong" color="textSecondary" style={{ marginLeft: 12 }}>
            {t("common.cancel")}
          </AppText>
        </Pressable>
      </BottomSheet>
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
      paddingHorizontal: 8,
    },
    cardAvatar: {
      width: 44,
      height: 44,
      borderRadius: radius.pill,
      backgroundColor: colors.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
    },
    listContent: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: 100,
    },
    fabWrap: {
      position: "absolute",
      right: spacing.lg,
      bottom: spacing.xl,
    },
    fab: {
      width: 60,
      height: 60,
      borderRadius: radius.pill,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOpacity: 0.3,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 5,
    },
    sheetRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
    },
    sheetBadge: {
      backgroundColor: colors.primaryMuted,
      paddingHorizontal: 9,
      paddingVertical: 2,
      borderRadius: radius.pill,
    },
    sheetDivider: {
      height: 1,
      backgroundColor: colors.border,
    },
  });
