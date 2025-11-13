import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

export default function SplashScreen() {
  const navigation = useNavigation();
  const [status, setStatus] = useState("Yükleniyor...");

  useEffect(() => {
    autoLogin();
  }, []);

  const autoLogin = async () => {
    const auth = getAuth();
    
    try {
      setStatus("Test kullanıcısı ile giriş yapılıyor...");
      
      // 🔧 Otomatik test girişi
      await signInWithEmailAndPassword(auth, "test@test.com", "test123");
      
      console.log("✅ Otomatik test girişi başarılı");
      setStatus("Giriş başarılı! Yönlendiriliyor...");
      
      // ✅ Başarılı giriş sonrası Main (TabNavigator) ekranına git
      setTimeout(() => {
        navigation.replace("Main"); // ✅ "HomeTabs" yerine "Main" kullanıyoruz
      }, 500);
      
    } catch (error) {
      console.error("❌ Otomatik giriş hatası:", error);
      
      // Eğer kullanıcı yoksa veya hata varsa Login'e yönlendir
      setStatus("Giriş gerekli...");
      setTimeout(() => {
        navigation.replace("Login");
      }, 1000);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hybrid Card App</Text>
      <ActivityIndicator color="#7B61FF" size="large" style={styles.loader} />
      <Text style={styles.subtitle}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { 
    color: "#fff", 
    fontSize: 24, 
    fontWeight: "600",
    marginBottom: 20,
  },
  loader: {
    marginVertical: 20,
  },
  subtitle: { 
    color: "#bbb", 
    marginTop: 10,
    fontSize: 14,
  },
});