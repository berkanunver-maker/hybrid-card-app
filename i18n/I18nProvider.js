// i18n/I18nProvider.js — basit, bağımlılıksız i18n (tr/en). t("key", { vars }).
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { strings } from "./strings";

const LANG_KEY = "app_language";
const I18nContext = createContext({ lang: "tr", setLang: () => {}, t: (k) => k });

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState("tr");

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(LANG_KEY);
        if (saved === "tr" || saved === "en") setLangState(saved);
      } catch (e) {
        // sessiz geç
      }
    })();
  }, []);

  const setLang = useCallback(async (l) => {
    setLangState(l);
    try {
      await AsyncStorage.setItem(LANG_KEY, l);
    } catch (e) {
      // sessiz geç
    }
  }, []);

  const t = useCallback(
    (key, vars) => {
      const table = strings[lang] || strings.tr || {};
      let val = table[key];
      if (val == null) val = (strings.tr || {})[key];
      if (val == null) return key; // anahtar yoksa anahtarı döndür (görünür uyarı)
      if (vars) {
        Object.keys(vars).forEach((k) => {
          val = val.split(`{${k}}`).join(String(vars[k]));
        });
      }
      return val;
    },
    [lang]
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation() {
  return useContext(I18nContext);
}
