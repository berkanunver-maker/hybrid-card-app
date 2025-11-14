import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function SplashScreen() {
  const navigation = useNavigation();
  const [status, setStatus] = useState("Yükleniyor...");

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const auth = getAuth();

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        setStatus("Giriş mevcut! Yönlendiriliyor...");
        setTimeout(() => {
          navigation.replace("Main");
        }, 500);
      } else {
        // No user is signed in
        setStatus("Giriş gerekli...");
        setTimeout(() => {
          navigation.replace("Login");
        }, 800);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
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