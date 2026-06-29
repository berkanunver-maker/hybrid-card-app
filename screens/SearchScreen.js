// screens/SearchScreen.js
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import { useTheme } from "../utils/theme";
import { useTranslation } from "../i18n/I18nProvider";
import { SearchService } from "../services/searchService";
import { FirestoreService } from "../services/firestoreService";
import SearchBar from "../components/SearchBar";
import SearchResultCard from "../components/SearchResultCard";
import {
  ScreenContainer,
  AppText,
  EmptyState,
  SectionHeader,
  Loader,
  Icon,
} from "../components/ui";

export default function SearchScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { colors, spacing, radius } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, spacing, radius),
    [colors, spacing, radius]
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [userId, setUserId] = useState(null);

  // Filtreler
  const [filters, setFilters] = useState({
    onlyFavorites: false,
    categoryId: null,
    minQAScore: null,
  });

  const auth = getAuth();

  // User ID'yi al
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserId(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  // Arama geçmişini yükle
  useEffect(() => {
    loadSearchHistory();
  }, []);

  // Kategorileri yükle
  useEffect(() => {
    if (userId) {
      loadCategories();
    }
  }, [userId]);

  const loadSearchHistory = async () => {
    const history = await SearchService.getSearchHistory();
    setSearchHistory(history);
  };

  const loadCategories = async () => {
    try {
      const cats = await FirestoreService.getUserCategories(userId);
      setCategories(cats);
    } catch (error) {
      // Kategoriler yüklenemedi — sessiz geç
    }
  };

  // Debounce timer için ref
  const searchTimeout = React.useRef(null);

  // Arama yap (debounce ile)
  const performSearch = useCallback(
    async (query, currentFilters) => {
      if (!userId) return;

      // Önceki timer'ı iptal et
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }

      // Boş sorgu ise sonuçları temizle
      if (!query.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      // 300ms bekle (debounce)
      searchTimeout.current = setTimeout(async () => {
        try {
          const searchResults = await SearchService.searchCards(
            query,
            userId,
            currentFilters
          );
          setResults(searchResults);

          // Arama geçmişine ekle
          if (query.trim()) {
            await SearchService.addToHistory(query);
            await loadSearchHistory();
          }
        } catch (error) {
          setResults([]);
        } finally {
          setLoading(false);
        }
      }, 300);
    },
    [userId]
  );

  // Arama query değiştiğinde
  useEffect(() => {
    performSearch(searchQuery, filters);
  }, [searchQuery, filters, performSearch]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  const handleClearSearch = () => {
    setSearchQuery("");
    setResults([]);
  };

  const handleHistoryItemPress = (query) => {
    setSearchQuery(query);
  };

  const handleRemoveHistoryItem = async (query) => {
    await SearchService.removeFromHistory(query);
    await loadSearchHistory();
  };

  const handleCardPress = (card) => {
    navigation.navigate("CardDetail", { cardData: card });
  };

  const toggleFavoriteFilter = () => {
    setFilters((prev) => ({
      ...prev,
      onlyFavorites: !prev.onlyFavorites,
    }));
  };

  const toggleQAFilter = () => {
    setFilters((prev) => ({
      ...prev,
      minQAScore: prev.minQAScore === 80 ? null : 80,
    }));
  };

  const handleCategoryFilter = (categoryId) => {
    setFilters((prev) => ({
      ...prev,
      categoryId: prev.categoryId === categoryId ? null : categoryId,
    }));
  };

  const renderFilterChip = ({
    chipKey,
    active,
    onPress,
    leading,
    label,
    accessibilityLabel,
  }) => (
    <Pressable
      key={chipKey}
      style={[styles.filterChip, active && styles.filterChipActive]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={accessibilityLabel || label}
    >
      {leading}
      <AppText
        variant="caption"
        style={active ? styles.filterTextActive : styles.filterText}
      >
        {label}
      </AppText>
    </Pressable>
  );

  const renderResult = ({ item }) => (
    <SearchResultCard card={item} onPress={() => handleCardPress(item)} />
  );

  const renderEmptyState = () => {
    if (loading) return null;

    if (!searchQuery.trim()) {
      return (
        <EmptyState
          icon="search-outline"
          title={t("search.emptyTitle")}
          description={t("search.emptyDescription")}
        />
      );
    }

    if (results.length === 0) {
      return (
        <EmptyState
          icon="sad-outline"
          title={t("search.noResultsTitle")}
          description={t("search.noResultsDescription", { query: searchQuery })}
        />
      );
    }

    return null;
  };

  return (
    <ScreenContainer>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Geri"
        >
          <Icon name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <AppText variant="title">{t("common.search")}</AppText>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onClear={handleClearSearch}
      />

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        {renderFilterChip({
          active: filters.onlyFavorites,
          onPress: toggleFavoriteFilter,
          accessibilityLabel: "Favoriler filtresi",
          leading: (
            <Icon
              name={filters.onlyFavorites ? "star" : "star-outline"}
              size={16}
              color={filters.onlyFavorites ? colors.star : colors.textSecondary}
            />
          ),
          label: t("search.filterFavorites"),
        })}

        {renderFilterChip({
          active: !!filters.minQAScore,
          onPress: toggleQAFilter,
          accessibilityLabel: "Kaliteli kartlar filtresi",
          leading: (
            <Icon
              name="trophy"
              size={16}
              color={filters.minQAScore ? colors.success : colors.textSecondary}
            />
          ),
          label: t("search.filterHighQuality"),
        })}

        {categories.map((cat) =>
          renderFilterChip({
            chipKey: cat.id,
            active: filters.categoryId === cat.id,
            onPress: () => handleCategoryFilter(cat.id),
            accessibilityLabel: `${cat.name} kategorisi filtresi`,
            leading: <AppText style={styles.filterIcon}>{cat.icon}</AppText>,
            label: cat.name,
          })
        )}
      </ScrollView>

      {/* Results Count */}
      {searchQuery.trim() && !loading ? (
        <View style={styles.resultsHeader}>
          <AppText variant="caption" color="textMuted">
            {t("search.resultsCount", { count: results.length })}
          </AppText>
        </View>
      ) : null}

      {/* Search History */}
      {!searchQuery.trim() && searchHistory.length > 0 ? (
        <View style={styles.historyContainer}>
          <SectionHeader
            title={t("search.recentSearches")}
            action={
              <Pressable
                onPress={async () => {
                  await SearchService.clearSearchHistory();
                  setSearchHistory([]);
                }}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Arama geçmişini temizle"
              >
                <AppText variant="caption" color="primary">
                  {t("search.clear")}
                </AppText>
              </Pressable>
            }
          />
          {searchHistory.map((item, index) => (
            <View key={index} style={styles.historyItem}>
              <Pressable
                style={styles.historyItemButton}
                onPress={() => handleHistoryItemPress(item)}
                accessibilityRole="button"
                accessibilityLabel={`${item} aramasını tekrarla`}
              >
                <Icon name="time-outline" size={18} color={colors.textSecondary} />
                <AppText variant="body" style={styles.historyItemText} numberOfLines={1}>
                  {item}
                </AppText>
              </Pressable>
              <Pressable
                onPress={() => handleRemoveHistoryItem(item)}
                style={styles.historyRemove}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`${item} aramasını geçmişten kaldır`}
              >
                <Icon name="close" size={18} color={colors.textMuted} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}

      {/* Loading */}
      <Loader visible={loading} text={t("search.searching")} />

      {/* Results */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={renderResult}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.resultsList}
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

const createStyles = (colors, spacing, radius) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.xl,
      marginBottom: spacing.sm,
    },
    backButton: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
      marginLeft: -8,
    },
    placeholder: {
      width: 44,
    },
    filtersContainer: {
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.md,
      gap: spacing.sm,
    },
    filterChip: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.pill,
      gap: 6,
      borderWidth: 1,
      borderColor: colors.border,
    },
    filterChipActive: {
      backgroundColor: colors.primaryMuted,
      borderColor: colors.primary,
    },
    filterIcon: {
      fontSize: 14,
    },
    filterText: {
      color: colors.textSecondary,
    },
    filterTextActive: {
      color: colors.primary,
    },
    resultsHeader: {
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
    },
    historyContainer: {
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
    },
    historyItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    historyItemButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      minHeight: 28,
    },
    historyItemText: {
      flex: 1,
    },
    historyRemove: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    resultsList: {
      paddingBottom: spacing.xl,
    },
  });
