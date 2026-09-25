// screens/ProfileScreen.js — Profil & Ayarlar merkezi (Profil sekmesi)
import React, { useMemo, useState } from "react";
import { View, Pressable, Alert, ScrollView, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getAuth, signOut } from "firebase/auth";
import Constants from "expo-constants";
import { useTheme } from "../utils/theme";
import { useTranslation } from "../i18n/I18nProvider";
import { useOfflineQueue } from "../context/OfflineQueueProvider";
import {
  ScreenContainer,
  AppText,
  SectionHeader,
  Button,
  Monogram,
  Icon,
  Dialog,
  PasswordInput,
} from "../components/ui";
import PrivacyConsent from "../components/PrivacyConsent";
import { deleteAccountAndData } from "../services/accountService";

// Yeni gizlilik/silme akışı için yerel etiketler (dil'e göre). TODO: i18n key'lerine taşı.
const L = {
  tr: {
    privacyTitle: "Gizlilik",
    privacyRow: "Gizlilik ve Aydınlatma Metni",
    dangerTitle: "Tehlikeli Bölge",
    deleteAccount: "Hesabı Sil",
    deleteWarn:
      "Hesabınız ve tüm verileriniz (kartlar, klasörler, görseller, ses notları) kalıcı olarak silinir. Bu işlem geri alınamaz.",
    passwordLabel: "Parolanız (doğrulama için)",
    passwordPlaceholder: "Mevcut parolanız",
    confirmDelete: "Kalıcı olarak sil",
    cancel: "Vazgeç",
    needPassword: "Lütfen parolanızı girin.",
    wrongPassword: "Parola hatalı. Lütfen tekrar deneyin.",
    deleteError: "Hesap silinemedi. Lütfen tekrar deneyin.",
  },
  en: {
    privacyTitle: "Privacy",
    privacyRow: "Privacy & Data Notice",
    dangerTitle: "Danger Zone",
    deleteAccount: "Delete Account",
    deleteWarn:
      "Your account and all your data (cards, folders, images, voice notes) will be permanently deleted. This cannot be undone.",
    passwordLabel: "Your password (for verification)",
    passwordPlaceholder: "Current password",
    confirmDelete: "Delete permanently",
    cancel: "Cancel",
    needPassword: "Please enter your password.",
    wrongPassword: "Incorrect password. Please try again.",
    deleteError: "Could not delete account. Please try again.",
  },
};

const THEME_OPTIONS = [
  { key: "system", labelKey: "theme.system", icon: "phone-portrait-outline" },
  { key: "light", labelKey: "theme.light", icon: "sunny-outline" },
  { key: "dark", labelKey: "theme.dark", icon: "moon-outline" },
];

const LANG_OPTIONS = [
  { key: "tr", label: "Türkçe" },
  { key: "en", label: "English" },
];

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { colors, spacing, radius, mode, setMode } = useTheme();
  const { t, lang, setLang } = useTranslation();
  const styles = useMemo(() => createStyles(colors, spacing, radius), [colors, spacing, radius]);
  const { pendingCount, processNow, syncing } = useOfflineQueue();
  const tx = L[lang] || L.tr;

  // Manuel "Şimdi gönder" — kullanıcıya sonucu bildir (#54).
  const handleSyncNow = async () => {
    const res = await processNow();
    if (res?.processed > 0) {
      Alert.alert(t("common.success"), t("profile.syncDone", { count: res.processed }));
    } else {
      Alert.alert(t("profile.syncNow"), t("profile.syncNone"));
    }
  };

  const auth = getAuth();
  const user = auth.currentUser;
  const email = user?.email || "";
  const name = user?.displayName || email || t("profile.user");
  const version = Constants?.expoConfig?.version || "1.0.0";

  const [privacyVisible, setPrivacyVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!deletePassword.trim()) {
      Alert.alert(t("common.error"), tx.needPassword);
      return;
    }
    setDeleting(true);
    try {
      await deleteAccountAndData({ password: deletePassword });
      // Hesap silindi → oturum düştü, Login'e sıfırla
      setDeleteVisible(false);
      setDeleting(false);
      setDeletePassword("");
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    } catch (e) {
      setDeleting(false);
      if (e?.code === "reauth-failed" || e?.code === "auth/wrong-password" || e?.code === "auth/invalid-credential") {
        Alert.alert(t("common.error"), tx.wrongPassword);
      } else {
        Alert.alert(t("common.error"), tx.deleteError);
      }
    }
  };

  const handleLogout = () => {
    Alert.alert(t("profile.logout"), t("profile.logoutConfirm"), [
      { text: t("common.dismiss"), style: "cancel" },
      {
        text: t("profile.logout"),
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(auth);
            navigation.reset({ index: 0, routes: [{ name: "Login" }] });
          } catch (e) {
            Alert.alert(t("common.error"), t("profile.logoutError"));
          }
        },
      },
    ]);
  };

  const renderSegment = (options, activeKey, onSelect, labelResolver) => (
    <View style={styles.segment}>
      {options.map((opt) => {
        const active = activeKey === opt.key;
        return (
          <Pressable
            key={opt.key}
            onPress={() => onSelect(opt.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={[styles.segmentItem, active && styles.segmentItemActive]}
          >
            {opt.icon ? (
              <Icon
                name={opt.icon}
                size={18}
                color={active ? colors.onPrimary : colors.textSecondary}
              />
            ) : null}
            <AppText
              variant="label"
              style={{
                color: active ? colors.onPrimary : colors.textSecondary,
                marginTop: opt.icon ? 4 : 0,
              }}
            >
              {labelResolver(opt)}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <ScreenContainer padded>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: spacing.xxl, paddingBottom: 100 }}
      >
        {/* Profil başlığı */}
        <View style={styles.profileHeader}>
          <Monogram name={name} size={76} />
          <AppText variant="title" style={{ marginTop: spacing.md, textAlign: "center" }} numberOfLines={1}>
            {name}
          </AppText>
          {email ? (
            <AppText variant="caption" color="textMuted" style={{ marginTop: 2 }} numberOfLines={1}>
              {email}
            </AppText>
          ) : null}
        </View>

        {pendingCount > 0 && (
          <Pressable
            style={styles.syncRow}
            onPress={syncing ? undefined : handleSyncNow}
            disabled={syncing}
            accessibilityRole="button"
            accessibilityLabel={t("profile.syncNow")}
          >
            <Icon name="cloud-upload-outline" size={18} color={colors.warning} />
            <AppText variant="caption" style={{ color: colors.warning, flex: 1, marginLeft: 8 }}>
              {t("profile.syncPending", { count: pendingCount })}
            </AppText>
            <AppText variant="caption" color="primary">
              {syncing ? t("common.loading") : t("profile.syncNow")}
            </AppText>
          </Pressable>
        )}

        <SectionHeader title={t("profile.appearance")} style={{ marginTop: spacing.xl }} />
        {renderSegment(THEME_OPTIONS, mode, setMode, (opt) => t(opt.labelKey))}

        <SectionHeader title={t("profile.language")} style={{ marginTop: spacing.xxl }} />
        {renderSegment(LANG_OPTIONS, lang, setLang, (opt) => opt.label)}

        <SectionHeader title={t("profile.app")} style={{ marginTop: spacing.xxl }} />
        <View style={styles.infoRow}>
          <Icon name="information-circle-outline" size={20} color={colors.textSecondary} />
          <AppText variant="body" style={{ flex: 1, marginLeft: 12 }}>{t("profile.version")}</AppText>
          <AppText variant="body" color="textMuted">{version}</AppText>
        </View>

        <SectionHeader title={t("profile.company")} style={{ marginTop: spacing.xxl }} />
        <Pressable
          style={styles.infoRow}
          onPress={() => navigation.navigate("ActivityFeed")}
          accessibilityRole="button"
          accessibilityLabel={t("activity.title")}
        >
          <Icon name="notifications-outline" size={20} color={colors.textSecondary} />
          <AppText variant="body" style={{ flex: 1, marginLeft: 12 }}>{t("activity.title")}</AppText>
          <Icon name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>

        {/* Gizlilik */}
        <SectionHeader title={tx.privacyTitle} style={{ marginTop: spacing.xxl }} />
        <Pressable
          style={styles.infoRow}
          onPress={() => setPrivacyVisible(true)}
          accessibilityRole="button"
          accessibilityLabel={tx.privacyRow}
        >
          <Icon name="shield-checkmark-outline" size={20} color={colors.textSecondary} />
          <AppText variant="body" style={{ flex: 1, marginLeft: 12 }}>{tx.privacyRow}</AppText>
          <Icon name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>

        <View style={{ marginTop: spacing.xxl }}>
          <Button title={t("profile.logout")} variant="danger" icon="log-out-outline" onPress={handleLogout} />
        </View>

        {/* Tehlikeli Bölge — Hesap Silme (KVKK silme hakkı) */}
        <SectionHeader title={tx.dangerTitle} style={{ marginTop: spacing.xxl }} />
        <Pressable
          style={styles.deleteRow}
          onPress={() => { setDeletePassword(""); setDeleteVisible(true); }}
          accessibilityRole="button"
          accessibilityLabel={tx.deleteAccount}
        >
          <Icon name="trash-outline" size={20} color={colors.danger} />
          <AppText variant="body" style={{ flex: 1, marginLeft: 12, color: colors.danger }}>
            {tx.deleteAccount}
          </AppText>
        </Pressable>
      </ScrollView>

      {/* Gizlilik/aydınlatma görüntüleme modalı */}
      <PrivacyConsent
        visible={privacyVisible}
        mode="view"
        onClose={() => setPrivacyVisible(false)}
      />

      {/* Hesap silme onay + parola doğrulama */}
      <Dialog visible={deleteVisible} onClose={() => !deleting && setDeleteVisible(false)}>
        <AppText variant="title" style={{ marginBottom: spacing.sm, color: colors.danger }}>
          {tx.deleteAccount}
        </AppText>
        <AppText variant="body" color="textSecondary" style={{ marginBottom: spacing.lg, lineHeight: 22 }}>
          {tx.deleteWarn}
        </AppText>
        <PasswordInput
          label={tx.passwordLabel}
          placeholder={tx.passwordPlaceholder}
          value={deletePassword}
          onChangeText={setDeletePassword}
          editable={!deleting}
        />
        <Button
          title={tx.confirmDelete}
          variant="danger"
          onPress={confirmDelete}
          loading={deleting}
          disabled={deleting}
          style={{ marginTop: spacing.md }}
        />
        <Button
          title={tx.cancel}
          variant="ghost"
          onPress={() => setDeleteVisible(false)}
          disabled={deleting}
          style={{ marginTop: spacing.sm }}
        />
      </Dialog>
    </ScreenContainer>
  );
}

const createStyles = (colors, spacing, radius) =>
  StyleSheet.create({
    profileHeader: {
      alignItems: "center",
      marginBottom: spacing.lg,
    },
    syncRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.warningSurface,
      borderRadius: radius.md,
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginTop: spacing.md,
    },
    segment: {
      flexDirection: "row",
      gap: spacing.sm,
    },
    segmentItem: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    segmentItemActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      padding: 14,
    },
    deleteRow: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.dangerSurface || colors.surface,
      borderWidth: 1,
      borderColor: colors.danger,
      borderRadius: radius.lg,
      padding: 14,
    },
  });
