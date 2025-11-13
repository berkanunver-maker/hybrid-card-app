// screens/HomeScreen.js
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { colors } from "../utils/colors";
import { FirestoreService } from "../services/firestoreService";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import CreateFolderModal from "../components/CreateFolderModal";
import EditFolderModal from "../components/EditFolderModal";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";
import ExcelService from "../services/excelService";

export default function HomeScreen() {
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);
  const [recentCards, setRecentCards] = useState([]);
  const [totalCards, setTotalCards] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [userId, setUserId] = useState(null);
  
  // Yeni state'ler - klasör yönetimi
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [exporting, setExporting] = useState(false); // YENİ!

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadCategories = async () => {
    if (!userId) return;

    try {
      await FirestoreService.createDefaultCategory(userId);
      const fetchedCategories = await FirestoreService.getUserCategories(userId);
      setCategories(fetchedCategories);

      const total = fetchedCategories.reduce((sum, cat) => sum + (cat.cardCount || 0), 0);
      setTotalCards(total);

      const favorites = await FirestoreService.getFavoriteCards(userId);
      setFavoriteCount(favorites.length);

      const recent = await FirestoreService.getRecentCards(userId, 5);
      setRecentCards(recent);
    } catch (error) {
      console.error("❌ Hata:", error.message);
    }
  };

  useEffect(() => {
    if (userId) loadCategories();
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      if (userId) loadCategories();
    }, [userId])
  );

  // Klasör menüsünü aç
  const handleFolderMenu = (folder) => {
    setSelectedFolder(folder);
    setMenuVisible(true);
  };

  // Klasör düzenleme
  const handleEditFolder = () => {
    setMenuVisible(false);
    setTimeout(() => {
      setEditModalVisible(true);
    }, 300);
  };

  // 📊 Excel export (YENİ!)
  const handleExportFolder = async () => {
    try {
      console.log('🔍 handleExportFolder çağrıldı!');
      console.log('🔍 selectedFolder:', selectedFolder);
      
      setMenuVisible(false);
      
      if (!selectedFolder) {
        console.log('❌ selectedFolder yok!');
        return;
      }

      console.log('🔍 Kartlar çekiliyor...');
      // Klasördeki kartları çek
      const cards = await FirestoreService.getCardsByCategory(selectedFolder.id, userId);
      
      console.log('🔍 Çekilen kart sayısı:', cards.length);
      
      if (cards.length === 0) {
        Alert.alert("Uyarı", "Bu klasörde aktarılacak kart bulunmuyor.");
        return;
      }

      console.log('🔍 Excel oluşturuluyor...');
      setExporting(true);

      // Excel oluştur ve paylaş
      await ExcelService.exportFolderToExcel(cards, selectedFolder.name);
      
      console.log('✅ Excel oluşturuldu!');
      Alert.alert("Başarılı! 📊", `${cards.length} kart Excel'e aktarıldı.`);
      
      setExporting(false);
    } catch (error) {
      console.error("❌ Excel export hatası:", error);
      setExporting(false);
      Alert.alert("Hata", "Excel dosyası oluşturulamadı. Lütfen tekrar deneyin.");
    }
  };

  // Klasör silme
  const handleDeleteFolder = () => {
    setMenuVisible(false);
    setTimeout(() => {
      setDeleteDialogVisible(true);
    }, 300);
  };

  // Klasör silme onayı
  const handleConfirmDelete = async (moveCards) => {
    if (!selectedFolder) return;

    try {
      // Varsayılan klasörü bul (kartları taşımak için)
      const defaultFolder = categories.find(cat => cat.isDefault);
      
      const options = {
        deleteCards: !moveCards,
        moveToFolderId: moveCards ? defaultFolder?.id : null,
      };

      await FirestoreService.deleteCategory(selectedFolder.id, options);
      
      Alert.alert(
        "Başarılı", 
        moveCards 
          ? `"${selectedFolder.name}" klasörü silindi. Kartlar "Genel" klasörüne taşındı.`
          : `"${selectedFolder.name}" klasörü ve tüm kartları silindi.`
      );
      
      setSelectedFolder(null);
      loadCategories();
    } catch (error) {
      console.error("❌ Klasör silinemedi:", error);
      Alert.alert("Hata", "Klasör silinemedi: " + error.message);
    }
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return "";
    const now = new Date();
    const cardDate = new Date(timestamp);
    const diffMs = now - cardDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Az önce";
    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays === 1) return "Dün";
    if (diffDays < 7) return `${diffDays} gün önce`;
    return cardDate.toLocaleDateString("tr-TR");
  };

  const renderRecentCard = ({ item }) => {
    const fields = item.fields || item;
    const name = fields.name || item.name || "İsimsiz";
    const company = fields.company || item.company || "Şirket bilgisi yok";
    
    return (
      <TouchableOpacity
        style={styles.recentCard}
        onPress={() => navigation.navigate("CardDetail", { cardData: item })}
      >
        <View style={styles.recentCardIconContainer}>
          <Ionicons name="person" size={24} color={colors.primary} />
        </View>
        <View style={styles.recentCardInfo}>
          <Text style={styles.recentCardName} numberOfLines={1}>{name}</Text>
          <Text style={styles.recentCardCompany} numberOfLines={1}>{company}</Text>
          <Text style={styles.recentCardTime}>{getTimeAgo(item.createdAt)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => navigation.navigate("Folder", { category: item })}
    >
      <View style={styles.categoryLeft}>
        <Text style={styles.categoryIcon}>{item.icon}</Text>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryName}>{item.name}</Text>
          <View style={styles.categoryMeta}>
            <Text style={styles.categoryCount}>{item.cardCount || 0} kart</Text>
            {item.lastCardAddedAt && (
              <>
                <Text style={styles.categoryDot}> • </Text>
                <Text style={styles.categoryTime}>{getTimeAgo(item.lastCardAddedAt)}</Text>
              </>
            )}
          </View>
        </View>
      </View>
      
      {/* Menü Butonu */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={(e) => {
          e.stopPropagation();
          handleFolderMenu(item);
        }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.hello}>Hello,</Text>
          <Text style={styles.subtitle}>{totalCards} kartvizit • {categories.length} klasör</Text>
        </View>
        <View style={styles.iconsRight}>
          <TouchableOpacity onPress={() => Alert.alert("Bildirimler", "Yakında!")}>
            <Ionicons name="notifications-outline" size={24} color={colors.primary} style={styles.icon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Stats")}>
            <Ionicons name="bar-chart-outline" size={24} color={colors.primary} style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Box - Tıklayınca SearchScreen'e gider */}
      <TouchableOpacity 
        style={styles.searchContainer}
        onPress={() => navigation.navigate('Search')}
        activeOpacity={0.7}
      >
        <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <Text style={styles.searchPlaceholder}>İsim, şirket, hizmet ara...</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.quickAccessContainer}>
          <TouchableOpacity style={styles.quickAccessButton} onPress={() => navigation.navigate("Favorites")}>
            <View style={styles.quickAccessIconContainer}>
              <Ionicons name="star" size={24} color="#FFD700" />
            </View>
            <Text style={styles.quickAccessLabel}>Favoriler</Text>
            <Text style={styles.quickAccessCount}>{favoriteCount} kart</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAccessButton} onPress={() => Alert.alert("Tüm Kartlar", "Yakında!")}>
            <View style={styles.quickAccessIconContainer}>
              <Ionicons name="albums" size={24} color={colors.primary} />
            </View>
            <Text style={styles.quickAccessLabel}>Tüm Kartlar</Text>
            <Text style={styles.quickAccessCount}>{totalCards} kart</Text>
          </TouchableOpacity>
        </View>

        {recentCards.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📌 SON EKLENENLER</Text>
            <FlatList
              data={recentCards}
              keyExtractor={(item) => item.id}
              renderItem={renderRecentCard}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentList}
            />
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📁 KLASÖRLER</Text>
            <TouchableOpacity style={styles.newFolderButton} onPress={() => setModalVisible(true)}>
              <Ionicons name="add-circle" size={20} color={colors.primary} />
              <Text style={styles.newFolderButtonText}>Yeni Klasör</Text>
            </TouchableOpacity>
          </View>
          
          {categories.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Henüz klasör yok</Text>
              <Text style={styles.emptyStateSubtext}>"Yeni Klasör" butonuna tıklayarak başlayın</Text>
            </View>
          ) : (
            categories.map((item) => <View key={item.id}>{renderCategory({ item })}</View>)
          )}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.scanButton} onPress={() => navigation.navigate("Camera")}>
        <Ionicons name="camera" size={24} color="#fff" />
        <Text style={styles.scanButtonText}>Yeni Kart Tara</Text>
      </TouchableOpacity>

      <CreateFolderModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onFolderCreated={() => { setModalVisible(false); loadCategories(); }}
      />

      {/* Menü Modal - GÜNCELLENMİŞ! */}
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
            {/* Düzenle */}
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleEditFolder}
            >
              <Ionicons name="create-outline" size={22} color={colors.primary} />
              <Text style={styles.menuItemText}>Düzenle</Text>
            </TouchableOpacity>
            
            <View style={styles.menuDivider} />
            
            {/* Excel'e Aktar (YENİ!) */}
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleExportFolder}
              disabled={exporting}
            >
              {exporting ? (
                <>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.menuItemText}>Excel oluşturuluyor...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="document-text-outline" size={22} color={colors.primary} />
                  <Text style={styles.menuItemText}>Excel'e Aktar</Text>
                  {selectedFolder?.cardCount > 0 && (
                    <Text style={styles.menuItemBadge}>{selectedFolder.cardCount}</Text>
                  )}
                </>
              )}
            </TouchableOpacity>
            
            <View style={styles.menuDivider} />
            
            {/* Sil */}
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleDeleteFolder}
            >
              <Ionicons name="trash-outline" size={22} color="#EF4444" />
              <Text style={[styles.menuItemText, styles.menuItemDanger]}>Sil</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Edit Folder Modal */}
      <EditFolderModal
        visible={editModalVisible}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedFolder(null);
        }}
        onFolderUpdated={() => {
          setEditModalVisible(false);
          setSelectedFolder(null);
          loadCategories();
        }}
        folder={selectedFolder}
      />

      {/* Delete Confirm Dialog */}
      <DeleteConfirmDialog
        visible={deleteDialogVisible}
        onClose={() => {
          setDeleteDialogVisible(false);
          setSelectedFolder(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Klasörü Sil?"
        message="Bu işlem geri alınamaz."
        itemName={selectedFolder?.name}
        itemCount={selectedFolder?.cardCount || 0}
        showMoveOption={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: 60 },
  scrollContent: { paddingBottom: 100 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 20 },
  hello: { color: colors.text, fontSize: 26, fontWeight: "700" },
  subtitle: { color: colors.textSecondary, fontSize: 14, marginTop: 4 },
  iconsRight: { flexDirection: "row", alignItems: "center" },
  icon: { marginLeft: 16 },
  searchContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: colors.cardBackground, 
    marginHorizontal: 20, 
    marginBottom: 16, 
    padding: 12, 
    borderRadius: 12 
  },
  searchIcon: { marginRight: 8 },
  searchPlaceholder: { 
    flex: 1, 
    color: colors.textMuted, 
    fontSize: 16 
  },
  quickAccessContainer: { flexDirection: "row", paddingHorizontal: 20, marginBottom: 20, gap: 12 },
  quickAccessButton: { 
    flex: 1, 
    backgroundColor: colors.cardBackground, 
    padding: 16, 
    borderRadius: 12, 
    alignItems: "center" 
  },
  quickAccessIconContainer: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    backgroundColor: colors.background, 
    justifyContent: "center", 
    alignItems: "center", 
    marginBottom: 8 
  },
  quickAccessLabel: { color: colors.text, fontSize: 14, fontWeight: "600", marginBottom: 4 },
  quickAccessCount: { color: colors.textSecondary, fontSize: 12 },
  section: { marginBottom: 20 },
  sectionTitle: { 
    fontSize: 14, 
    fontWeight: "700", 
    color: colors.textMuted,
    paddingHorizontal: 20, 
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  recentList: { paddingHorizontal: 20, gap: 12 },
  recentCard: { 
    width: 160, 
    backgroundColor: colors.cardBackground, 
    borderRadius: 12, 
    padding: 12, 
    marginRight: 12 
  },
  recentCardIconContainer: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    backgroundColor: colors.background, 
    justifyContent: "center", 
    alignItems: "center", 
    marginBottom: 8 
  },
  recentCardInfo: { flex: 1 },
  recentCardName: { fontSize: 14, fontWeight: "600", color: colors.text, marginBottom: 4 },
  recentCardCompany: { 
    fontSize: 12, 
    color: colors.textSecondary,
    marginBottom: 6 
  },
  recentCardTime: { fontSize: 11, color: colors.primary },
  sectionHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    paddingHorizontal: 20, 
    marginBottom: 12 
  },
  newFolderButton: { flexDirection: "row", alignItems: "center", gap: 4 },
  newFolderButtonText: { fontSize: 14, fontWeight: "600", color: colors.primary },
  emptyState: { padding: 40, alignItems: "center" },
  emptyStateText: { fontSize: 16, fontWeight: "600", color: colors.text, marginBottom: 8 },
  emptyStateSubtext: { fontSize: 14, color: colors.textSecondary, textAlign: "center" },
  categoryCard: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between", 
    backgroundColor: colors.cardBackground, 
    padding: 16, 
    borderRadius: 12, 
    marginBottom: 12, 
    marginHorizontal: 20 
  },
  categoryLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  categoryIcon: { fontSize: 32, marginRight: 12 },
  categoryInfo: { justifyContent: "center", flex: 1 },
  categoryName: { fontSize: 16, fontWeight: "600", color: colors.text, marginBottom: 4 },
  categoryMeta: { flexDirection: "row", alignItems: "center" },
  categoryCount: { fontSize: 12, color: colors.textSecondary },
  categoryDot: { fontSize: 12, color: colors.textSecondary },
  categoryTime: { fontSize: 12, color: colors.primary },
  menuButton: {
    padding: 8,
    marginLeft: 8,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuContainer: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    minWidth: 200,
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
  menuItemDanger: {
    color: "#EF4444",
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border || "#2C2C2E",
    marginHorizontal: 16,
  },
  scanButton: { 
    position: "absolute", 
    bottom: 20, 
    left: 20, 
    right: 20, 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center", 
    backgroundColor: colors.primary, 
    padding: 16, 
    borderRadius: 12, 
    gap: 8, 
    shadowColor: "#000", 
    shadowOpacity: 0.3, 
    shadowRadius: 8, 
    elevation: 5 
  },
  scanButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});