import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Icon } from "../components/ui";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useTheme } from "../utils/theme";

export default function SplashScreen() {
  const navigation = useNavigation();
  const { colors, radius } = useTheme();

  useEffect(() => {
    let unsubscribe;
    (async () => {
      // İlk açılış → onboarding
      try {
        const seen = await AsyncStorage.getItem("onboarding_seen");
        if (!seen) {
          navigation.replace("Onboarding");
          return;
        }
      } catch (e) {
        // sessiz geç
      }
      // Oturum kontrolü
      unsubscribe = onAuthStateChanged(getAuth(), (user) => {
        navigation.replace(user ? "Main" : "Login");
      });
    })();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View
        style={{
          width: 88,
          height: 88,
          borderRadius: radius.pill,
          backgroundColor: colors.primaryMuted,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 28,
        }}
      >
        <Icon name="scan-outline" size={40} color={colors.primary} />
      </View>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}
