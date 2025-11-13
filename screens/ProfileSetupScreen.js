import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function ProfileSetupScreen() {
  const navigation = useNavigation();

  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");

  const handleFinish = () => {
    console.log("Profil:", { fullName, company, jobTitle });
    navigation.replace("Main"); // ✅ replace: geri dönmeyi engeller
  };

  const handleSkip = () => {
    navigation.replace("Main");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Complete Your Digital Business Card</Text>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipButton}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name (required)"
          placeholderTextColor="#666"
          value={fullName}
          onChangeText={setFullName}
          autoCapitalize="words"
        />

        <Text style={styles.label}>Company</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your company (required)"
          placeholderTextColor="#666"
          value={company}
          onChangeText={setCompany}
          autoCapitalize="words"
        />

        <Text style={styles.label}>Job Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your job title (required)"
          placeholderTextColor="#666"
          value={jobTitle}
          onChangeText={setJobTitle}
          autoCapitalize="words"
        />

        <TouchableOpacity
          style={[
            styles.button,
            (!fullName || !company || !jobTitle) && styles.buttonDisabled,
          ]}
          onPress={handleFinish}
          disabled={!fullName || !company || !jobTitle}
        >
          <Text style={styles.buttonText}>Finish</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  skipButton: {
    color: "#7B61FF",
    fontSize: 16,
    fontWeight: "500",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  label: {
    color: "#999",
    fontSize: 14,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 16,
    color: "#fff",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#333",
  },
  button: {
    backgroundColor: "#7B61FF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 32,
  },
  buttonDisabled: {
    backgroundColor: "#2A2A2A",
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
