// components/SearchResultCard.js
import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Icon from "./ui/Icon";
import { useTheme } from "../utils/theme";
import { useTranslation } from "../i18n/I18nProvider";
import { getScoreTone } from "../utils/format";
import { SurfaceCard, AppText, Badge, Monogram } from "./ui";

export default function SearchResultCard({ card, onPress }) {
  const { colors, radius, spacing } = useTheme();
  const { t } = useTranslation();
  const styles = useMemo(
    () => createStyles(colors, radius, spacing),
    [colors, radius, spacing]
  );

  const fields = card.fields || card;
  const name = fields.name || card.name || t("search.unnamed");
  const companyRaw = fields.company || card.company || "";
  const company = companyRaw || t("search.noCompany");
  const title = fields.title || card.title || "";
  const service = fields.service || card.service || "";
  const isFavorite = card.isFavorite || false;
  const qaScore = card.qaScore || 0;

  return (
    <SurfaceCard
      onPress={onPress}
      accessibilityLabel={`${name}, ${company}`}
      style={styles.container}
    >
      <Monogram name={name} company={companyRaw} size={48} style={{ marginRight: spacing.md }} />

      <View style={styles.content}>
        <View style={styles.header}>
          <AppText variant="bodyStrong" numberOfLines={1} style={styles.name}>
            {name}
          </AppText>
          {isFavorite && (
            <Icon
              name="star"
              size={16}
              color={colors.star}
              style={styles.favoriteIcon}
              accessibilityLabel={t("a11y.favorite")}
            />
          )}
        </View>

        <View style={styles.metaRow}>
          <Icon name="business-outline" size={14} color={colors.textSecondary} />
          <AppText
            variant="caption"
            color="textSecondary"
            numberOfLines={1}
            style={styles.metaText}
          >
            {company}
          </AppText>
        </View>

        {title ? (
          <View style={styles.metaRow}>
            <Icon name="briefcase-outline" size={14} color={colors.textMuted} />
            <AppText
              variant="caption"
              color="textMuted"
              numberOfLines={1}
              style={styles.metaText}
            >
              {title}
            </AppText>
          </View>
        ) : null}

        {service ? (
          <View style={styles.metaRow}>
            <Icon name="construct-outline" size={14} color={colors.textMuted} />
            <AppText
              variant="caption"
              color="textMuted"
              numberOfLines={1}
              style={styles.metaText}
            >
              {service}
            </AppText>
          </View>
        ) : null}

        {qaScore > 0 ? (
          <Badge
            tone={getScoreTone(qaScore)}
            label={`QA ${qaScore}%`}
            style={styles.qaBadge}
          />
        ) : null}
      </View>

      <Icon name="chevron-forward" size={20} color={colors.textMuted} />
    </SurfaceCard>
  );
}

const createStyles = (colors, radius, spacing) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: spacing.xl,
      marginBottom: spacing.md,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: radius.pill,
      backgroundColor: colors.primaryMuted,
      justifyContent: "center",
      alignItems: "center",
      marginRight: spacing.md,
    },
    content: {
      flex: 1,
      minWidth: 0,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
    },
    name: {
      flex: 1,
    },
    favoriteIcon: {
      marginLeft: spacing.sm,
    },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 2,
    },
    metaText: {
      flex: 1,
    },
    qaBadge: {
      marginTop: 6,
    },
  });
