// components/ui/DigitalCard.js
// 💳 Sinyatür kart nesnesi — her temada premium-koyu bir "obje".
// Şirketten türeyen aksan + altın monogram + Fraunces isim + mono iletişim.
import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import Icon from "./Icon";
import AppText from "./Text";
import { cleanUrl } from "../../utils/format";
import { useTranslation } from "../../i18n/I18nProvider";

// Kart-içi sabit palet (tema-bağımsız; obje hep premium-koyu)
const CARD = {
  bg: "#0B0C10",
  border: "rgba(255,255,255,0.08)",
  ink: "#F2F1EC",
  inkMuted: "#9AA0AD",
  inkFaint: "#6E7382",
  mono: "#8A8F9C",
  gold: "#C9A86A",
};

// Şirkete göre tutarlı, küratörlü premium aksan
const ACCENTS = ["#6E8BFF", "#3DD68C", "#FF8F6B", "#C9A86A", "#5AC8FA", "#B07DFF", "#F0A93C"];

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function accentFor(company) {
  if (!company) return "#6E8BFF";
  return ACCENTS[hashStr(company) % ACCENTS.length];
}

export function monogramOf(name) {
  if (!name || !name.trim()) return "•";
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] || "";
  const b = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (a + b).toUpperCase() || name.trim()[0].toUpperCase();
}

export default function DigitalCard({
  name,
  company,
  title,
  phone,
  mobile,
  email,
  website,
  onPress,
  style,
}) {
  const { t } = useTranslation();
  const accent = accentFor(company);
  const mono = monogramOf(name);
  const tel = mobile || phone;

  const inner = (
    <View style={[styles.card, style]}>
      <View style={styles.top}>
        <AppText font="serif" color={CARD.gold} style={styles.monogram}>
          {mono}
        </AppText>
        {company ? (
          <View style={styles.companyRow}>
            <View style={[styles.dot, { backgroundColor: accent }]} />
            <AppText color={CARD.inkMuted} style={styles.company} numberOfLines={1}>
              {company}
            </AppText>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        <AppText font="serif" color={CARD.ink} style={styles.name} numberOfLines={2}>
          {name || t("ui.unnamed")}
        </AppText>
        {title ? (
          <AppText font="mono" color={CARD.inkFaint} style={styles.role} numberOfLines={1}>
            {title}
          </AppText>
        ) : null}
        <View style={styles.contact}>
          {tel ? (
            <AppText font="mono" color={CARD.mono} style={styles.line}>
              {tel}
            </AppText>
          ) : null}
          {email ? (
            <AppText font="mono" color={CARD.mono} style={styles.line} numberOfLines={1}>
              {email}
            </AppText>
          ) : null}
          {website ? (
            <AppText font="mono" color={CARD.mono} style={styles.line} numberOfLines={1}>
              {cleanUrl(website)}
            </AppText>
          ) : null}
        </View>
      </View>

      <Icon name="qr-code-outline" size={20} color={CARD.inkFaint} style={styles.qr} />
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${name || "Kart"}${company ? ", " + company : ""}`}
        style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.985 : 1 }] })}
      >
        {inner}
      </Pressable>
    );
  }
  return inner;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CARD.bg,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CARD.border,
    padding: 22,
    minHeight: 208,
    justifyContent: "space-between",
    overflow: "hidden",
  },
  top: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  monogram: {
    fontSize: 22,
    lineHeight: 26,
  },
  companyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    maxWidth: "62%",
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  company: {
    fontSize: 13,
  },
  body: {
    marginTop: 20,
  },
  name: {
    fontSize: 28,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  role: {
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    marginTop: 8,
  },
  contact: {
    marginTop: 12,
  },
  line: {
    fontSize: 12,
    lineHeight: 19,
  },
  qr: {
    position: "absolute",
    right: 20,
    bottom: 20,
  },
});
