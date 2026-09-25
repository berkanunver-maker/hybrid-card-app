// screens/HomeScreen.js
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  FlatList,
  Pressable,
  RefreshControl,
  Alert,
  StyleSheet,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useTheme } from "../utils/theme";
import { FirestoreService } from "../services/firestoreService";
import ExcelService from "../services/excelService";
import { getTimeAgo } from "../utils/format";
import { useOfflineQueue } from "../context/OfflineQueueProvider";
import { hasPrivacyConsent, setPrivacyConsent } from "../utils/consent";
import PrivacyConsent from "../components/PrivacyConsent";
import {
  ScreenContainer,
  AppText,
  ListRow,
  SurfaceCard,
  SectionHeader,
  EmptyState,
  Button,
  Skeleton,
  BottomSheet,
  Monogram,
  Icon,
} from "../components/ui";
import CreateFolderModal from "../components/CreateFolderModal";
import EditFolderModal from "../components/EditFolderModal";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";
import { useTranslation } from "../i18n/I18nProvider";

export default function HomeScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { colors, spacing, radius } = useTheme();
  const styles = useMemo(() => createStyles(colors, spacing, radius), [colors, spacing, radius]);
  const { pendingCount, processNow } = useOfflineQueue();

  const [categories, setCategories] = useState([]);
  const [recentCards, setRecentCards] = useState([]);
  const [totalCards, setTotalCards] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [consentVisible, setConsentVisible] = useState(false);

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user ? user.uid : null);
      // Oturum yoksa iskelet sonsuza dek dönmesin (loadCategories userId yokken erken
      // döndüğü için loading true kalıyordu — bulgu #24).
      if (!user) setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // KVKK aydınlatma/rıza kapısı — ilk açılışta (rıza yoksa) göster.
  useEffect(() => {
    let mounted = true;
    hasPrivacyConsent().then((ok) => {
      if (mounted && !ok) setConsentVisible(true);
    });
    return () => { mounted = false; };
  }, []);

  const handleConsentAccept = async () => {
    await setPrivacyConsent(true);
    setConsentVisible(false);
  };

  const handleConsentReject = async () => {
    // Rıza vermeyen kullanıcı PII işleyemez → oturumu kapat.
    setConsentVisible(false);
    try {
      await signOut(auth);
    } catch (e) {
      // yoksay
    }
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  const loadCategories = useCallback(async () => {
    if (!userId) return;
    try {
      await FirestoreService.createDefaultCategory(userId);
      const fetched = await FirestoreService.getUserCategories(userId);
      setCategories(fetched);
      setTotalCards(fetched.reduce((sum, cat) => sum + (cat.cardCount || 0), 0));

      const favorites = await FirestoreService.getFavoriteCards(userId);
      setFavoriteCount(favorites.length);

      const recent = await FirestoreService.getRecentCards(userId, 5);
      setRecentCards(recent);
    } catch (error) {
      Alert.alert(t("common.error"), t("home.loadError"));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) loadCategories();
  }, [userId, loadCategories]);

  useFocusEffect(
    useCallback(() => {
      if (userId) loadCategories();
    }, [userId, loadCategories])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCategories();
    setRefreshing(false);
  }, [loadCategories]);

  const handleFolderMenu = (folder) => {
    setSelectedFolder(folder);
    setMenuVisible(true);
  };

  const handleEditFolder = () => {
    setMenuVisible(false);
    setEditModalVisible(true);
  };

  const handleExportFolder = async () => {
    setMenuVisible(false);
    if (!selectedFolder) return;
    try {
      const cards = await FirestoreService.getCardsByCategory(selectedFolder.id, userId);
      if (cards.length === 0) {
        Alert.alert(t("home.warning"), t("home.noCardsToExport"));
        return;
      }
      setExporting(true);
      await ExcelService.exportFolderToExcel(cards, selectedFolder.name);
      setExporting(false);
    } catch (error) {
      setExporting(false);
      Alert.alert(t("common.error"), t("home.excelError"));
    }
  };

  const handleDeleteFolder = () => {
    setMenuVisible(false);
    setDeleteDialogVisible(true);
  };

  const handleConfirmDelete = async (moveCards) => {
    if (!selectedFolder) return;
    try {
      const defaultFolder = categories.find((cat) => cat.isDefault);
      const options = {
        deleteCards: !moveCards,
        moveToFolderId: moveCards ? defaultFolder?.id : null,
      };
      await FirestoreService.deleteCategory(selectedFolder.id, options);
      Alert.alert(
        t("common.success"),
        moveCards
          ? t("home.folderDeletedMoved", { name: selectedFolder.name })
          : t("home.folderDeletedAll", { name: selectedFolder.name })
      );
      setSelectedFolder(null);
      loadCategories();
    } catch (error) {
      Alert.alert(t("common.error"), t("home.folderDeleteError", { error: error.message }));
    }
  };

  const renderRecentCard = ({ item }) => {
    const fields = item.fields || item;
    const name = fields.name || item.name || t("home.unnamed");
    const companyRaw = fields.company || item.company || "";
    const company = companyRaw || t("home.noCompany");
    return (
      <SurfaceCard
        onPress={() => navigation.navigate("CardDetail", { cardData: item })}
        accessibilityLabel={`${name}, ${company}`}
        style={styles.recentCard}
      >
        <Monogram name={name} company={companyRaw} style={{ marginBottom: 8 }} />
        <AppText variant="bodyStrong" numberOfLines={1}>{name}</AppText>
        <AppText variant="caption" color="textSecondary" numberOfLines={1} style={{ marginTop: 2 }}>
          {company}
        </AppText>
        <AppText variant="caption" color="primary" style={{ marginTop: 6 }}>
          {getTimeAgo(item.createdAt)}
        </AppText>
      </SurfaceCard>
    );
  };

  const renderCategory = ({ item }) => (
    <ListRow
      onPress={() => navigation.navigate("Folder", { category: item })}
      title={item.name}
      subtitle={
        t("home.cardCount", { count: item.cardCount || 0 }) +
        (item.lastCardAddedAt ? ` · ${getTimeAgo(item.lastCardAddedAt)}` : "")
      }
      showChevron={false}
      style={{ marginBottom: spacing.md }}
      leading={
        <View style={styles.folderAvatar}>
          <AppText style={{ fontSize: 22 }}>{item.icon || "📁"}</AppText>
        </View>
      }
      trailing={
        <Pressable
          onPress={() => handleFolderMenu(item)}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={`${item.name} klasör menüsü`}
          style={styles.menuBtn}
        >
          <Icon name="ellipsis-vertical" size={20} color={colors.textSecondary} />
        </Pressable>
      }
    />
  );

  const ListHeader = (
    <View>
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <AppText variant="title">{t("home.greeting")}</AppText>
          <AppText variant="caption" color="textSecondary" style={{ marginTop: 2 }}>
            {t("home.summary", { cards: totalCards, folders: categories.length })}
          </AppText>
        </View>
        <Pressable
          onPress={() => navigation.navigate("ActivityFeed")}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t("home.notifications")}
          style={styles.iconBtn}
        >
          <Icon name="notifications-outline" size={22} color={colors.text} />
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate("Stats")}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t("a11y.stats")}
          style={styles.iconBtn}
        >
          <Icon name="stats-chart-outline" size={22} color={colors.text} />
        </Pressable>
      </View>

      <Pressable
        style={styles.search}
        onPress={() => navigation.navigate("Search")}
        accessibilityRole="search"
        accessibilityLabel={t("a11y.searchCards")}
      >
        <Icon name="search" size={20} color={colors.textMuted} />
        <AppText variant="body" color="textMuted" style={{ marginLeft: 8 }}>
          {t("home.searchPlaceholder")}
        </AppText>
      </Pressable>

      {pendingCount > 0 && (
        <Pressable
          style={styles.syncBanner}
          onPress={processNow}
          accessibilityRole="button"
          accessibilityLabel={t("a11y.syncNow")}
        >
          <Icon name="cloud-upload-outline" size={18} color={colors.warning} />
          <AppText variant="caption" style={{ color: colors.warning, flex: 1, marginLeft: 8 }}>
            {t("home.syncPending", { count: pendingCount })}
          </AppText>
          <AppText variant="caption" color="primary">{t("home.sendNow")}</AppText>
        </Pressable>
      )}

      <View style={styles.quickRow}>
        <SurfaceCard
          onPress={() => navigation.navigate("Favorites")}
          accessibilityLabel={t("a11y.favorites")}
          style={styles.quickCard}
        >
          <View style={styles.quickIcon}>
            <Icon name="star" size={22} color={colors.star} />
          </View>
          <AppText variant="bodyStrong">{t("home.favorites")}</AppText>
          <AppText variant="caption" color="textSecondary">{t("home.cardCount", { count: favoriteCount })}</AppText>
        </SurfaceCard>
        <SurfaceCard
          onPress={() => navigation.navigate("AllCards")}
          accessibilityLabel={t("a11y.allCards")}
          style={styles.quickCard}
        >
          <View style={styles.quickIcon}>
            <Icon name="albums" size={22} color={colors.primary} />
          </View>
          <AppText variant="bodyStrong">{t("home.allCards")}</AppText>
          <AppText variant="caption" color="textSecondary">{t("home.cardCount", { count: totalCards })}</AppText>
        </SurfaceCard>
      </View>

      {recentCards.length > 0 && (
        <View style={{ marginBottom: spacing.xl }}>
          <SectionHeader title={t("home.recentlyAdded")} />
          <FlatList
            data={recentCards}
            keyExtractor={(item) => item.id}
            renderItem={renderRecentCard}
            horizontal
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
          />
        </View>
      )}

      <SectionHeader
        title={t("home.folders")}
        action={
          <Button
            title={t("home.newFolder")}
            icon="add-circle-outline"
            variant="ghost"
            size="sm"
            fullWidth={false}
            onPress={() => setModalVisible(true)}
          />
        }
      />
    </View>
  );

  if (loading) {
    return (
      <ScreenContainer padded>
        <View style={{ marginTop: spacing.lg }}>
          <Skeleton width={140} height={26} style={{ marginBottom: spacing.lg }} />
          <Skeleton height={48} radius={radius.md} style={{ marginBottom: spacing.xl }} />
          <View style={{ flexDirection: "row", gap: spacing.md, marginBottom: spacing.xl }}>
            <Skeleton height={92} radius={radius.lg} style={{ flex: 1 }} />
            <Skeleton height={92} radius={radius.lg} style={{ flex: 1 }} />
          </View>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={72} radius={radius.lg} style={{ marginBottom: spacing.md }} />
          ))}
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={renderCategory}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <EmptyState
            icon="folder-open-outline"
            title={t("home.emptyTitle")}
            description={t("home.emptyDescription")}
            actionLabel={t("home.newFolder")}
            onAction={() => setModalVisible(true)}
          />
        }
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      />

      <View style={styles.fabWrap} pointerEvents="box-none">
        <View style={styles.fabRow}>
          <Button
            title={t("home.addManual")}
            icon="person-add-outline"
            variant="secondary"
            onPress={() => navigation.navigate("AddContact")}
            style={[styles.fab, { flex: 1 }]}
          />
          <Button
            title={t("home.scanCard")}
            icon="camera"
            onPress={() => navigation.navigate("Camera")}
            style={[styles.fab, { flex: 1 }]}
          />
        </View>
      </View>

      <CreateFolderModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onFolderCreated={() => {
          setModalVisible(false);
          loadCategories();
        }}
      />

      <BottomSheet visible={menuVisible} onClose={() => setMenuVisible(false)}>
        <Pressable style={styles.sheetRow} onPress={handleEditFolder}>
          <Icon name="create-outline" size={22} color={colors.primary} />
          <AppText variant="bodyStrong" style={{ marginLeft: 12 }}>{t("common.edit")}</AppText>
        </Pressable>
        <Pressable style={styles.sheetRow} onPress={handleExportFolder} disabled={exporting}>
          <Icon name="document-text-outline" size={22} color={colors.primary} />
          <AppText variant="bodyStrong" style={{ marginLeft: 12 }}>
            {exporting ? t("home.excelGenerating") : t("home.exportToExcel")}
          </AppText>
        </Pressable>
        <Pressable style={styles.sheetRow} onPress={handleDeleteFolder}>
          <Icon name="trash-outline" size={22} color={colors.danger} />
          <AppText variant="bodyStrong" style={{ marginLeft: 12, color: colors.danger }}>{t("common.delete")}</AppText>
        </Pressable>
      </BottomSheet>

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

      <DeleteConfirmDialog
        visible={deleteDialogVisible}
        onClose={() => {
          setDeleteDialogVisible(false);
          setSelectedFolder(null);
        }}
        onConfirm={handleConfirmDelete}
        title={t("home.deleteFolderTitle")}
        message={t("home.deleteFolderMessage")}
        itemName={selectedFolder?.name}
        itemCount={selectedFolder?.cardCount || 0}
        showMoveOption={true}
      />

      {/* KVKK aydınlatma + açık rıza kapısı */}
      <PrivacyConsent
        visible={consentVisible}
        mode="gate"
        onAccept={handleConsentAccept}
        onReject={handleConsentReject}
      />
    </ScreenContainer>
  );
}

const createStyles = (colors, spacing, radius) =>
  StyleSheet.create({
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.lg,
    },
    iconBtn: {
      width: 44,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    search: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      paddingHorizontal: 14,
      paddingVertical: 13,
      marginBottom: spacing.xl,
    },
    syncBanner: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.warningSurface,
      borderRadius: radius.md,
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginBottom: spacing.lg,
    },
    quickRow: {
      flexDirection: "row",
      gap: spacing.md,
      marginBottom: spacing.xl,
    },
    quickCard: { flex: 1, alignItems: "center" },
    quickIcon: {
      width: 48,
      height: 48,
      borderRadius: radius.pill,
      backgroundColor: colors.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    },
    recentCard: { width: 168 },
    recentAvatar: {
      width: 44,
      height: 44,
      borderRadius: radius.pill,
      backgroundColor: colors.primaryMuted,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    },
    folderAvatar: {
      width: 44,
      height: 44,
      borderRadius: radius.pill,
      backgroundColor: colors.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
    },
    menuBtn: {
      width: 36,
      height: 44,
      alignItems: "center",
      justifyContent: "center",
    },
    fabWrap: {
      position: "absolute",
      left: spacing.lg,
      right: spacing.lg,
      bottom: spacing.xl,
    },
    fabRow: {
      flexDirection: "row",
      gap: spacing.md,
    },
    fab: {
      ...({
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 8,
      }),
    },
    sheetRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
    },
  });
