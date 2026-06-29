// screens/CardHolderScreen.js
import React, { useEffect, useState, useMemo } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../utils/theme";
import { useTranslation } from "../i18n/I18nProvider";
import {
  ScreenContainer,
  AppText,
  SurfaceCard,
  Badge,
  EmptyState,
  Loader,
  SectionHeader,
  Icon,
} from "../components/ui";

// 🔹 Eğer Firestore kullanıyorsan import aktif et
// import { getUserCards } from "../services/firestoreService";

export default function CardHolderScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { colors, spacing, radius } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, spacing, radius),
    [colors, spacing, radius]
  );

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    try {
      setLoading(true);

      // 🔹 Gerçek veri Firestore'dan çekilecekse:
      // const data = await getUserCards(userId);
      // setCards(data);

      // 🔹 Şimdilik mock veriler (örnek için):
      const mock = [
        {
          id: "1",
          name: "Alexis Razo",
          company: "A Grieco Family Company; Mercedes-Benz",
          email: "arazo@griecocars.com",
          createdAt: "2025-11-01T11:00:00Z",
          voice_note: { text: "Bu bir ses kaydıdır. Deneme yapıyorum." },
        },
        {
          id: "2",
          name: "Serdar Uçan",
          company: "Uçan Kutu Ambalaj Sanayi",
          email: "info@ucankutu.com",
          createdAt: "2025-10-30T09:25:00Z",
          voice_note: null,
        },
      ];

      setCards(mock);
    } catch (error) {
      // sessiz geç
    } finally {
      setLoading(false);
    }
  };

  const renderCard = ({ item }) => (
    <SurfaceCard
      onPress={() => navigation.navigate("CardDetail", { cardData: item })}
      accessibilityLabel={`${item.name}, ${item.company}`}
      style={{ marginBottom: spacing.md }}
    >
      <View style={styles.cardRow}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <AppText variant="bodyStrong" numberOfLines={1}>
            {item.name}
          </AppText>
          <AppText
            variant="caption"
            color="textSecondary"
            numberOfLines={1}
            style={{ marginTop: 2 }}
          >
            {item.company}
          </AppText>
          <AppText
            variant="caption"
            color="textMuted"
            numberOfLines={1}
            style={{ marginTop: 2 }}
          >
            {item.email}
          </AppText>
        </View>
        <Icon name="chevron-forward" size={22} color={colors.primary} />
      </View>

      {item.voice_note?.text && (
        <Badge tone="primary" label={t("lists.voiceNoteAttached")} style={{ marginTop: 10 }} />
      )}
    </SurfaceCard>
  );

  if (loading) {
    return <Loader visible text={t("lists.loadingCards")} />;
  }

  return (
    <ScreenContainer padded>
      <SectionHeader title={t("lists.savedCards")} style={{ marginTop: spacing.md }} />

      {cards.length === 0 ? (
        <EmptyState
          icon="documents-outline"
          title={t("lists.cardHolderEmptyTitle")}
          description={t("lists.cardHolderEmptyDescription")}
          actionLabel={t("lists.scanNewCard")}
          onAction={() => navigation.navigate("Camera")}
        />
      ) : (
        <FlatList
          data={cards}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </ScreenContainer>
  );
}

const createStyles = (colors, spacing, radius) =>
  StyleSheet.create({
    cardRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
  });
