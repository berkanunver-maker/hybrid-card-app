// screens/CardDetailScreen.js
import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  TextInput,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "../utils/theme";
import { voiceService } from "../services/voiceService";
import { FirestoreService } from "../services/firestoreService";
import { cleanUrl } from "../utils/format";
import { saveContactToPhone } from "../services/contactsService";
import {
  ScreenContainer,
  AppText,
  SurfaceCard,
  Button,
  EmptyState,
  BottomSheet,
  DigitalCard,
  CardShareSheet,
  Icon,
  VoiceRecorder,
} from "../components/ui";
import MoveCardModal from "../components/MoveCardModal";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";
import { getAuth } from "firebase/auth";
import { useTranslation } from "../i18n/I18nProvider";

export default function CardDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const { colors, spacing, radius, typography } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, spacing, radius),
    [colors, spacing, radius]
  );

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
  const [shareVisible, setShareVisible] = useState(false);
  const [voiceRecVisible, setVoiceRecVisible] = useState(false);
  const [editingTranscript, setEditingTranscript] = useState(false);
  const [transcriptDraft, setTranscriptDraft] = useState("");
  const [editingNote, setEditingNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");

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
          // Kategoriler yüklenemedi — sessiz geç (UI bozulmasın)
        }
      }
    };
    loadCategories();
  }, [userId]);

  // Kart verisi yoksa
  if (!cardData) {
    return (
      <ScreenContainer padded>
        <EmptyState
          icon="alert-circle-outline"
          title={t("card.notFoundTitle")}
          description={t("card.notFoundDescription")}
          actionLabel={t("card.goBack")}
          onAction={() => navigation.goBack()}
        />
      </ScreenContainer>
    );
  }

  // Fields düzeltmesi — hem `fields` hem düz yapıyı destekler
  const fields =
    (cardData.fields && Object.keys(cardData.fields).length > 0
      ? cardData.fields
      : cardData) || {};

  // Ses notunu hem fields içinde hem dışarıda ara
  const voiceNote = cardData.voice_note || fields.voice_note || null;
  const voiceText = voiceNote?.text || null;

  // Yazılı not (kart-üstü serbest metin)
  const note = cardData.note || fields.note || "";

  // Kartı Firestore'a kaydet
  const handleSaveCard = async () => {
    try {
      setSaving(true);

      // Firestore'a kaydet
      const savedCard = await FirestoreService.addCard(cardData);

      // Kaydedilen kartın tam detayını çek
      const fullCard = await FirestoreService.getCardById(savedCard.id);

      // State'i güncelle
      setCardData(fullCard);

      Alert.alert(
        t("card.saveSuccessTitle"),
        t("card.saveSuccessMessage"),
        [
          {
            text: t("card.homeAction"),
            onPress: () => navigation.navigate("Main"),
          },
          {
            text: t("card.scanNewAction"),
            onPress: () => navigation.navigate("Camera"),
          },
        ]
      );

      setSaving(false);

      // Navigate'i route params'dan kaldır
      navigation.setParams({ isNewCard: false });

    } catch (error) {
      setSaving(false);
      Alert.alert(t("common.error"), t("card.saveError"));
    }
  };

  // Ses oynatma
  const playVoiceNote = async () => {
    try {
      if (!voiceService?.playAudio) {
        throw new Error("voiceService.playAudio fonksiyonu bulunamadı!");
      }
      setPlaying(true);
      await voiceService.playAudio(voiceNote?.audioUrl);
    } catch (err) {
      // Ses oynatma hatası — kullanıcı akışı bozulmasın
    } finally {
      setPlaying(false);
    }
  };

  // Ses notunu kalıcılaştır (kaydedilmiş kartsa Firestore'a da yaz)
  const persistVoiceNote = async (vn) => {
    setCardData((prev) => ({ ...prev, voice_note: vn }));
    if (cardData.id) {
      try {
        await FirestoreService.updateCard(cardData.id, { voice_note: vn });
      } catch (e) {
        Alert.alert(t("common.error"), t("card.voiceSaveError"));
      }
    }
  };

  const handleVoiceComplete = (vn) => {
    setVoiceRecVisible(false);
    persistVoiceNote(vn);
  };

  const handleDeleteVoice = () => {
    Alert.alert(t("card.deleteVoiceTitle"), t("card.deleteVoiceMessage"), [
      { text: t("common.dismiss"), style: "cancel" },
      { text: t("common.delete"), style: "destructive", onPress: () => persistVoiceNote(null) },
    ]);
  };

  const startEditTranscript = () => {
    setTranscriptDraft(voiceText || "");
    setEditingTranscript(true);
  };

  const saveTranscript = () => {
    const updated = { ...(voiceNote || {}), text: transcriptDraft };
    persistVoiceNote(updated);
    setEditingTranscript(false);
  };

  // Yazılı notu kalıcılaştır (kaydedilmiş kartsa Firestore'a da yaz)
  const persistNote = async (text) => {
    const value = (text || "").trim();
    setCardData((prev) => ({ ...prev, note: value }));
    if (cardData.id) {
      try {
        await FirestoreService.updateCard(cardData.id, { note: value });
      } catch (e) {
        Alert.alert(t("common.error"), t("card.noteSaveError"));
      }
    }
  };

  const startEditNote = () => {
    setNoteDraft(note || "");
    setEditingNote(true);
  };

  const saveNote = () => {
    persistNote(noteDraft);
    setEditingNote(false);
  };

  // Favori toggle
  const toggleFavorite = async () => {
    try {
      const newFavoriteStatus = !isFavorite;
      setIsFavorite(newFavoriteStatus);

      // Firestore'u güncelle (sadece kaydedilmiş kartlar için)
      if (cardData.id) {
        await FirestoreService.updateCard(cardData.id, {
          isFavorite: newFavoriteStatus,
        });
      }
    } catch (error) {
      // Hata durumunda geri al
      setIsFavorite(!isFavorite);
      Alert.alert(t("common.error"), t("card.favoriteError"));
    }
  };

  // Kategori değiştir
  const handleChangeCategory = () => {
    setMoveModalVisible(true);
  };

  // Kartı taşı
  const handleMoveCard = async (newCategoryId) => {
    try {
      // Sadece kart ID'sini kontrol et (categoryId null olabilir)
      if (!cardData.id) {
        Alert.alert(t("common.error"), t("card.notSavedYet"));
        return;
      }

      // Mevcut categoryId'yi al (yoksa null)
      const currentCategoryId = cardData.categoryId || null;

      await FirestoreService.moveCard(
        cardData.id,
        currentCategoryId,
        newCategoryId
      );

      // Yeni kategori bilgisini al
      const newCategory = categories.find(cat => cat.id === newCategoryId);

      setCardData({
        ...cardData,
        categoryId: newCategoryId,
        categoryName: newCategory?.name
      });

      Alert.alert(t("common.success"), t("card.moveSuccess", { name: newCategory?.name }));
    } catch (error) {
      Alert.alert(t("common.error"), t("card.moveError", { error: error.message }));
    }
  };

  // Düzenleme modunu aç/kapat
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

  // Düzenlemeleri kaydet
  const handleSaveEdits = async () => {
    try {
      if (!cardData.id) {
        Alert.alert(t("common.error"), t("card.notSaved"));
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
      Alert.alert(t("common.success"), t("card.updateSuccess"));
    } catch (error) {
      setSaving(false);
      Alert.alert(t("common.error"), t("card.updateError", { error: error.message }));
    }
  };

  // İptal et
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedFields({});
  };

  // Kartı sil
  const handleDeleteCard = () => {
    setDeleteDialogVisible(true);
  };

  // Silme onayı
  const handleConfirmDelete = async () => {
    try {
      if (cardData.id) {
        await FirestoreService.deleteCard(cardData.id);
        Alert.alert(t("common.success"), t("card.deleteSuccess"));
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert(t("common.error"), t("card.deleteError"));
    }
  };

  // Menü işlemleri
  const handleMenuShare = () => {
    setMenuVisible(false);
    setTimeout(() => setShareVisible(true), 300);
  };

  const handleMenuAddContact = async () => {
    setMenuVisible(false);
    const res = await saveContactToPhone(fields);
    if (res.success) {
      Alert.alert(t("common.success"), t("card.contactAddedSuccess"));
    } else if (res.error === "permission") {
      Alert.alert(t("card.permissionRequiredTitle"), t("card.contactPermissionMessage"));
    } else {
      Alert.alert(t("common.error"), t("card.contactAddError"));
    }
  };

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

  // Sabit alan listesi — boşlar "—". Web alanı cleanUrl ile temizlenir.
  const infoItems = [
    { icon: "business-outline", label: t("card.labelCompany"), value: fields.company || "—", fieldKey: "company" },
    { icon: "person-outline", label: t("card.labelName"), value: fields.name || "—", fieldKey: "name" },
    { icon: "briefcase-outline", label: t("card.labelTitle"), value: fields.title || "—", fieldKey: "title" },
    { icon: "call-outline", label: t("card.labelMobile"), value: fields.mobile || "—", fieldKey: "mobile" },
    { icon: "call", label: t("card.labelPhone"), value: fields.phone || "—", fieldKey: "phone" },
    { icon: "mail-outline", label: t("card.labelEmail"), value: fields.email || "—", fieldKey: "email" },
    { icon: "location-outline", label: t("card.labelAddress"), value: fields.address || "—", fieldKey: "address" },
    { icon: "globe-outline", label: t("card.labelWebsite"), value: fields.website ? cleanUrl(fields.website) : "—", fieldKey: "website" },
  ];

  const currentCategory = categories.find(cat => cat.id === cardData?.categoryId);

  return (
    <ScreenContainer>
      {/* Sabit Başlık */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.iconButton}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Geri dön"
        >
          <Icon name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <AppText variant="heading" style={styles.headerTitle} numberOfLines={1}>
          {t("card.detailTitle")}
        </AppText>
        <View style={styles.headerRight}>
          <Pressable
            onPress={toggleFavorite}
            style={styles.iconButton}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={isFavorite ? "Favorilerden çıkar" : "Favorilere ekle"}
            accessibilityState={{ selected: isFavorite }}
          >
            <Icon
              name={isFavorite ? "star" : "star-outline"}
              size={24}
              color={isFavorite ? colors.star : colors.text}
            />
          </Pressable>
          <Pressable
            onPress={() => setMenuVisible(true)}
            style={styles.iconButton}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Kart menüsü"
          >
            <Icon name="ellipsis-horizontal" size={24} color={colors.text} />
          </Pressable>
        </View>
      </View>

      {/* Düzenleme Modu Bandı */}
      {isEditing && (
        <View style={styles.editBanner}>
          <View style={styles.editBannerLeft}>
            <Icon name="create-outline" size={18} color={colors.primary} />
            <AppText variant="label" color="primary" style={{ marginLeft: 8 }}>
              {t("card.editMode")}
            </AppText>
          </View>
          <Pressable
            onPress={handleCancelEdit}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Düzenlemeyi iptal et"
          >
            <AppText variant="bodyStrong" color="primary">{t("common.cancel")}</AppText>
          </Pressable>
        </View>
      )}

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Sinyatür kart nesnesi (kahraman) */}
        {!isEditing && (
          <DigitalCard
            name={fields.name}
            company={fields.company}
            title={fields.title}
            mobile={fields.mobile}
            phone={fields.phone}
            email={fields.email}
            website={fields.website}
            onPress={() => setShareVisible(true)}
            style={{ marginBottom: spacing.xl }}
          />
        )}

        {/* Yeni Kart Uyarısı */}
        {isNewCard && (
          <View style={styles.warningBanner}>
            <Icon name="alert-circle" size={20} color={colors.warning} />
            <AppText variant="label" color="warning" style={styles.warningText}>
              {t("card.unsavedWarning")}
            </AppText>
          </View>
        )}

        {/* Kategori Satırı */}
        {currentCategory && (
          <Pressable
            style={styles.categoryBadge}
            onPress={handleChangeCategory}
            accessibilityRole="button"
            accessibilityLabel={`Klasör: ${currentCategory.name}. Değiştirmek için dokunun.`}
          >
            {/* Kullanıcı verisi olan emoji olduğu gibi korunur */}
            <AppText style={styles.categoryIcon}>{currentCategory.icon}</AppText>
            <AppText variant="bodyStrong" style={styles.categoryText} numberOfLines={1}>
              {currentCategory.name}
            </AppText>
            <Icon name="chevron-forward" size={20} color={colors.textSecondary} />
          </Pressable>
        )}

        {/* Kart Bilgileri */}
        <SurfaceCard style={{ marginBottom: spacing.xl }}>
          {infoItems.map((item, index) => (
            <View
              key={index}
              style={[styles.infoRow, index === infoItems.length - 1 && { marginBottom: 0 }]}
            >
              <View style={styles.labelRow}>
                <Icon name={item.icon} size={16} color={colors.primary} />
                <AppText variant="label" color="primary" style={{ marginLeft: 8 }}>
                  {item.label}
                </AppText>
              </View>
              {isEditing ? (
                <TextInput
                  style={[styles.input, typography.body]}
                  value={editedFields[item.fieldKey] || ""}
                  onChangeText={(text) =>
                    setEditedFields({ ...editedFields, [item.fieldKey]: text })
                  }
                  placeholder={`${item.label} girin`}
                  placeholderTextColor={colors.textMuted}
                  accessibilityLabel={item.label}
                />
              ) : (
                <AppText variant="bodyStrong" style={{ marginTop: 4 }}>
                  {item.value}
                </AppText>
              )}
            </View>
          ))}
        </SurfaceCard>

        {/* Yazılı Not modülü — serbest metin (dokun → düzenle) */}
        <SurfaceCard style={{ marginBottom: spacing.xl }}>
          <View style={styles.voiceTitleRow}>
            <Icon name="document-text-outline" size={18} color={colors.primary} />
            <AppText variant="heading" color="primary" style={{ marginLeft: 8, flex: 1 }}>
              {t("card.note")}
            </AppText>
          </View>
          {editingNote ? (
            <View style={{ marginTop: spacing.sm }}>
              <TextInput
                style={[styles.input, typography.body, { minHeight: 90, textAlignVertical: "top" }]}
                value={noteDraft}
                onChangeText={setNoteDraft}
                multiline
                placeholder={t("card.notePlaceholder")}
                placeholderTextColor={colors.textMuted}
                accessibilityLabel={t("card.note")}
              />
              <View style={styles.voiceActions}>
                <Button
                  title={t("common.cancel")}
                  variant="ghost"
                  size="sm"
                  fullWidth={false}
                  onPress={() => setEditingNote(false)}
                />
                <Button title={t("common.save")} size="sm" fullWidth={false} onPress={saveNote} />
              </View>
            </View>
          ) : (
            <Pressable
              style={styles.transcriptBox}
              onPress={startEditNote}
              accessibilityRole="button"
              accessibilityLabel={t("card.note")}
            >
              <AppText variant="body" color="textSecondary" style={{ flex: 1 }}>
                {note ? note : t("card.noNote")}
              </AppText>
              <Icon name="create-outline" size={16} color={colors.textMuted} />
            </Pressable>
          )}
        </SurfaceCard>

        {/* Ses Notu modülü — oynat / düzenle / tekrar kaydet / sil / ekle */}
        <SurfaceCard style={{ marginBottom: spacing.xl }}>
          <View style={styles.voiceTitleRow}>
            <Icon name="mic" size={18} color={colors.primary} />
            <AppText variant="heading" color="primary" style={{ marginLeft: 8, flex: 1 }}>
              {t("card.voiceNote")}
            </AppText>
            {voiceNote && (
              <Pressable
                onPress={handleDeleteVoice}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Ses notunu sil"
              >
                <Icon name="trash-outline" size={20} color={colors.danger} />
              </Pressable>
            )}
          </View>

          {voiceNote ? (
            <>
              {voiceNote.audioUrl ? (
                <Pressable
                  style={styles.playButton}
                  onPress={playVoiceNote}
                  accessibilityRole="button"
                  accessibilityLabel={playing ? "Ses oynatılıyor" : "Ses notunu dinle"}
                >
                  <Icon
                    name={playing ? "pause-circle" : "play-circle"}
                    size={40}
                    color={colors.primary}
                  />
                  <AppText variant="body" style={{ marginLeft: 8 }}>
                    {playing ? t("card.playing") : t("card.listen")}
                  </AppText>
                </Pressable>
              ) : null}

              {editingTranscript ? (
                <View style={{ marginTop: spacing.sm }}>
                  <TextInput
                    style={[styles.input, typography.body, { minHeight: 72, textAlignVertical: "top" }]}
                    value={transcriptDraft}
                    onChangeText={setTranscriptDraft}
                    multiline
                    placeholder={t("card.editTranscript")}
                    placeholderTextColor={colors.textMuted}
                    accessibilityLabel="Transkript"
                  />
                  <View style={styles.voiceActions}>
                    <Button
                      title={t("common.cancel")}
                      variant="ghost"
                      size="sm"
                      fullWidth={false}
                      onPress={() => setEditingTranscript(false)}
                    />
                    <Button title={t("common.save")} size="sm" fullWidth={false} onPress={saveTranscript} />
                  </View>
                </View>
              ) : (
                <Pressable
                  style={styles.transcriptBox}
                  onPress={startEditTranscript}
                  accessibilityRole="button"
                  accessibilityLabel="Transkripti düzenle"
                >
                  <AppText
                    variant="body"
                    color="textSecondary"
                    style={{ flex: 1, fontStyle: voiceText ? "italic" : "normal" }}
                  >
                    {voiceText ? `"${voiceText}"` : t("card.noTranscript")}
                  </AppText>
                  <Icon name="create-outline" size={16} color={colors.textMuted} />
                </Pressable>
              )}

              <View style={{ marginTop: spacing.md }}>
                <Button
                  title={t("card.recordAgain")}
                  icon="mic"
                  variant="secondary"
                  onPress={() => setVoiceRecVisible(true)}
                />
              </View>
            </>
          ) : (
            <Button
              title={t("card.addVoiceNote")}
              icon="mic"
              variant="secondary"
              onPress={() => setVoiceRecVisible(true)}
              style={{ marginTop: spacing.sm }}
            />
          )}
        </SurfaceCard>

        {/* Aksiyonlar */}
        {isNewCard ? (
          <Button
            title={t("card.saveCard")}
            icon="checkmark-circle"
            onPress={handleSaveCard}
            loading={saving}
            disabled={saving}
          />
        ) : isEditing ? (
          <Button
            title={t("card.saveChanges")}
            icon="checkmark-circle"
            onPress={toggleEditMode}
            loading={saving}
            disabled={saving}
          />
        ) : null}

        {/* Meta Bilgiler */}
        {cardData.createdAt && (
          <View style={styles.metaBox}>
            <AppText variant="caption" color="textMuted">
              {t("card.createdAt", { date: new Date(cardData.createdAt).toLocaleString("tr-TR") })}
            </AppText>
            {cardData.updatedAt && cardData.updatedAt !== cardData.createdAt && (
              <AppText variant="caption" color="textMuted" style={{ marginTop: 4 }}>
                {t("card.updatedAt", { date: new Date(cardData.updatedAt).toLocaleString("tr-TR") })}
              </AppText>
            )}
          </View>
        )}
      </ScrollView>

      {/* Menü */}
      <BottomSheet visible={menuVisible} onClose={() => setMenuVisible(false)}>
        <Pressable style={styles.sheetRow} onPress={handleMenuShare}>
          <Icon name="share-social-outline" size={22} color={colors.primary} />
          <AppText variant="bodyStrong" style={{ marginLeft: 12 }}>{t("common.share")}</AppText>
        </Pressable>
        <Pressable style={styles.sheetRow} onPress={handleMenuAddContact}>
          <Icon name="person-add-outline" size={22} color={colors.primary} />
          <AppText variant="bodyStrong" style={{ marginLeft: 12 }}>{t("card.addToContacts")}</AppText>
        </Pressable>
        <Pressable style={styles.sheetRow} onPress={handleMenuEdit}>
          <Icon name="create-outline" size={22} color={colors.primary} />
          <AppText variant="bodyStrong" style={{ marginLeft: 12 }}>{t("common.edit")}</AppText>
        </Pressable>
        <Pressable style={styles.sheetRow} onPress={handleMenuMove}>
          <Icon name="folder-outline" size={22} color={colors.primary} />
          <AppText variant="bodyStrong" style={{ marginLeft: 12 }}>{t("card.moveToFolder")}</AppText>
        </Pressable>
        <Pressable style={styles.sheetRow} onPress={handleMenuDelete}>
          <Icon name="trash-outline" size={22} color={colors.danger} />
          <AppText variant="bodyStrong" style={{ marginLeft: 12, color: colors.danger }}>{t("common.delete")}</AppText>
        </Pressable>
      </BottomSheet>

      {/* Kartı Taşı Modalı */}
      <MoveCardModal
        visible={moveModalVisible}
        onClose={() => setMoveModalVisible(false)}
        onMove={(folderId) => {
          setMoveModalVisible(false);
          handleMoveCard(folderId);
        }}
        currentFolderId={cardData?.categoryId}
        folders={categories}
        cardName={fields.name || t("card.defaultCardName")}
      />

      {/* Silme Onay Diyaloğu */}
      <DeleteConfirmDialog
        visible={deleteDialogVisible}
        onClose={() => setDeleteDialogVisible(false)}
        onConfirm={handleConfirmDelete}
        title={t("card.deleteCardTitle")}
        message={t("card.deleteCardMessage")}
        itemName={fields.name}
        showMoveOption={false}
      />

      <CardShareSheet
        visible={shareVisible}
        onClose={() => setShareVisible(false)}
        fields={fields}
      />

      <VoiceRecorder
        visible={voiceRecVisible}
        onClose={() => setVoiceRecVisible(false)}
        onComplete={handleVoiceComplete}
        userId={userId}
        transcribe
      />
    </ScreenContainer>
  );
}

const createStyles = (colors, spacing, radius) =>
  StyleSheet.create({
    // Başlık
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.sm,
      paddingBottom: spacing.lg,
    },
    headerTitle: {
      flex: 1,
      textAlign: "center",
      marginHorizontal: spacing.sm,
    },
    headerRight: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },
    iconButton: {
      width: 44,
      height: 44,
      justifyContent: "center",
      alignItems: "center",
    },

    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: spacing.xl,
      paddingBottom: spacing.xxxxl,
    },

    // Uyarı bandı
    warningBanner: {
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor: colors.warningSurface,
      borderColor: colors.warning,
      borderWidth: 1,
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.lg,
      gap: spacing.sm,
    },
    warningText: {
      flex: 1,
      lineHeight: 20,
    },

    // Düzenleme bandı
    editBanner: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: colors.primaryMuted,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    editBannerLeft: {
      flexDirection: "row",
      alignItems: "center",
    },

    // Kategori satırı
    categoryBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderRadius: radius.md,
      marginBottom: spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 48,
    },
    categoryIcon: {
      fontSize: 20,
      marginRight: spacing.sm,
    },
    categoryText: {
      flex: 1,
    },

    // Bilgi satırı
    infoRow: {
      marginBottom: spacing.lg,
    },
    labelRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    input: {
      backgroundColor: colors.surfaceAlt,
      color: colors.text,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: spacing.xs,
    },

    // Ses notu
    voiceTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.sm,
    },
    playButton: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.sm,
    },
    transcriptBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.sm,
      padding: spacing.md,
      marginTop: spacing.sm,
    },
    voiceActions: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: spacing.sm,
      marginTop: spacing.sm,
    },

    // Meta
    metaBox: {
      marginTop: spacing.xl,
      padding: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },

    // Menü satırı
    sheetRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.lg,
    },
  });
