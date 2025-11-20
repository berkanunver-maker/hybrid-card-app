// screens/FolderScreen.js
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { colors } from "../utils/colors";
import { FirestoreService } from "../services/firestoreService";
import ExcelService from "../services/excelService";
import { getAuth } from "firebase/auth";

export default function FolderScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { category } = route.params; // { id, name, icon, color }

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [exporting, setExporting] = useState(false);

  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  // Kartları yükle
  const loadCards = async () => {
    try {
      setLoading(true);
      const fetchedCards = await FirestoreService.getCardsByCategory(category.id, userId);
      setCards(fetchedCards);
    } catch (error) {
      console.error("❌ Kartlar yüklenemedi:", error);
      Alert.alert(t('common.error'), t('screens.folder.errors.loadFailed'));
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

  // 📊 Excel'e aktar (YENİ!)
  const handleExportToExcel = async () => {
    try {
      setMenuVisible(false);

      if (cards.length === 0) {
        Alert.alert(t('common.warning'), t('screens.folder.errors.noCardsToExport'));
        return;
      }

      setExporting(true);

      // Excel oluştur ve paylaş
      await ExcelService.exportFolderToExcel(cards, category.name);

      Alert.alert(
        t('common.success'),
        t('screens.folder.success.exported', { count: cards.length })
      );

      setExporting(false);
    } catch (error) {
      console.error("❌ Excel export hatası:", error);
      setExporting(false);
      Alert.alert(
        t('common.error'),
        t('screens.folder.errors.exportFailed')
      );
    }
  };

  // Kart render
  const renderCard = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => handleCardPress(item)}>
      <View style={styles.cardLeft}>
        <Text style={styles.cardIcon}>{category.icon}</Text>
        <View style={styles.cardInfo}>
          <Text style={styles.cardName} numberOfLines={1}>
            {item.fields?.name || item.name || t('screens.folder.unknownCard')}
          </Text>
          <Text style={styles.cardCompany} numberOfLines={1}>
            {item.fields?.company || item.company || t('screens.folder.unknownCompany')}
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
        <View style={styles.headerCenter}>
          <Text style={styles.headerIcon}>{category.icon}</Text>
          <Text style={styles.headerTitle}>{category.name}</Text>
        </View>
        {/* Menü Butonu (YENİ!) */}
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setMenuVisible(true)}
        >
          <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Kart Listesi */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('screens.folder.loading')}</Text>
        </View>
      ) : cards.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔭</Text>
          <Text style={styles.emptyText}>{t('screens.folder.empty')}</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddCard}>
            <Ionicons name="camera" size={20} color="#fff" />
            <Text style={styles.addButtonText}>{t('screens.folder.emptyButton')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={cards}
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
              {t('screens.folder.cardCount', { count: cards.length })}
            </Text>
          }
        />
      )}

      {/* Floating Ekle Butonu */}
      {cards.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={handleAddCard}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Menü Modal (YENİ!) */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            {/* Excel'e Aktar */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleExportToExcel}
              disabled={exporting}
            >
              {exporting ? (
                <>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.menuItemText}>{t('screens.folder.menu.exporting')}</Text>
                </>
              ) : (
                <>
                  <Ionicons name="document-text-outline" size={22} color={colors.primary} />
                  <Text style={styles.menuItemText}>{t('screens.folder.menu.exportExcel')}</Text>
                  {cards.length > 0 && (
                    <Text style={styles.menuItemBadge}>{cards.length}</Text>
                  )}
                </>
              )}
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            {/* İptal */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setMenuVisible(false)}
            >
              <Ionicons name="close-outline" size={22} color={colors.textSecondary} />
              <Text style={[styles.menuItemText, { color: colors.textSecondary }]}>
                {t('screens.folder.menu.cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  headerIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
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
    fontSize: 16,
    color: colors.secondaryText,
    textAlign: "center",
    marginBottom: 24,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
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
  },
  cardIcon: {
    fontSize: 32,
    marginRight: 12,
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
  },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  
  // Menü stilleri (YENİ!)
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuContainer: {
    backgroundColor: colors.cardBackground || "#1C1C1E",
    borderRadius: 12,
    minWidth: 250,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    flex: 1,
  },
  menuItemBadge: {
    backgroundColor: colors.primary + "30",
    color: colors.primary,
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border || "#2C2C2E",
    marginHorizontal: 16,
  },
});