// i18n/index.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Dil dosyalarını import et
import tr from './locales/tr.json';
import en from './locales/en.json';

const LANGUAGE_KEY = '@app_language';

// Dil dosyaları
const resources = {
  tr: { translation: tr },
  en: { translation: en },
};

// Kayıtlı dili getir veya cihaz dilini kullan
const getInitialLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (savedLanguage) {
      return savedLanguage;
    }

    // Cihaz dilini al
    const deviceLanguage = Localization.locale.split('-')[0]; // 'tr-TR' -> 'tr'

    // Desteklenen diller arasında varsa kullan, yoksa İngilizce
    return ['tr', 'en'].includes(deviceLanguage) ? deviceLanguage : 'en';
  } catch (error) {
    console.error('Language detection error:', error);
    return 'en';
  }
};

// i18n'i başlat
const initI18n = async () => {
  const initialLanguage = await getInitialLanguage();

  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: initialLanguage,
      fallbackLng: 'en',
      compatibilityJSON: 'v3',
      interpolation: {
        escapeValue: false, // React zaten XSS koruması yapıyor
      },
      react: {
        useSuspense: false,
      },
    });
};

// Dili değiştir ve kaydet
export const changeLanguage = async (language) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
    await i18n.changeLanguage(language);
    console.log(`✅ Dil değiştirildi: ${language}`);
  } catch (error) {
    console.error('❌ Dil değiştirme hatası:', error);
  }
};

// Mevcut dili al
export const getCurrentLanguage = () => i18n.language;

// Desteklenen diller listesi
export const supportedLanguages = [
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
];

initI18n();

export default i18n;
