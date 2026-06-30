// screens/ActivityFeedScreen.js
// 🏢 Ekip Aktivitesi — yöneticinin canlı akışı (Faz 2).
// Çalışanlar kart/not eklediğinde Cloud Functions activity yazar; burada
// onSnapshot ile anlık görünür. Kişisel hesaplarda "şirket gerekli" durumu.
import React, { useState, useEffect, useMemo } from "react";
import { View, FlatList, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import { useTheme } from "../utils/theme";
import { useTranslation } from "../i18n/I18nProvider";
import { getTimeAgo } from "../utils/format";
import { getActiveCompanyOrg, subscribeToActivity } from "../services/orgService";
import {
  ScreenContainer,
  AppText,
  SurfaceCard,
  EmptyState,
  Loader,
  Icon,
  Monogram,
} from "../components/ui";

// Firestore Timestamp → ISO (getTimeAgo string/Date bekler)
function toIso(ts) {
  if (!ts) return null;
  if (typeof ts?.toDate === "function") return ts.toDate().toISOString();
  return ts;
}

export default function ActivityFeedScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { colors, spacing, radius } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, spacing, radius),
    [colors, spacing, radius]
  );
  const userId = getAuth().currentUser?.uid;

  const [loading, setLoading] = useState(true);
  const [orgInfo, setOrgInfo] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    let active = true;
    let unsub;
    (async () => {
      try {
        const info = await getActiveCompanyOrg(userId);
        if (!active) return;
        setOrgInfo(info);
        if (info) {
          unsub = subscribeToActivity(
            info.orgId,
            (items) => {
              setEvents(items);
              setLoading(false);
            },
            () => setLoading(false)
          );
        } else {
          setLoading(false);
        }
      } catch (e) {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
      if (unsub) unsub();
    };
  }, [userId]);

  const renderItem = ({ item }) => (
    <SurfaceCard style={styles.row}>
      <Monogram name={item.actorName || "•"} company={item.actorName || ""} />
      <View style={styles.info}>
        <AppText variant="bodyStrong" numberOfLines={1}>
          {item.title || t("activity.defaultTitle")}
        </AppText>
        {item.preview ? (
          <AppText
            variant="caption"
            color="textSecondary"
            numberOfLines={2}
            style={{ marginTop: 2 }}
          >
            {item.preview}
          </AppText>
        ) : null}
        <AppText variant="caption" color="primary" style={{ marginTop: 6 }}>
          {getTimeAgo(toIso(item.createdAt))}
        </AppText>
      </View>
      {item.voice ? <Icon name="mic" size={16} color={colors.primary} /> : null}
    </SurfaceCard>
  );

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t("common.back")}
          style={styles.iconBtn}
        >
          <Icon name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Icon name="notifications-outline" size={20} color={colors.primary} style={{ marginRight: 8 }} />
          <AppText variant="title">{t("activity.title")}</AppText>
        </View>
        <View style={styles.iconBtn} />
      </View>

      {loading ? (
        <Loader visible text={t("common.loading")} />
      ) : !orgInfo ? (
        <EmptyState
          icon="business-outline"
          title={t("activity.noCompanyTitle")}
          description={t("activity.noCompanyDescription")}
        />
      ) : events.length === 0 ? (
        <EmptyState
          icon="notifications-outline"
          title={t("activity.emptyTitle")}
          description={t("activity.emptyDescription")}
        />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenContainer>
  );
}

const createStyles = (colors, spacing, radius) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },
    iconBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
    headerCenter: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
      justifyContent: "center",
    },
    list: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: spacing.xl,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: spacing.md,
    },
    info: { flex: 1, minWidth: 0 },
  });
