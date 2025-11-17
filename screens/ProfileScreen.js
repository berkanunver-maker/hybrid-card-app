// screens/ProfileScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { getAuth, signOut } from "firebase/auth";
import { FirestoreService } from "../services/firestoreService";
import { colors } from "../utils/colors";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const auth = getAuth();
  const user = auth.currentUser;

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const profile = await FirestoreService.getUserProfile(user.uid);
      setProfileData(profile);
    } catch (error) {
      console.error("❌ Profil yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Çıkış Yap",
      "Hesabınızdan çıkmak istediğinizden emin misiniz?",
      [
        { text: "İptal", style: "cancel" },
        {
          text: "Çıkış Yap",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut(auth);
              console.log("✅ Kullanıcı çıkış yaptı");
              // Navigation otomatik olarak Login ekranına yönlendirecek (onAuthStateChanged)
            } catch (error) {
              console.error("❌ Çıkış hatası:", error);
              Alert.alert("Hata", "Çıkış yapılamadı.");
            }
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    navigation.navigate("ProfileSetup");
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Profil yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil</Text>
      </View>

      {/* Profile Info */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={48} color={colors.primary} />
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>
            {profileData?.displayName || user?.displayName || "Kullanıcı"}
          </Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>

          {profileData?.company && (
            <View style={styles.infoRow}>
              <Ionicons name="business-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.infoText}>{profileData.company}</Text>
            </View>
          )}

          {profileData?.jobTitle && (
            <View style={styles.infoRow}>
              <Ionicons name="briefcase-outline" size={16} color={colors.textSecondary} />
              <Text style={styles.infoText}>{profileData.jobTitle}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
          <Ionicons name="pencil" size={20} color={colors.primary} />
          <Text style={styles.editButtonText}>Düzenle</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>AYARLAR</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => Alert.alert("Bildirim Ayarları", "Yakında!")}
        >
          <View style={styles.menuItemLeft}>
            <Ionicons name="notifications-outline" size={24} color={colors.textPrimary} />
            <Text style={styles.menuItemText}>Bildirim Ayarları</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => Alert.alert("Gizlilik", "Yakında!")}
        >
          <View style={styles.menuItemLeft}>
            <Ionicons name="shield-outline" size={24} color={colors.textPrimary} />
            <Text style={styles.menuItemText}>Gizlilik</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => Alert.alert("Yardım & Destek", "Yakında!")}
        >
          <View style={styles.menuItemLeft}>
            <Ionicons name="help-circle-outline" size={24} color={colors.textPrimary} />
            <Text style={styles.menuItemText}>Yardım & Destek</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => Alert.alert("Hakkında", "Hybrid Card App v1.0.0\n\nBusiness card digitization app powered by AI.")}
        >
          <View style={styles.menuItemLeft}>
            <Ionicons name="information-circle-outline" size={24} color={colors.textPrimary} />
            <Text style={styles.menuItemText}>Hakkında</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
        <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
      </TouchableOpacity>

      {/* App Version */}
      <Text style={styles.versionText}>Version 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: colors.textSecondary,
    marginTop: 16,
    fontSize: 14,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
  },
  profileCard: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(123, 97, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  profileInfo: {
    marginBottom: 16,
  },
  profileName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 4,
  },
  profileEmail: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  infoText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginLeft: 8,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(123, 97, 255, 0.1)",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  editButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  menuSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 12,
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemText: {
    color: colors.textPrimary,
    fontSize: 16,
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#FF3B30",
  },
  logoutButtonText: {
    color: "#FF3B30",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  versionText: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: "center",
    marginBottom: 32,
  },
});
