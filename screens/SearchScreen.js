// screens/SearchScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import { colors } from '../utils/colors';
import { SearchService } from '../services/searchService';
import { FirestoreService } from '../services/firestoreService';
import SearchBar from '../components/SearchBar';
import SearchResultCard from '../components/SearchResultCard';

export default function SearchScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
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
      console.error('❌ Kategoriler yüklenemedi:', error);
    }
  };

  // Debounce timer için ref
  const searchTimeout = React.useRef(null);

  // Arama yap (debounce ile)
  const performSearch = useCallback(async (query, currentFilters) => {
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
        console.error('❌ Arama hatası:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [userId]);

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
    setSearchQuery('');
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
    navigation.navigate('CardDetail', { cardData: card });
  };

  const toggleFavoriteFilter = () => {
    setFilters(prev => ({
      ...prev,
      onlyFavorites: !prev.onlyFavorites,
    }));
  };

  const toggleQAFilter = () => {
    setFilters(prev => ({
      ...prev,
      minQAScore: prev.minQAScore === 80 ? null : 80,
    }));
  };

  const handleCategoryFilter = (categoryId) => {
    setFilters(prev => ({
      ...prev,
      categoryId: prev.categoryId === categoryId ? null : categoryId,
    }));
  };

  const renderResult = ({ item }) => (
    <SearchResultCard 
      card={item} 
      onPress={() => handleCardPress(item)} 
    />
  );

  const renderEmptyState = () => {
    if (loading) return null;

    if (!searchQuery.trim()) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={64} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>{t('screens.search.empty.title')}</Text>
          <Text style={styles.emptySubtitle}>
            {t('screens.search.empty.subtitle')}
          </Text>
        </View>
      );
    }

    if (results.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="sad-outline" size={64} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>{t('screens.search.noResults.title')}</Text>
          <Text style={styles.emptySubtitle}>
            {t('screens.search.noResults.subtitle', { query: searchQuery })}
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('screens.search.title')}</Text>
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
        <TouchableOpacity
          style={[
            styles.filterChip,
            filters.onlyFavorites && styles.filterChipActive,
          ]}
          onPress={toggleFavoriteFilter}
        >
          <Ionicons 
            name={filters.onlyFavorites ? "star" : "star-outline"} 
            size={16} 
            color={filters.onlyFavorites ? "#FFD700" : colors.textSecondary} 
          />
          <Text
            style={[
              styles.filterText,
              filters.onlyFavorites && styles.filterTextActive,
            ]}
          >
            {t('screens.search.filters.favorites')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            filters.minQAScore && styles.filterChipActive,
          ]}
          onPress={toggleQAFilter}
        >
          <Ionicons
            name="trophy"
            size={16}
            color={filters.minQAScore ? colors.success : colors.textSecondary}
          />
          <Text
            style={[
              styles.filterText,
              filters.minQAScore && styles.filterTextActive,
            ]}
          >
            {t('screens.search.filters.quality')}
          </Text>
        </TouchableOpacity>

        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.filterChip,
              filters.categoryId === cat.id && styles.filterChipActive,
            ]}
            onPress={() => handleCategoryFilter(cat.id)}
          >
            <Text style={styles.filterIcon}>{cat.icon}</Text>
            <Text 
              style={[
                styles.filterText,
                filters.categoryId === cat.id && styles.filterTextActive,
              ]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Results Count */}
      {searchQuery.trim() && !loading && (
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {t('screens.search.resultsCount', { count: results.length })}
          </Text>
        </View>
      )}

      {/* Search History */}
      {!searchQuery.trim() && searchHistory.length > 0 && (
        <View style={styles.historyContainer}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>{t('screens.search.history.title')}</Text>
            <TouchableOpacity
              onPress={async () => {
                await SearchService.clearSearchHistory();
                setSearchHistory([]);
              }}
            >
              <Text style={styles.historyClear}>{t('screens.search.history.clear')}</Text>
            </TouchableOpacity>
          </View>
          {searchHistory.map((item, index) => (
            <View key={index} style={styles.historyItem}>
              <TouchableOpacity
                style={styles.historyItemButton}
                onPress={() => handleHistoryItemPress(item)}
              >
                <Ionicons 
                  name="time-outline" 
                  size={18} 
                  color={colors.textSecondary} 
                />
                <Text style={styles.historyItemText}>{item}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleRemoveHistoryItem(item)}
                style={styles.historyRemove}
              >
                <Ionicons 
                  name="close" 
                  size={18} 
                  color={colors.textMuted} 
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Loading */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('screens.search.loading')}</Text>
        </View>
      )}

      {/* Results */}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={renderResult}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.resultsList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  filterIcon: {
    fontSize: 14,
  },
  filterText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  resultsCount: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '600',
  },
  historyContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMuted,
  },
  historyClear: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  historyItemButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  historyItemText: {
    fontSize: 14,
    color: colors.text,
  },
  historyRemove: {
    padding: 4,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textMuted,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  resultsList: {
    paddingBottom: 20,
  },
});