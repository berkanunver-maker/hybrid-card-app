// screens/AddContactScreen.js
// ✍️ Elle kişi ekleme — kartı olmayan kişiler için hızlı giriş.
// Ad + Telefon öne çıkar, gerisi opsiyonel; yazılı + sesli not. Fotoğraf/AI yok;
// doğrudan Firestore'a normal bir kart olarak kaydedilir.
import React, { useState, useMemo } from "react";
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import { useTheme } from "../utils/theme";
import { useTranslation } from "../i18n/I18nProvider";
import { FirestoreService } from "../services/firestoreService";
import {
  ScreenContainer,
  AppText,
  Input,
  Button,
  Icon,
  SurfaceCard,
  VoiceRecorder,
} from "../components/ui";

export default function AddContactScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const { colors, spacing, radius, typography } = useTheme();
  const styles = useMemo(
    () => createStyles(colors, spacing, radius),
    [colors, spacing, radius]
  );

  const { categoryId, categoryName } = route.params || {};
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [voiceNote, setVoiceNote] = useState(null);
  const [voiceRecVisible, setVoiceRecVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  // En az ad veya telefon dolu olmalı
  const canSave = name.trim().length > 0 || phone.trim().length > 0;

  const resetForm = () => {
    setName("");
    setPhone("");
    setCompany("");
    setEmail("");
    setTitle("");
    setNote("");
    setShowMore(false);
    setVoiceNote(null);
  };

  const handleSave = async () => {
    if (!userId) {
      Alert.alert(t("common.error"), t("addContact.notLoggedIn"));
      return;
    }
    if (!canSave) {
      Alert.alert(t("addContact.missingTitle"), t("addContact.missingMessage"));
      return;
    }
    // E-posta varsa geçerli olmalı (Firestore kuralları da aynısını ister)
    const emailTrim = email.trim();
    if (emailTrim && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailTrim)) {
      Alert.alert(t("addContact.invalidEmailTitle"), t("addContact.invalidEmailMessage"));
      return;
    }
    try {
      setSaving(true);

      // Kategori verilmemişse "Genel"e düşür (kart kaybolmasın)
      let catId = categoryId;
      let catName = categoryName;
      if (!catId) {
        try {
          const def = await FirestoreService.createDefaultCategory(userId);
          catId = def.id;
          catName = def.name;
        } catch (e) {
          // Varsayılan kategori alınamadı → kartı klasörsüz kaydedip "başarılı" demek
          // yanıltıcı olur (klasör görünümlerinde görünmez). Girdiyi koruyup uyar (#55).
          setSaving(false);
          Alert.alert(t("common.error"), t("addContact.saveError"));
          return;
        }
      }

      // Yalnızca dolu alanları yaz — boş string'ler Firestore kurallarına takılıyor
      // (ör. isValidEmail("") === false) ve veriyi gereksiz kirletiyor.
      const fields = {};
      const candidates = {
        name: name.trim(),
        company: company.trim(),
        title: title.trim(),
        mobile: phone.trim(),
        email: emailTrim,
      };
      Object.keys(candidates).forEach((k) => {
        if (candidates[k]) fields[k] = candidates[k];
      });

      const cardData = {
        userId,
        source: "manual",
        fields,
        ...fields,
        ...(note.trim() && { note: note.trim() }),
        ...(voiceNote && { voice_note: voiceNote }),
        ...(catId && { categoryId: catId, categoryName: catName }),
        createdAt: new Date().toISOString(),
      };

      const saved = await FirestoreService.addCard(cardData);
      setSaving(false);

      Alert.alert(t("addContact.savedTitle"), t("addContact.savedMessage"), [
        { text: t("addContact.addAnother"), onPress: resetForm },
        {
          text: t("addContact.viewCard"),
          onPress: () =>
            navigation.replace("CardDetail", {
              cardData: { id: saved.id, ...cardData },
            }),
        },
        { text: t("card.homeAction"), onPress: () => navigation.navigate("Main") },
      ]);
    } catch (error) {
      setSaving(false);
      Alert.alert(t("common.error"), t("addContact.saveError"));
    }
  };

  return (
    <ScreenContainer>
      {/* Başlık */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.iconButton}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t("common.back")}
        >
          <Icon name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <AppText variant="heading" style={styles.headerTitle} numberOfLines={1}>
          {t("addContact.title")}
        </AppText>
        <View style={styles.iconButton} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AppText variant="body" color="textMuted" style={{ marginBottom: spacing.xl }}>
            {t("addContact.subtitle")}
          </AppText>

          {/* Öne çıkan alanlar */}
          <Input
            label={t("addContact.name")}
            value={name}
            onChangeText={setName}
            placeholder={t("addContact.namePlaceholder")}
            autoCapitalize="words"
            returnKeyType="next"
          />
          <Input
            label={t("addContact.phone")}
            value={phone}
            onChangeText={setPhone}
            placeholder={t("addContact.phonePlaceholder")}
            keyboardType="phone-pad"
          />

          {/* Daha fazla alan */}
          {showMore ? (
            <>
              <Input
                label={t("card.labelCompany")}
                value={company}
                onChangeText={setCompany}
                placeholder={t("addContact.companyPlaceholder")}
                autoCapitalize="words"
              />
              <Input
                label={t("card.labelEmail")}
                value={email}
                onChangeText={setEmail}
                placeholder={t("addContact.emailPlaceholder")}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Input
                label={t("card.labelTitle")}
                value={title}
                onChangeText={setTitle}
                placeholder={t("addContact.titlePlaceholder")}
                autoCapitalize="words"
              />
            </>
          ) : (
            <Pressable
              onPress={() => setShowMore(true)}
              style={styles.moreRow}
              accessibilityRole="button"
              accessibilityLabel={t("addContact.moreFields")}
            >
              <Icon name="add-circle-outline" size={18} color={colors.primary} />
              <AppText variant="bodyStrong" color="primary" style={{ marginLeft: 8 }}>
                {t("addContact.moreFields")}
              </AppText>
            </Pressable>
          )}

          {/* Yazılı not */}
          <AppText variant="label" color="textSecondary" style={{ marginBottom: 6, marginTop: spacing.sm }}>
            {t("addContact.note")}
          </AppText>
          <TextInput
            style={[styles.noteInput, typography.body]}
            value={note}
            onChangeText={setNote}
            placeholder={t("addContact.notePlaceholder")}
            placeholderTextColor={colors.textMuted}
            multiline
            textAlignVertical="top"
            accessibilityLabel={t("addContact.note")}
          />

          {/* Sesli not */}
          {voiceNote ? (
            <SurfaceCard style={styles.voiceCard}>
              <View style={styles.voiceRow}>
                <Icon name="mic" size={18} color={colors.primary} />
                <AppText variant="bodyStrong" style={{ marginLeft: 8, flex: 1 }}>
                  {t("addContact.voiceAdded")}
                </AppText>
                <Pressable
                  onPress={() => setVoiceNote(null)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={t("addContact.removeVoice")}
                >
                  <Icon name="trash-outline" size={20} color={colors.danger} />
                </Pressable>
              </View>
              {voiceNote.text ? (
                <AppText
                  variant="body"
                  color="textSecondary"
                  style={{ marginTop: spacing.sm, fontStyle: "italic" }}
                >
                  {`"${voiceNote.text}"`}
                </AppText>
              ) : null}
              <Button
                title={t("card.recordAgain")}
                icon="mic"
                variant="ghost"
                size="sm"
                fullWidth={false}
                onPress={() => setVoiceRecVisible(true)}
                style={{ marginTop: spacing.sm }}
              />
            </SurfaceCard>
          ) : (
            <Button
              title={t("card.addVoiceNote")}
              icon="mic"
              variant="secondary"
              onPress={() => setVoiceRecVisible(true)}
              style={{ marginTop: spacing.lg }}
            />
          )}

          {/* Kaydet */}
          <Button
            title={t("addContact.save")}
            icon="checkmark-circle"
            onPress={handleSave}
            loading={saving}
            disabled={saving || !canSave}
            style={{ marginTop: spacing.xl }}
          />
          <AppText
            variant="caption"
            color="textMuted"
            style={{ textAlign: "center", marginTop: spacing.md }}
          >
            {t("addContact.hint")}
          </AppText>
        </ScrollView>
      </KeyboardAvoidingView>

      <VoiceRecorder
        visible={voiceRecVisible}
        onClose={() => setVoiceRecVisible(false)}
        onComplete={(vn) => {
          setVoiceRecVisible(false);
          setVoiceNote(vn);
        }}
        userId={userId}
        transcribe
      />
    </ScreenContainer>
  );
}

const createStyles = (colors, spacing, radius) =>
  StyleSheet.create({
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.sm,
      paddingBottom: spacing.lg,
    },
    headerTitle: {
      flex: 1,
      textAlign: "center",
      marginHorizontal: spacing.sm,
    },
    iconButton: {
      width: 44,
      height: 44,
      justifyContent: "center",
      alignItems: "center",
    },
    scrollContent: {
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.xxxxl,
    },
    moreRow: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: spacing.sm,
      marginBottom: spacing.md,
    },
    noteInput: {
      backgroundColor: colors.surface,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.sm,
      paddingHorizontal: 14,
      paddingVertical: 12,
      minHeight: 90,
      marginBottom: spacing.sm,
    },
    voiceCard: {
      marginTop: spacing.lg,
    },
    voiceRow: {
      flexDirection: "row",
      alignItems: "center",
    },
  });
