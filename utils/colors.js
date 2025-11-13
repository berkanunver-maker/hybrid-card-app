// utils/colors.js
export const darkColors = {
  background: "#121212",
  surface: "#1E1E1E",
  primary: "#7B61FF",
  secondary: "#5C7AEA",
  accent: "#00A8FF",
  text: "#FFFFFF",
  textSecondary: "#BBBBBB",  // ✅ Daha açık (önceden #999999)
  textMuted: "#888888",       // ✅ Orta ton (başlıklar için)
  border: "#2A2A2A",
  success: "#4CAF50",
  warning: "#FFC107",
  error: "#F44336",
  cardBackground: "#1C1C1E",  // ✅ Kart arka planı için ayrı renk
};

export const lightColors = {
  background: "#FFFFFF",
  surface: "#F8F8F8",
  primary: "#7B61FF",
  secondary: "#5C7AEA",
  accent: "#007AFF",
  text: "#000000",
  textSecondary: "#555555",
  textMuted: "#666666",
  border: "#DDDDDD",
  success: "#4CAF50",
  warning: "#FFC107",
  error: "#F44336",
  cardBackground: "#F5F5F5",
};

// Default olarak dark theme kullan
export const colors = darkColors;