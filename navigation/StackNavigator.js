// navigation/StackNavigator.js
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import TabNavigator from "./TabNavigator";
import { Header } from "../components";
import { useTranslation } from "../i18n/I18nProvider";

// 📄 Ekranlar
import SplashScreen from "../screens/SplashScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import LoginScreen from "../screens/LoginScreen";
import ProfileSetupScreen from "../screens/ProfileSetupScreen";
import CameraScreen from "../screens/CameraScreen";
import AddContactScreen from "../screens/AddContactScreen";
import QADetailScreen from "../screens/QADetailScreen";
import DocumentScreen from "../screens/DocumentScreen";
import VisionScreen from "../screens/VisionScreen";
import VoiceScreen from "../screens/VoiceScreen";
import CardDetailScreen from "../screens/CardDetailScreen";
import QAResultScreen from "../screens/QAResultScreen";
import CardHolderScreen from "../screens/CardHolderScreen";

// 🆕 Yeni Ekranlar
import FolderScreen from "../screens/FolderScreen";
import FavoritesScreen from "../screens/FavoritesScreen";
import AllCardsScreen from "../screens/AllCardsScreen";
import ActivityFeedScreen from "../screens/ActivityFeedScreen";
import SearchScreen from "../screens/SearchScreen";

// 🆕 Şifremi Unuttum Ekranı
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";

// 🆕 Kayıt Ol (Yeni Kullanıcı) Ekranı
import RegisterScreen from "../screens/RegisterScreen";

// 📊 Diğer Ekranlar
import StatsScreen from "../screens/StatsScreen";
import ToolsScreen from "../screens/ToolsScreen";
import QAPreviewScreen from "../screens/QAPreviewScreen";
import FairSelectScreen from "../screens/FairSelectScreen";
import SelectCategoryModal from "../screens/SelectCategoryModal";
import SettingsScreen from "../screens/SettingsScreen";

const Stack = createStackNavigator();

export default function StackNavigator() {
  const { t } = useTranslation();
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={({ navigation }) => ({
        header: (props) => (
          <Header
            title={props.options.title || ""}
            onBackPress={navigation.canGoBack() ? () => navigation.goBack() : null}
          />
        ),
      })}
    >
      {/* 🚀 Başlangıç Ekranı */}
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
        options={{ headerShown: false }}
      />

      {/* 👋 Onboarding (ilk açılış) */}
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ headerShown: false }}
      />

      {/* 🔐 Giriş Ekranı */}
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />

      {/* 🆕 Kayıt Ol Ekranı */}
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ headerShown: false }}
      />

      {/* 🔑 Şifremi Unuttum */}
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ headerShown: false }}
      />

      {/* 🧾 Profil Kurulum */}
      <Stack.Screen
        name="ProfileSetup"
        component={ProfileSetupScreen}
        options={{ headerShown: false }}
      />

      {/* 🏠 Ana Sekme Navigasyon */}
      <Stack.Screen
        name="Main"
        component={TabNavigator}
        options={{ headerShown: false }}
      />

      {/* 🔍 Arama Ekranı */}
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{ headerShown: false }}
      />

      {/* 📷 Kamera */}
      <Stack.Screen
        name="Camera"
        component={CameraScreen}
        options={{ headerShown: false }}
      />

      {/* ✍️ Elle Kişi Ekle */}
      <Stack.Screen
        name="AddContact"
        component={AddContactScreen}
        options={{ headerShown: false }}
      />

      {/* 🆕 Klasör İçeriği */}
      <Stack.Screen
        name="Folder"
        component={FolderScreen}
        options={{ headerShown: false }}
      />

      {/* 🆕 Favoriler */}
      <Stack.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ headerShown: false }}
      />

      {/* 🗂️ Tüm Kartlar */}
      <Stack.Screen
        name="AllCards"
        component={AllCardsScreen}
        options={{ headerShown: false }}
      />

      {/* 🏢 Ekip Aktivitesi (Faz 2) */}
      <Stack.Screen
        name="ActivityFeed"
        component={ActivityFeedScreen}
        options={{ headerShown: false }}
      />

      {/* 🆕 Kart Detay Ekranı */}
      <Stack.Screen
        name="CardDetail"
        component={CardDetailScreen}
        options={{ headerShown: false }}
      />

      {/* 🧠 QA Detay */}
      <Stack.Screen
        name="QADetail"
        component={QADetailScreen}
        options={{ title: t("ui.titleQADetail") }}
      />

      {/* 📄 Document AI */}
      <Stack.Screen
        name="Document"
        component={DocumentScreen}
        options={{ title: "Document AI" }}
      />

      {/* 👁️ Vision OCR */}
      <Stack.Screen
        name="Vision"
        component={VisionScreen}
        options={{ title: "Vision OCR" }}
      />

      {/* 🎙️ Voice Transcribe */}
      <Stack.Screen
        name="Voice"
        component={VoiceScreen}
        options={{ title: "Voice Transcribe" }}
      />

      {/* 🆕 Geçmiş Kartlar */}
      <Stack.Screen
        name="CardHolder"
        component={CardHolderScreen}
        options={{ title: t("ui.titleCardHolder") }}
      />

      {/* 🧾 QA Sonuç */}
      <Stack.Screen
        name="QAResult"
        component={QAResultScreen}
        options={{ title: t("ui.titleQAResult") }}
      />

      {/* 📊 İstatistikler */}
      <Stack.Screen
        name="Stats"
        component={StatsScreen}
        options={{ headerShown: false }}
      />

      {/* 🛠️ Araçlar */}
      <Stack.Screen
        name="Tools"
        component={ToolsScreen}
        options={{ title: t("ui.titleTools") }}
      />

      {/* 👁️ QA Önizleme */}
      <Stack.Screen
        name="QAPreview"
        component={QAPreviewScreen}
        options={{ title: t("ui.titleQAPreview") }}
      />

      {/* 🎪 Fuar Seçimi */}
      <Stack.Screen
        name="FairSelect"
        component={FairSelectScreen}
        options={{ title: t("ui.titleFairSelect") }}
      />

      {/* 📁 Kategori Seçimi */}
      <Stack.Screen
        name="SelectCategory"
        component={SelectCategoryModal}
        options={{ title: t("ui.titleSelectCategory") }}
      />

      {/* ⚙️ Ayarlar */}
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: t("ui.titleSettings") }}
      />
    </Stack.Navigator>
  );
}
