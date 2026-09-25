// screens/OnboardingScreen.js
import React, { useRef, useState, useMemo } from "react";
import { View, ScrollView, Pressable, Dimensions, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../utils/theme";
import { useTranslation } from "../i18n/I18nProvider";
import { AppText, Button, Icon } from "../components/ui";

export default function OnboardingScreen() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const SLIDES = [
    {
      icon: "scan-outline",
      title: t("misc.onboardSlide1Title"),
      desc: t("misc.onboardSlide1Desc"),
    },
    {
      icon: "albums-outline",
      title: t("misc.onboardSlide2Title"),
      desc: t("misc.onboardSlide2Desc"),
    },
    {
      icon: "qr-code-outline",
      title: t("misc.onboardSlide3Title"),
      desc: t("misc.onboardSlide3Desc"),
    },
  ];
  const { colors, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = Dimensions.get("window");
  const styles = useMemo(() => createStyles(colors, spacing, radius), [colors, spacing, radius]);

  const scrollRef = useRef(null);
  const [index, setIndex] = useState(0);
  const isLast = index === SLIDES.length - 1;

  const finish = async () => {
    try {
      await AsyncStorage.setItem("onboarding_seen", "1");
    } catch (e) {}
    navigation.replace("Login");
  };

  const next = () => {
    if (isLast) {
      finish();
    } else {
      scrollRef.current?.scrollTo({ x: (index + 1) * width, animated: true });
    }
  };

  const onMomentumEnd = (e) => {
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.skipRow}>
        <Pressable onPress={finish} hitSlop={8} accessibilityRole="button" accessibilityLabel={t("a11y.skip")}>
          <AppText variant="label" color="textMuted">{t("misc.skip")}</AppText>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumEnd}
      >
        {SLIDES.map((s, i) => (
          <View key={i} style={[styles.slide, { width }]}>
            <View style={styles.iconCircle}>
              <Icon name={s.icon} size={52} color={colors.primary} />
            </View>
            <AppText variant="display" style={{ textAlign: "center", marginTop: spacing.xxxl }}>
              {s.title}
            </AppText>
            <AppText
              variant="body"
              color="textMuted"
              style={{ textAlign: "center", marginTop: spacing.md, maxWidth: 300, lineHeight: 22 }}
            >
              {s.desc}
            </AppText>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === index ? styles.dotActive : null]} />
          ))}
        </View>
        <Button title={isLast ? t("misc.start") : t("misc.next")} onPress={next} />
      </View>
    </View>
  );
}

const createStyles = (colors, spacing, radius) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    skipRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      minHeight: 44,
    },
    slide: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: spacing.xxl,
    },
    iconCircle: {
      width: 120,
      height: 120,
      borderRadius: radius.pill,
      backgroundColor: colors.primaryMuted,
      alignItems: "center",
      justifyContent: "center",
    },
    footer: {
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.lg,
    },
    dots: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 8,
      marginBottom: spacing.xl,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.border,
    },
    dotActive: {
      width: 22,
      backgroundColor: colors.primary,
    },
  });
