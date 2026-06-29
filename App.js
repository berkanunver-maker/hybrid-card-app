// App.js
import React, { useCallback, useEffect } from "react";
import { registerRootComponent } from "expo";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from "@expo-google-fonts/space-grotesk";
import {
  Fraunces_600SemiBold,
  Fraunces_700Bold,
} from "@expo-google-fonts/fraunces";
import {
  SpaceMono_400Regular,
  SpaceMono_700Bold,
} from "@expo-google-fonts/space-mono";
import { ThemeProvider } from "./utils/theme";
import { I18nProvider } from "./i18n/I18nProvider";
import { OfflineQueueProvider } from "./context/OfflineQueueProvider";
import { FirestoreService } from "./services/firestoreService";
import AppNavigation from "./navigation/AppNavigation";

// Fontlar yüklenene kadar splash ekranını açık tut
SplashScreen.preventAutoHideAsync().catch(() => {});

function App() {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    SpaceMono_400Regular,
    SpaceMono_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded]);

  // 🏢 Oturum açan / açık olan her kullanıcı için: users/{uid} profilini garanti et
  // + mevcut kart/klasörleri orgId/ownerId ile backfill et (tek seferlik, idempotent)
  useEffect(() => {
    const unsub = onAuthStateChanged(getAuth(), (user) => {
      if (user) {
        FirestoreService.ensureUserProfile(user);
        FirestoreService.backfillOrgFields(user.uid);
      }
    });
    return () => unsub();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <ThemeProvider>
          <I18nProvider>
            <OfflineQueueProvider>
              <AppNavigation />
            </OfflineQueueProvider>
          </I18nProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

registerRootComponent(App);
export default App;
