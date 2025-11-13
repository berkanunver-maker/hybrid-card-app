import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native"; // 🔹 navigation erişimi
import { colors } from "../utils/colors";

export default function Header({
  title = "",
  onBackPress,       // StackNavigator'dan gelirse öncelikli
  rightIcon,
  onRightPress,
  style,
  textStyle,
}) {
  const navigation = useNavigation();
  const canGoBack = navigation?.canGoBack?.() ?? false; // 🔹 korumalı kontrol

  const handleBack = () => {
    if (onBackPress) {
      onBackPress(); // dışarıdan özel fonksiyon geldiyse onu çalıştır
    } else if (canGoBack) {
      navigation.goBack(); // aksi halde otomatik geri git
    }
  };

  return (
    <View style={[styles.container, style]}>
      {/* 🔹 Geri Butonu (sadece gerekiyorsa göster) */}
      {canGoBack || onBackPress ? (
        <TouchableOpacity style={styles.iconButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={colors.white} />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconPlaceholder} />
      )}

      {/* 🔹 Başlık */}
      <Text style={[styles.title, textStyle]} numberOfLines={1}>
        {title}
      </Text>

      {/* 🔹 Sağ İkon (isteğe bağlı) */}
      {rightIcon ? (
        <TouchableOpacity style={styles.iconButton} onPress={onRightPress}>
          <Ionicons name={rightIcon} size={22} color={colors.white} />
        </TouchableOpacity>
      ) : (
        <View style={styles.iconPlaceholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  iconPlaceholder: {
    width: 40,
    height: 40,
  },
  title: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.3,
    textAlign: "center",
    flex: 1,
  },
});
