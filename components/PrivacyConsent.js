// components/PrivacyConsent.js
// KVKK m.10 aydınlatma + açık rıza ekranı.
//
// ⚠️ ÖNEMLİ — PLACEHOLDER METİN: Aşağıdaki gizlilik/aydınlatma metni TASLAKTIR.
// Yayınlamadan önce bir hukuk danışmanıyla gerçek "Aydınlatma Metni" ve "Gizlilik
// Politikası" ile değiştirin. Metni güncellerken utils/consent.js içindeki
// CONSENT_KEY sürümünü artırın (kullanıcılara yeniden onay gösterilmesi için).
import React from "react";
import { View, ScrollView, Pressable, Linking } from "react-native";
import { Dialog, AppText, Button } from "./ui";
import { useTheme } from "../utils/theme";
import { useTranslation } from "../i18n/I18nProvider";

// TODO(legal): gerçek politika URL'nizi koyun.
const PRIVACY_POLICY_URL = "https://example.com/privacy";

const TEXT = {
  tr: {
    title: "Gizlilik ve Veri İşleme",
    body:
      "[TASLAK — hukuk onayı gerekli]\n\n" +
      "Bu uygulama, taradığınız kartvizitlerdeki kişisel verileri (ad, telefon, " +
      "e-posta, şirket, ünvan, adres) ve isteğe bağlı ses notlarını, metne çevirme " +
      "(OCR) ve kaydetme amacıyla işler. Bu veriler, işleme için harici bir sunucu " +
      "servisine ve Firebase (Google) altyapısına aktarılır.\n\n" +
      "Kartvizitini taradığınız kişiler üçüncü kişilerdir; verilerini yalnızca " +
      "meşru bir amaç ve uygun hukuki dayanak (ör. sözleşme/meşru menfaat) varsa " +
      "işlemelisiniz. Hesabınızı ve tüm verinizi Profil > Hesabı Sil'den istediğiniz " +
      "zaman silebilirsiniz.\n\n" +
      "Devam ederek bu koşulları okuduğunuzu ve kabul ettiğinizi onaylarsınız.",
    accept: "Okudum, kabul ediyorum",
    reject: "Kabul etmiyorum",
    policyLink: "Gizlilik Politikasının tamamı",
    close: "Kapat",
  },
  en: {
    title: "Privacy & Data Processing",
    body:
      "[DRAFT — requires legal review]\n\n" +
      "This app processes personal data on the business cards you scan (name, phone, " +
      "email, company, title, address) and optional voice notes, for the purpose of " +
      "text recognition (OCR) and storage. This data is transmitted to an external " +
      "processing backend and to Firebase (Google) infrastructure.\n\n" +
      "The people whose cards you scan are third parties; process their data only if " +
      "you have a legitimate purpose and an appropriate legal basis. You can delete " +
      "your account and all data at any time from Profile > Delete Account.\n\n" +
      "By continuing you confirm you have read and accept these terms.",
    accept: "I have read and accept",
    reject: "I do not accept",
    policyLink: "Read the full Privacy Policy",
    close: "Close",
  },
};

export default function PrivacyConsent({ visible, mode = "gate", onAccept, onReject, onClose }) {
  const { colors, spacing } = useTheme();
  const { lang } = useTranslation();
  const tx = TEXT[lang] || TEXT.tr;
  const isGate = mode === "gate";

  return (
    <Dialog visible={visible} onClose={onClose} dismissable={!isGate}>
      <AppText variant="title" style={{ marginBottom: spacing.md }}>
        {tx.title}
      </AppText>

      <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator>
        <AppText variant="body" color="textSecondary" style={{ lineHeight: 22 }}>
          {tx.body}
        </AppText>

        <Pressable
          onPress={() => Linking.openURL(PRIVACY_POLICY_URL).catch(() => {})}
          accessibilityRole="link"
          style={{ marginTop: spacing.md }}
        >
          <AppText variant="body" color="primary">
            {tx.policyLink}
          </AppText>
        </Pressable>
      </ScrollView>

      <View style={{ marginTop: spacing.lg }}>
        {isGate ? (
          <>
            <Button title={tx.accept} onPress={onAccept} />
            <Button
              title={tx.reject}
              variant="ghost"
              onPress={onReject}
              style={{ marginTop: spacing.sm }}
            />
          </>
        ) : (
          <Button title={tx.close} variant="secondary" onPress={onClose} />
        )}
      </View>
    </Dialog>
  );
}
