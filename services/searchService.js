// services/searchService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirestoreService } from './firestoreService';

const SEARCH_HISTORY_KEY = '@search_history';
const MAX_HISTORY_ITEMS = 5;

export const SearchService = {
  /**
   * Tüm kartlarda arama yap
   * @param {string} query - Arama terimi
   * @param {string} userId - Kullanıcı ID
   * @param {Object} filters - Filtreler { onlyFavorites, categoryId, minQAScore }
   * @returns {Promise<Array>} Filtrelenmiş kartlar
   */
  async searchCards(query, userId, filters = {}) {
    try {
      if (!userId) {
        throw new Error('User ID gerekli');
      }

      // Tüm kartları çek
      let cards = [];
      
      if (filters.categoryId) {
        // Belirli klasördeki kartları çek
        cards = await FirestoreService.getCardsByCategory(filters.categoryId, userId);
      } else {
        // Tüm kartları çek
        const categories = await FirestoreService.getUserCategories(userId);
        const allCardsPromises = categories.map(cat => 
          FirestoreService.getCardsByCategory(cat.id, userId)
        );
        const allCardsArrays = await Promise.all(allCardsPromises);
        cards = allCardsArrays.flat();
      }

      // Arama terimine göre filtrele
      if (query && query.trim()) {
        const searchTerm = query.toLowerCase().trim();
        
        cards = cards.filter(card => {
          const fields = card.fields || card;
          
          // Aranacak alanlar
          const searchableFields = [
            fields.name || '',
            fields.company || '',
            fields.email || '',
            fields.mobile || '',
            fields.phone || '',
            fields.title || '',
            fields.address || '',
            fields.website || '',
            fields.service || '',
            card.name || '',
            card.company || '',
            card.email || '',
          ];

          // Herhangi bir alanda eşleşme var mı?
          return searchableFields.some(field => 
            field.toLowerCase().includes(searchTerm)
          );
        });
      }

      // Favorilere göre filtrele
      if (filters.onlyFavorites) {
        cards = cards.filter(card => card.isFavorite === true);
      }

      // QA Score'a göre filtrele
      if (filters.minQAScore) {
        cards = cards.filter(card => 
          (card.qaScore || 0) >= filters.minQAScore
        );
      }

      // Tarihe göre sırala (en yeni en üstte)
      cards.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });

      console.log(`🔍 Arama sonucu: ${cards.length} kart bulundu`);
      return cards;

    } catch (error) {
      console.error('❌ SearchService searchCards error:', error);
      return [];
    }
  },

  /**
   * Arama geçmişine ekle
   * @param {string} query - Arama terimi
   */
  async addToHistory(query) {
    try {
      if (!query || !query.trim()) return;

      const trimmedQuery = query.trim();
      
      // Mevcut geçmişi al
      const history = await this.getSearchHistory();
      
      // Aynı arama varsa kaldır
      const filteredHistory = history.filter(item => item !== trimmedQuery);
      
      // Yeni aramayı en başa ekle
      const newHistory = [trimmedQuery, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);
      
      // Kaydet
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
      
      console.log('✅ Arama geçmişe eklendi:', trimmedQuery);
    } catch (error) {
      console.error('❌ addToHistory error:', error);
    }
  },

  /**
   * Arama geçmişini getir
   * @returns {Promise<Array<string>>} Arama geçmişi
   */
  async getSearchHistory() {
    try {
      const historyJson = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      
      if (historyJson) {
        return JSON.parse(historyJson);
      }
      
      return [];
    } catch (error) {
      console.error('❌ getSearchHistory error:', error);
      return [];
    }
  },

  /**
   * Arama geçmişini temizle
   */
  async clearSearchHistory() {
    try {
      await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
      console.log('✅ Arama geçmişi temizlendi');
    } catch (error) {
      console.error('❌ clearSearchHistory error:', error);
    }
  },

  /**
   * Geçmişten belirli bir öğeyi sil
   * @param {string} query - Silinecek arama terimi
   */
  async removeFromHistory(query) {
    try {
      const history = await this.getSearchHistory();
      const newHistory = history.filter(item => item !== query);
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
      console.log('✅ Arama geçmişten silindi:', query);
    } catch (error) {
      console.error('❌ removeFromHistory error:', error);
    }
  },

  /**
   * Hızlı filtreler için kart sayısını getir
   * @param {string} userId 
   * @returns {Promise<Object>} { total, favorites, highQuality }
   */
  async getFilterCounts(userId) {
    try {
      const categories = await FirestoreService.getUserCategories(userId);
      const allCardsPromises = categories.map(cat => 
        FirestoreService.getCardsByCategory(cat.id, userId)
      );
      const allCardsArrays = await Promise.all(allCardsPromises);
      const allCards = allCardsArrays.flat();

      const favorites = allCards.filter(card => card.isFavorite === true).length;
      const highQuality = allCards.filter(card => (card.qaScore || 0) >= 80).length;

      return {
        total: allCards.length,
        favorites,
        highQuality,
      };
    } catch (error) {
      console.error('❌ getFilterCounts error:', error);
      return { total: 0, favorites: 0, highQuality: 0 };
    }
  },
};