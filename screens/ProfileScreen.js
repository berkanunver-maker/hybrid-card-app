// screens/ProfileScreen.js — Profil & Ayarlar merkezi (Profil sekmesi)
import React, { useMemo } from "react";
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
} from "../components/ui";

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
  const { pendingCount, processNow } = useOfflineQueue();

  const auth = getAuth();
  const user = auth.currentUser;
  const email = user?.email || "";
  const name = user?.displayName || email || t("profile.user");
  const version = Constants?.expoConfig?.version || "1.0.0";

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
            onPress={processNow}
            accessibilityRole="button"
            accessibilityLabel={t("profile.syncNow")}
          >
            <Icon name="cloud-upload-outline" size={18} color={colors.warning} />
            <AppText variant="caption" style={{ color: colors.warning, flex: 1, marginLeft: 8 }}>
              {t("profile.syncPending", { count: pendingCount })}
            </AppText>
            <AppText variant="caption" color="primary">{t("profile.syncNow")}</AppText>
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

        <View style={{ marginTop: spacing.xxl }}>
          <Button title={t("profile.logout")} variant="danger" icon="log-out-outline" onPress={handleLogout} />
        </View>
      </ScrollView>
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
  });
