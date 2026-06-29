// components/ui/CardShareSheet.js
// Kartı vCard QR'ı olarak gösterir (karşı taraf taratıp rehbere ekler) + native paylaşım.
import React, { useMemo } from "react";
import { View, Share } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useTheme } from "../../utils/theme";
import { useTranslation } from "../../i18n/I18nProvider";
import AppText from "./Text";
import Button from "./Button";
import BottomSheet from "./BottomSheet";
import { cleanUrl } from "../../utils/format";

function buildVCard(f) {
  const website = f.website ? cleanUrl(f.website) : "";
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${f.name || ""}`,
    f.company ? `ORG:${f.company}` : null,
    f.title ? `TITLE:${f.title}` : null,
    f.mobile ? `TEL;TYPE=CELL:${f.mobile}` : null,
    f.phone ? `TEL;TYPE=WORK:${f.phone}` : null,
    f.email ? `EMAIL:${f.email}` : null,
    website ? `URL:${website}` : null,
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildShareText(f, t) {
  const website = f.website ? cleanUrl(f.website) : "";
  return [
    f.name,
    f.title,
    f.company,
    f.mobile && `${t("ui.shareMobile")}: ${f.mobile}`,
    f.phone && `${t("ui.sharePhone")}: ${f.phone}`,
    f.email && `${t("ui.shareEmail")}: ${f.email}`,
    website && `${t("ui.shareWeb")}: ${website}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export default function CardShareSheet({ visible, onClose, fields }) {
  const { radius, spacing } = useTheme();
  const { t } = useTranslation();
  const f = fields || {};
  const vcard = useMemo(() => buildVCard(f), [f.name, f.company, f.title, f.mobile, f.phone, f.email, f.website]);
  const hasData = !!(f.name || f.email || f.mobile || f.phone);

  const handleShare = async () => {
    try {
      await Share.share({ message: buildShareText(f, t) });
    } catch (e) {
      // paylaşım iptal/başarısız — sessiz geç
    }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <AppText variant="heading" style={{ textAlign: "center", marginBottom: 4 }}>
        {t("ui.shareCardTitle")}
      </AppText>
      <AppText variant="caption" color="textMuted" style={{ textAlign: "center", marginBottom: spacing.xl }}>
        {t("ui.shareCardSubtitle")}
      </AppText>

      <View
        style={{
          alignSelf: "center",
          backgroundColor: "#FFFFFF",
          padding: 16,
          borderRadius: radius.lg,
          marginBottom: spacing.xl,
        }}
      >
        {hasData ? (
          <QRCode value={vcard} size={184} backgroundColor="#FFFFFF" color="#0B0C10" />
        ) : (
          <View style={{ width: 184, height: 184, alignItems: "center", justifyContent: "center" }}>
            <AppText color="#0B0C10" style={{ textAlign: "center" }}>
              {t("ui.shareNotEnoughInfo")}
            </AppText>
          </View>
        )}
      </View>

      <AppText variant="bodyStrong" style={{ textAlign: "center" }}>
        {f.name || t("ui.unnamed")}
      </AppText>
      {f.company ? (
        <AppText variant="caption" color="textSecondary" style={{ textAlign: "center", marginTop: 2 }}>
          {f.company}
        </AppText>
      ) : null}

      <Button
        title={t("common.share")}
        icon="share-social-outline"
        onPress={handleShare}
        disabled={!hasData}
        style={{ marginTop: spacing.xl }}
      />
    </BottomSheet>
  );
}
