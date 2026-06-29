// screens/SettingsScreen.js
import React, { useMemo } from "react";
import { View, Pressable, Alert, ScrollView, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getAuth, signOut } from "firebase/auth";
import { useTheme } from "../utils/theme";
import { useTranslation } from "../i18n/I18nProvider";
import { ScreenContainer, AppText, SectionHeader, Button, Icon } from "../components/ui";

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const THEME_OPTIONS = [
    { key: "system", label: t("misc.themeSystem"), icon: "phone-portrait-outline" },
    { key: "light", label: t("misc.themeLight"), icon: "sunny-outline" },
    { key: "dark", label: t("misc.themeDark"), icon: "moon-outline" },
  ];
  const { colors, spacing, radius, mode, setMode } = useTheme();
  const styles = useMemo(() => createStyles(colors, spacing, radius), [colors, spacing, radius]);

  const auth = getAuth();
  const email = auth.currentUser?.email;

  const handleLogout = () => {
    Alert.alert(t("misc.logout"), t("misc.logoutConfirm"), [
      { text: t("common.dismiss"), style: "cancel" },
      {
        text: t("misc.logout"),
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(auth);
            navigation.reset({ index: 0, routes: [{ name: "Login" }] });
          } catch (e) {
            Alert.alert(t("common.error"), t("misc.logoutError"));
          }
        },
      },
    ]);
  };

  return (
    <ScreenContainer padded>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: 40 }}
      >
        <AppText variant="title" style={{ marginBottom: spacing.xl }}>
          {t("misc.settings")}
        </AppText>

        {email ? (
          <View style={styles.account}>
            <View style={styles.avatar}>
              <Icon name="person" size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>
              <AppText variant="bodyStrong" numberOfLines={1}>
                {email}
              </AppText>
              <AppText variant="caption" color="textMuted">
                {t("misc.signedIn")}
              </AppText>
            </View>
          </View>
        ) : null}

        <SectionHeader title={t("misc.appearance")} style={{ marginTop: spacing.xl }} />
        <View style={styles.segment}>
          {THEME_OPTIONS.map((opt) => {
            const active = mode === opt.key;
            return (
              <Pressable
                key={opt.key}
                onPress={() => setMode(opt.key)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`${opt.label} tema`}
                style={[styles.segmentItem, active && styles.segmentItemActive]}
              >
                <Icon
                  name={opt.icon}
                  size={18}
                  color={active ? colors.onPrimary : colors.textSecondary}
                />
                <AppText
                  variant="label"
                  style={{ color: active ? colors.onPrimary : colors.textSecondary, marginTop: 4 }}
                >
                  {opt.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <SectionHeader title={t("misc.account")} style={{ marginTop: spacing.xxl }} />
        <Button title={t("misc.logout")} variant="danger" icon="log-out-outline" onPress={handleLogout} />
      </ScrollView>
    </ScreenContainer>
  );
}

const createStyles = (colors, spacing, radius) =>
  StyleSheet.create({
    account: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      padding: 14,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: radius.pill,
      backgroundColor: colors.primaryMuted,
      alignItems: "center",
      justifyContent: "center",
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
  });
