// navigation/StackNavigator.js
import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import TabNavigator from "./TabNavigator";
import { Header } from "../components";

// 📄 Ekranlar
import SplashScreen from "../screens/SplashScreen";
import LoginScreen from "../screens/LoginScreen";
import ProfileSetupScreen from "../screens/ProfileSetupScreen";
import CameraScreen from "../screens/CameraScreen";
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
import SearchScreen from "../screens/SearchScreen";

// 🆕 Şifremi Unuttum Ekranı
import ForgotPasswordScreen from "../screens/ForgotPasswordScreen";

// 🆕 Kayıt Ol (Yeni Kullanıcı) Ekranı
import RegisterScreen from "../screens/RegisterScreen";

const Stack = createStackNavigator();

export default function StackNavigator() {
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
        options={{ title: "Analiz Detayı" }}
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
        options={{ title: "Kart Arşivi" }}
      />

      {/* 🧾 QA Sonuç */}
      <Stack.Screen
        name="QAResult"
        component={QAResultScreen}
        options={{ title: "QA Sonuçları" }}
      />
    </Stack.Navigator>
  );
}
