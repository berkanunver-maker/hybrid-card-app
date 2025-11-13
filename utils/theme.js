// utils/theme.js
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useMemo,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance } from "react-native";
import { lightColors, darkColors } from "./colors";

// Anahtar ve context
const THEME_KEY = "app_theme_mode";
const ThemeContext = createContext();

// 🔹 Hata durumunda kullanılacak yedek renkler
const fallbackColors = {
  background: "#121212",
  surface: "#1E1E1E",
  primary: "#7B61FF",
  text: "#FFFFFF",
  textSecondary: "#999999",
  border: "#2A2A2A",
};

// 🔹 Theme Provider
export function ThemeProvider({ children }) {
  const systemScheme = Appearance.getColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === "dark");

  // Tema değiştirici
  const toggleTheme = async () => {
    const newMode = !isDark;
    setIsDark(newMode);
    await AsyncStorage.setItem(THEME_KEY, newMode ? "dark" : "light");
  };

  // AsyncStorage + sistem dinleyici
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_KEY);
        if (saved) setIsDark(saved === "dark");
        else setIsDark(systemScheme === "dark");
      } catch (e) {
        console.warn("⚠️ Theme restore failed:", e.message);
      }
    })();

    const listener = Appearance.addChangeListener(({ colorScheme }) => {
      setIsDark(colorScheme === "dark");
    });

    return () => listener.remove();
  }, []);

  // Tema nesnesi
  const theme = useMemo(() => {
    const palette = isDark ? darkColors || fallbackColors : lightColors || fallbackColors;
    return { colors: palette, isDark };
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ ...theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// 🔹 Hook
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context || !context.colors) {
    // Eğer Provider bağlanmamışsa bile hata vermez
    console.warn("⚠️ ThemeContext bulunamadı, fallback theme kullanılıyor.");
    return { colors: fallbackColors, isDark: true, toggleTheme: () => {} };
  }
  return context;
}
