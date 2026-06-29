// utils/theme.js
// 🌗 Tema sağlayıcı + useTheme hook'u. mode = "system" | "light" | "dark".
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance } from "react-native";
import {
  lightColors,
  darkColors,
  spacing,
  radius,
  typography,
  shadowsDark,
  shadowsLight,
} from "./colors";

const THEME_KEY = "app_theme_mode";
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // Migrasyon sürerken varsayılan "dark" (ekranlar taşınınca "system"e çevrilecek).
  const [mode, setModeState] = useState("dark");
  const [systemScheme, setSystemScheme] = useState(
    Appearance.getColorScheme() || "light"
  );
  const [isReady, setIsReady] = useState(false);

  // Kayıtlı modu yükle
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_KEY);
        if (saved === "light" || saved === "dark" || saved === "system") {
          setModeState(saved);
        }
      } catch (e) {
        // sessiz geç
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  // Sistem teması değişimini dinle (yalnız "system" modunda etkili)
  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme || "light");
    });
    return () => sub.remove();
  }, []);

  const setMode = useCallback(async (next) => {
    setModeState(next);
    try {
      await AsyncStorage.setItem(THEME_KEY, next);
    } catch (e) {
      // sessiz geç
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setModeState((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      AsyncStorage.setItem(THEME_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  const isDark = mode === "system" ? systemScheme !== "light" : mode === "dark";

  const value = useMemo(() => {
    return {
      colors: isDark ? darkColors : lightColors,
      shadows: isDark ? shadowsDark : shadowsLight,
      isDark,
      mode,
      setMode,
      toggleTheme,
      isReady,
      spacing,
      radius,
      typography,
    };
  }, [isDark, mode, setMode, toggleTheme, isReady]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Provider mount edilmemişse güvenli fallback (dark) — uygulama çökmez.
    return {
      colors: darkColors,
      shadows: shadowsDark,
      isDark: true,
      mode: "dark",
      setMode: () => {},
      toggleTheme: () => {},
      isReady: true,
      spacing,
      radius,
      typography,
    };
  }
  return ctx;
}
