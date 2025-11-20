import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { colors } from "../utils/colors";
import { voiceService } from "../services/voiceService";
import { FirestoreService } from "../services/firestoreService";
import MoveCardModal from "../components/MoveCardModal";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";
import { getAuth } from "firebase/auth";

export default function CardDetailScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { cardData: initialCardData, isNewCard } = route.params || {};

  const [cardData, setCardData] = useState(initialCardData);
  const [playing, setPlaying] = useState(false);
  const [isFavorite, setIsFavorite] = useState(initialCardData?.isFavorite || false);
  const [saving, setSaving] = useState(false);
  
  // Yeni state'ler - düzenleme ve modal yönetimi
  const [isEditing, setIsEditing] = useState(false);
  const [editedFields, setEditedFields] = useState({});
  const [categories, setCategories] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [moveModalVisible, setMoveModalVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  // Kategorileri yükle
  useEffect(() => {
    const loadCategories = async () => {
      if (userId) {
        try {
          const fetchedCategories = await FirestoreService.getUserCategories(userId);
          setCategories(fetchedCategories);
        } catch (error) {
          console.error("❌ Kategoriler yüklenemedi:", error);
        }
      }
    };
    loadCategories();
  }, [userId]);

  // 🔹 Kart verisi yoksa
  if (!cardData) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>{t('cardDetail.errors.notFound')}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.text, { color: colors.primary, marginTop: 10 }]}>
            {t('common.back')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ✅ Fields düzeltmesi — hem `fields` hem düz yapıyı destekler
  const fields =
    (cardData.fields && Object.keys(cardData.fields).length > 0
      ? cardData.fields
      : cardData) || {};

  // ✅ Ses notunu hem fields içinde hem dışarıda ara
  const voiceNote = cardData.voice_note || fields.voice_note || null;
  const voiceText = voiceNote?.text || null;

  console.log("🔍 [DEBUG] cardData:", cardData);
  console.log("🔍 [DEBUG] isNewCard:", isNewCard);
  console.log("🔍 [DEBUG] fields:", fields);
  console.log("🔍 [DEBUG] voiceNote:", voiceNote);
  console.log("🔍 [DEBUG] voiceText:", voiceText);

  // 💾 Kartı Firestore'a kaydet
  const handleSaveCard = async () => {
    try {
      setSaving(true);

      // Firestore'a kaydet
      const savedCard = await FirestoreService.addCard(cardData);
      console.log("✅ Kart Firestore'a kaydedildi:", savedCard.id);

      // Kaydedilen kartın tam detayını çek
      const fullCard = await FirestoreService.getCardById(savedCard.id);

      // State'i güncelle
      setCardData(fullCard);

      Alert.alert(
        t('cardDetail.success.saveTitle'),
        t('cardDetail.success.saved'),
        [
          {
            text: t('cardDetail.actions.goHome'),
            onPress: () => navigation.navigate("Main"),
          },
          {
            text: t('cardDetail.actions.scanNewCard'),
            onPress: () => navigation.navigate("Camera"),
          },
        ]
      );

      setSaving(false);
      
      // Navigate'i route params'dan kaldır
      navigation.setParams({ isNewCard: false });
      
    } catch (error) {
      console.error("❌ Kart kaydedilemedi:", error);
      setSaving(false);
      Alert.alert(t('common.error'), t('cardDetail.errors.saveFailed'));
    }
  };

  // 🎧 Ses oynatma
  const playVoiceNote = async () => {
    try {
      if (!voiceService?.playAudio) {
        throw new Error(t('cardDetail.errors.voiceServiceNotFound'));
      }
      setPlaying(true);
      await voiceService.playAudio(voiceNote?.audioUrl);
    } catch (err) {
      console.error("🎧 Ses oynatma hatası:", err);
    } finally {
      setPlaying(false);
    }
  };

  // ⭐ Favori toggle
  const toggleFavorite = async () => {
    try {
      const newFavoriteStatus = !isFavorite;
      setIsFavorite(newFavoriteStatus);

      // Firestore'u güncelle (sadece kaydedilmiş kartlar için)
      if (cardData.id) {
        await FirestoreService.updateCard(cardData.id, {
          isFavorite: newFavoriteStatus,
        });
        console.log("✅ Favori durumu güncellendi:", newFavoriteStatus);
      }
    } catch (error) {
      console.error("❌ Favori güncellenemedi:", error);
      // Hata durumunda geri al
      setIsFavorite(!isFavorite);
      Alert.alert(t('common.error'), t('cardDetail.errors.favoriteUpdateFailed'));
    }
  };

  // 📁 Kategori değiştir
  const handleChangeCategory = () => {
    setMoveModalVisible(true);
  };

  // 🔄 Kartı taşı
  const handleMoveCard = async (newCategoryId) => {
    try {
      if (!cardData.id || !cardData.categoryId) {
        Alert.alert(t('common.error'), t('cardDetail.errors.missingData'));
        return;
      }

      await FirestoreService.moveCard(
        cardData.id,
        cardData.categoryId,
        newCategoryId
      );

      // Yeni kategori bilgisini al
      const newCategory = categories.find(cat => cat.id === newCategoryId);

      setCardData({
        ...cardData,
        categoryId: newCategoryId,
        categoryName: newCategory?.name
      });

      Alert.alert(t('common.success'), t('cardDetail.success.moved', { name: newCategory?.name }));
    } catch (error) {
      console.error("❌ Kart taşınamadı:", error);
      Alert.alert(t('common.error'), t('cardDetail.errors.moveFailed') + ' ' + error.message);
    }
  };

  // ✏️ Düzenleme modunu aç/kapat
  const toggleEditMode = () => {
    if (isEditing) {
      // Kaydet
      handleSaveEdits();
    } else {
      // Düzenleme moduna geç
      const fields = cardData.fields || cardData;
      setEditedFields({
        name: fields.name || "",
        company: fields.company || "",
        title: fields.title || "",
        mobile: fields.mobile || "",
        phone: fields.phone || "",
        email: fields.email || "",
        address: fields.address || "",
        website: fields.website || "",
      });
      setIsEditing(true);
    }
  };

  // 💾 Düzenlemeleri kaydet
  const handleSaveEdits = async () => {
    try {
      if (!cardData.id) {
        Alert.alert(t('common.error'), t('cardDetail.errors.notSaved'));
        return;
      }

      setSaving(true);

      await FirestoreService.updateCard(cardData.id, {
        fields: editedFields,
        name: editedFields.name,
        company: editedFields.company,
        updatedAt: new Date().toISOString(),
      });

      setCardData({
        ...cardData,
        fields: editedFields,
        name: editedFields.name,
        company: editedFields.company,
      });

      setIsEditing(false);
      setSaving(false);
      Alert.alert(t('common.success'), t('cardDetail.success.updated'));
    } catch (error) {
      console.error("❌ Kart güncellenemedi:", error);
      setSaving(false);
      Alert.alert(t('common.error'), t('cardDetail.errors.updateFailed') + ' ' + error.message);
    }
  };

  // İptal et
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedFields({});
  };

  // 🗑️ Kartı sil
  const handleDeleteCard = () => {
    setDeleteDialogVisible(true);
  };

  // Silme onayı
  const handleConfirmDelete = async () => {
    try {
      if (cardData.id) {
        await FirestoreService.deleteCard(cardData.id);
        console.log("✅ Kart silindi:", cardData.id);
        Alert.alert(t('common.success'), t('cardDetail.success.deleted'));
        navigation.goBack();
      }
    } catch (error) {
      console.error("❌ Kart silinemedi:", error);
      Alert.alert(t('common.error'), t('cardDetail.errors.deleteFailed'));
    }
  };

  // Menü işlemleri
  const handleMenuEdit = () => {
    setMenuVisible(false);
    setTimeout(() => toggleEditMode(), 300);
  };

  const handleMenuMove = () => {
    setMenuVisible(false);
    setTimeout(() => setMoveModalVisible(true), 300);
  };

  const handleMenuDelete = () => {
    setMenuVisible(false);
    setTimeout(() => setDeleteDialogVisible(true), 300);
  };

  // 🔹 Sabit alan listesi — boşlar "—"
  const infoItems = [
    { icon: "🏢", label: t('cardDetail.fields.company'), value: fields.company || "—", fieldKey: "company" },
    { icon: "👤", label: t('cardDetail.fields.name'), value: fields.name || "—", fieldKey: "name" },
    { icon: "💼", label: t('cardDetail.fields.position'), value: fields.title || "—", fieldKey: "title" },
    { icon: "📞", label: t('cardDetail.fields.mobile'), value: fields.mobile || "—", fieldKey: "mobile" },
    { icon: "☎️", label: t('cardDetail.fields.phone'), value: fields.phone || "—", fieldKey: "phone" },
    { icon: "📧", label: t('cardDetail.fields.email'), value: fields.email || "—", fieldKey: "email" },
    { icon: "📍", label: t('cardDetail.fields.address'), value: fields.address || "—", fieldKey: "address" },
    { icon: "🌐", label: t('cardDetail.fields.website'), value: fields.website || "—", fieldKey: "website" },
  ];

  return (
    <View style={styles.container}>
      {/* 🔧 FIXED HEADER - Padding ve Flex düzeltildi */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={26} color={colors.primary} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle} numberOfLines={1}>
          {isNewCard ? t('cardDetail.preview') : t('cardDetail.title')}
        </Text>
        
        <View style={styles.headerRight}>
          {/* 💾 KAYDET BUTONU (Sadece yeni kartlar için) */}
          {isNewCard && (
            <TouchableOpacity 
              onPress={handleSaveCard} 
              style={styles.iconButton}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Ionicons name="save-outline" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>
          )}
          
          {/* ✏️ DÜZENLE/KAYDET BUTONU (Kaydedilmiş kartlar için) */}
          {!isNewCard && (
            <TouchableOpacity 
              onPress={toggleEditMode} 
              style={styles.iconButton}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Ionicons 
                  name={isEditing ? "checkmark" : "create-outline"} 
                  size={24} 
                  color={isEditing ? "#10B981" : colors.primary} 
                />
              )}
            </TouchableOpacity>
          )}
          
          {/* ⭐ Favori Butonu (Sadece kaydedilmiş kartlar için) */}
          {!isNewCard && (
            <TouchableOpacity onPress={toggleFavorite} style={styles.iconButton}>
              <Ionicons
                name={isFavorite ? "star" : "star-outline"}
                size={24}
                color={isFavorite ? "#FFD700" : colors.primary}
              />
            </TouchableOpacity>
          )}
          
          {/* ⋮ MENÜ BUTONU (Kaydedilmiş kartlar için) */}
          {!isNewCard && (
            <TouchableOpacity 
              onPress={() => setMenuVisible(true)} 
              style={styles.iconButton}
            >
              <Ionicons name="ellipsis-vertical" size={24} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* İPTAL BUTONU (Düzenleme modunda) */}
      {isEditing && (
        <View style={styles.editBanner}>
          <Text style={styles.editBannerText}>{t('cardDetail.editMode')}</Text>
          <TouchableOpacity onPress={handleCancelEdit}>
            <Text style={styles.editBannerCancel}>{t('cardDetail.cancelButton')}</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ⚠️ Yeni Kart Uyarısı */}
        {isNewCard && (
          <View style={styles.warningBanner}>
            <Ionicons name="information-circle" size={24} color="#FF9500" />
            <Text style={styles.warningText}>
              {t('cardDetail.notSavedWarning')}
            </Text>
          </View>
        )}

        {/* 📁 Kategori Badge */}
        {cardData.categoryName && (
          <TouchableOpacity
            style={styles.categoryBadge}
            onPress={handleChangeCategory}
          >
            <Text style={styles.categoryIcon}>📁</Text>
            <Text style={styles.categoryText}>{cardData.categoryName}</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.secondaryText} />
          </TouchableOpacity>
        )}

        {/* 🔹 Bilgi Alanları */}
        <View style={styles.card}>
          {infoItems.map((item, index) => (
            <View key={index} style={{ marginBottom: 10 }}>
              <Text style={styles.label}>
                {item.icon} {item.label}
              </Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editedFields[item.fieldKey] || ""}
                  onChangeText={(text) => 
                    setEditedFields({ ...editedFields, [item.fieldKey]: text })
                  }
                  placeholder={item.label}
                  placeholderTextColor="#777"
                />
              ) : (
                <Text
                  style={[
                    styles.value,
                    item.value === "—" && { color: "#777" },
                  ]}
                >
                  {item.value}
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* 🔹 Ses Notu Alanı */}
        <View style={styles.voiceBox}>
          <Text style={styles.voiceTitle}>{t('cardDetail.voiceNote')}</Text>

          {voiceNote ? (
            <>
              <TouchableOpacity
                style={styles.playButton}
                onPress={playVoiceNote}
                disabled={playing}
              >
                <Ionicons
                  name={playing ? "stop-circle" : "play-circle"}
                  size={40}
                  color={colors.primary}
                />
                <Text style={styles.playText}>
                  {playing ? t('cardDetail.playingVoice') : t('cardDetail.playVoice')}
                </Text>
              </TouchableOpacity>

              {voiceText && (
                <View style={styles.transcriptBox}>
                  <Text style={styles.transcriptText}>"{voiceText}"</Text>
                </View>
              )}
            </>
          ) : (
            <Text style={styles.noVoice}>{t('cardDetail.noVoiceNote')}</Text>
          )}
        </View>

        {/* 🔹 Aksiyonlar */}
        <View style={styles.actionsContainer}>
          {/* Yeni Kart Tara */}
          <TouchableOpacity
            style={styles.newCardButton}
            onPress={() => navigation.navigate("Camera")}
          >
            <Ionicons name="camera" size={22} color={colors.background} />
            <Text style={styles.newCardText}>{t('cardDetail.scanNewCard')}</Text>
          </TouchableOpacity>

          {/* Kartı Sil (Sadece kaydedilmiş kartlar için) */}
          {!isNewCard && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteCard}
            >
              <Ionicons name="trash-outline" size={22} color="#FF3B30" />
              <Text style={styles.deleteText}>{t('cardDetail.deleteCard')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 🔹 Meta Bilgiler */}
        {cardData.createdAt && (
          <View style={styles.metaBox}>
            <Text style={styles.metaText}>
              {t('cardDetail.addedDate', { date: new Date(cardData.createdAt).toLocaleDateString("tr-TR") })}
            </Text>
            {cardData.qaScore !== undefined && (
              <Text style={styles.metaText}>
                {t('cardDetail.qaScore', { score: cardData.qaScore })}
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* Menü Modal */}
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
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleMenuEdit}
            >
              <Ionicons name="create-outline" size={22} color={colors.primary} />
              <Text style={styles.menuItemText}>{t('cardDetail.editButton')}</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleMenuMove}
            >
              <Ionicons name="folder-outline" size={22} color={colors.primary} />
              <Text style={styles.menuItemText}>{t('cardDetail.moveButton')}</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleMenuDelete}
            >
              <Ionicons name="trash-outline" size={22} color="#EF4444" />
              <Text style={[styles.menuItemText, styles.menuItemDanger]}>{t('cardDetail.deleteButton')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Move Card Modal */}
      <MoveCardModal
        visible={moveModalVisible}
        onClose={() => setMoveModalVisible(false)}
        onMove={(folderId) => {
          setMoveModalVisible(false);
          handleMoveCard(folderId);
        }}
        currentFolderId={cardData?.categoryId}
        folders={categories}
        cardName={fields.name || "Kart"}
      />

      {/* Delete Confirm Dialog */}
      <DeleteConfirmDialog
        visible={deleteDialogVisible}
        onClose={() => setDeleteDialogVisible(false)}
        onConfirm={handleConfirmDelete}
        title={t('cardDetail.deleteConfirm.title')}
        message={t('cardDetail.deleteConfirm.message')}
        itemName={fields.name}
        showMoveOption={false}
      />
    </View>
  );
}

// 🎨 Stiller
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  text: {
    color: colors.text,
  },
  
  // 🔧 FIXED HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginHorizontal: 8,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 50,
  },
  
  // ⚠️ Uyarı Banner
  warningBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FF950020",
    borderColor: "#FF9500",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  warningText: {
    flex: 1,
    color: "#FF9500",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  
  // 📁 Kategori Badge
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface || "#1e1e1e",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border || "#2C2C2E",
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  categoryText: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  
  card: {
    backgroundColor: colors.surface || "#1e1e1e",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border || "#2C2C2E",
  },
  label: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 15,
    marginTop: 6,
  },
  value: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "500",
  },
  input: {
    backgroundColor: colors.surface || "#1e1e1e",
    color: colors.text,
    fontSize: 15,
    fontWeight: "500",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary + "50",
    marginTop: 4,
  },
  editBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.primary + "20",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary + "50",
  },
  editBannerText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  editBannerCancel: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuContainer: {
    backgroundColor: colors.cardBackground || "#1C1C1E",
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
  },
  menuItemDanger: {
    color: "#EF4444",
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.border || "#2C2C2E",
    marginHorizontal: 16,
  },
  voiceBox: {
    padding: 16,
    backgroundColor: colors.surface || "#1e1e1e",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border || "#2C2C2E",
    marginBottom: 20,
  },
  voiceTitle: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  playButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  playText: {
    color: colors.text,
    marginLeft: 8,
    fontSize: 15,
  },
  transcriptBox: {
    backgroundColor: "#00000040",
    borderRadius: 8,
    padding: 10,
  },
  transcriptText: {
    color: colors.text,
    fontStyle: "italic",
  },
  noVoice: {
    color: "#888",
    fontStyle: "italic",
  },
  
  // Aksiyonlar
  actionsContainer: {
    gap: 12,
  },
  newCardButton: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  newCardText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: colors.surface || "#1e1e1e",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#FF3B30",
    gap: 8,
  },
  deleteText: {
    color: "#FF3B30",
    fontWeight: "600",
    fontSize: 16,
  },
  
  // Meta Bilgiler
  metaBox: {
    marginTop: 20,
    padding: 12,
    backgroundColor: colors.surface || "#1e1e1e",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border || "#2C2C2E",
  },
  metaText: {
    color: colors.secondaryText,
    fontSize: 13,
    marginBottom: 4,
  },
});