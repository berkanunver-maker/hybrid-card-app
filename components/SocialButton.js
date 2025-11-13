// components/SocialButton.js
import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { Ionicons, FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";

export default function SocialButton({
  iconSet = "Ionicons",
  iconName,
  label,
  color = "#fff",
  onPress,
}) {
  const renderIcon = () => {
    switch (iconSet) {
      case "FontAwesome":
        return <FontAwesome name={iconName} size={20} color={color} />;
      case "MaterialCommunityIcons":
        return <MaterialCommunityIcons name={iconName} size={22} color={color} />;
      default:
        return <Ionicons name={iconName} size={22} color={color} />;
    }
  };

  return (
    <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={onPress}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>{renderIcon()}</View>
        <Text style={styles.label}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#1E1E1E",
    borderColor: "#333",
    borderWidth: 1,
    borderRadius: 30,
    paddingVertical: 12,
    marginVertical: 6,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    marginRight: 10,
  },
  label: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
