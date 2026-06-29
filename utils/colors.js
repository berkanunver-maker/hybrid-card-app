// utils/colors.js
// 🎨 Tasarım sistemi token'ları — modern-minimal, light + dark.
// TEK KAYNAK. Yeni kod renklere useTheme() ile erişmeli; doğrudan `colors`
// import'u DEPRECATED (sadece henüz taşınmamış ekranlar için geçici).

// ============================================================
// 🌙 DARK
// ============================================================
export const darkColors = {
  // Yüzeyler
  bg: "#0E0F13",
  surface: "#16181D",
  surfaceAlt: "#1E2128",
  surfaceElevated: "#23262E",

  // Aksan (modern indigo — eski mor #7B61FF yerine)
  primary: "#6E8BFF",
  primaryMuted: "rgba(110,139,255,0.14)",
  primaryPressed: "#5C77E6",
  onPrimary: "#FFFFFF",

  // Metin
  text: "#F2F4F8",
  textSecondary: "#A4ABB8",
  textMuted: "#757D8C",

  // Kenarlık
  border: "#2A2E37",
  borderStrong: "#3A3F4A",

  // Örtü / scrim
  overlay: "rgba(0,0,0,0.6)",
  overlayCamera: "rgba(0,0,0,0.45)",

  // Durum
  success: "#3DD68C",
  successSurface: "rgba(61,214,140,0.14)",
  warning: "#FFB020",
  warningSurface: "rgba(255,176,32,0.14)",
  danger: "#FF6B6B",
  dangerSurface: "rgba(255,107,107,0.14)",
  info: "#5AC8FA",
  star: "#FFC93C",

  // Prestij aksanı (yalnızca niyetli vurgu — monogram vb.)
  gold: "#C9A86A",
  goldMuted: "rgba(201,168,106,0.5)",
  goldSurface: "rgba(201,168,106,0.12)",

  // Pasif
  disabledBg: "#20232B",
  disabledText: "#5A6170",
  shadow: "#000000",

  // ── Geriye dönük uyumluluk (eski anahtarlar; migrasyon bitince kaldırılacak) ──
  background: "#0E0F13",
  cardBackground: "#16181D",
  secondary: "#5AC8FA",
  accent: "#6E8BFF",
  error: "#FF6B6B",
  // Eski koddaki HATALI anahtarları haritala (gizli "undefined renk" bug fix)
  secondaryText: "#A4ABB8",
  white: "#FFFFFF",
};

// ============================================================
// ☀️ LIGHT
// ============================================================
export const lightColors = {
  bg: "#FFFFFF",
  surface: "#F6F7F9",
  surfaceAlt: "#EEF0F3",
  surfaceElevated: "#FFFFFF",

  primary: "#4F6BF0",
  primaryMuted: "rgba(79,107,240,0.10)",
  primaryPressed: "#3D58D6",
  onPrimary: "#FFFFFF",

  text: "#0D0F14",
  textSecondary: "#3F4654",
  textMuted: "#69707E",

  border: "#E3E6EB",
  borderStrong: "#CFD4DC",

  overlay: "rgba(17,19,24,0.4)",
  overlayCamera: "rgba(0,0,0,0.45)",

  success: "#1FA565",
  successSurface: "rgba(31,165,101,0.10)",
  warning: "#B7791F",
  warningSurface: "rgba(251,191,36,0.16)",
  danger: "#DC2626",
  dangerSurface: "rgba(220,38,38,0.10)",
  info: "#0A84C7",
  star: "#E0A100",

  // Prestij aksanı
  gold: "#A6822F",
  goldMuted: "rgba(166,130,47,0.5)",
  goldSurface: "rgba(166,130,47,0.1)",

  disabledBg: "#EDEFF2",
  disabledText: "#A0A6B0",
  shadow: "#000000",

  background: "#FFFFFF",
  cardBackground: "#F6F7F9",
  secondary: "#0A84C7",
  accent: "#4F6BF0",
  error: "#DC2626",
  secondaryText: "#3F4654",
  white: "#FFFFFF",
};

// ⚠️ DEPRECATED statik palet (eski `import { colors }` için geriye dönük).
// Yeni kod useTheme() kullanmalı. Migrasyon bitince kaldırılacak.
export const colors = darkColors;

// ============================================================
// 📏 Tema-bağımsız ölçek token'ları
// ============================================================
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
  full: 9999,
};

// 🔤 Font aileleri (App.js'te yükleniyor). serif = Fraunces (kahraman/isim),
// sans = Space Grotesk (UI), mono = Space Mono (telefon/web detayları).
export const fonts = {
  sans: "SpaceGrotesk_400Regular",
  sansMedium: "SpaceGrotesk_500Medium",
  sansSemibold: "SpaceGrotesk_600SemiBold",
  sansBold: "SpaceGrotesk_700Bold",
  serif: "Fraunces_600SemiBold",
  serifBold: "Fraunces_700Bold",
  mono: "SpaceMono_400Regular",
};

export const typography = {
  display: { fontFamily: fonts.serifBold, fontSize: 28, fontWeight: "700", lineHeight: 34, letterSpacing: -0.4 },
  title: { fontFamily: fonts.sansBold, fontSize: 22, fontWeight: "700", lineHeight: 28, letterSpacing: -0.3 },
  heading: { fontFamily: fonts.sansSemibold, fontSize: 17, fontWeight: "600", lineHeight: 22, letterSpacing: -0.2 },
  body: { fontFamily: fonts.sans, fontSize: 15, fontWeight: "400", lineHeight: 21 },
  bodyStrong: { fontFamily: fonts.sansSemibold, fontSize: 15, fontWeight: "600", lineHeight: 21 },
  label: { fontFamily: fonts.sansMedium, fontSize: 13, fontWeight: "500", lineHeight: 18 },
  caption: { fontFamily: fonts.sansMedium, fontSize: 12, fontWeight: "500", lineHeight: 16, letterSpacing: 0.2 },
  sectionHeader: { fontFamily: fonts.sansSemibold, fontSize: 12, fontWeight: "600", lineHeight: 16, letterSpacing: 0.6 },
};

// Gölge / elevation — dark'ta yüzey+border ile derinlik (neredeyse görünmez),
// light'ta yumuşak gölge.
const noShadow = {
  shadowColor: "transparent",
  shadowOpacity: 0,
  shadowRadius: 0,
  shadowOffset: { width: 0, height: 0 },
  elevation: 0,
};

export const shadowsDark = {
  sm: noShadow,
  md: { shadowColor: "#000000", shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  lg: { shadowColor: "#000000", shadowOpacity: 0.4, shadowRadius: 20, shadowOffset: { width: 0, height: 8 }, elevation: 10 },
};

export const shadowsLight = {
  sm: { shadowColor: "#000000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  md: { shadowColor: "#000000", shadowOpacity: 0.1, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 6 },
  lg: { shadowColor: "#000000", shadowOpacity: 0.14, shadowRadius: 24, shadowOffset: { width: 0, height: 10 }, elevation: 12 },
};
