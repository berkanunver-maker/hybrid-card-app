import React, { useState } from "react";
import { View, TextInput, Text, StyleSheet } from "react-native";
import { colors } from "../utils/colors";

export default function EditableField({
  label = "Alan",
  value = "",
  placeholder = "",
  onChangeText,
}) {
  const [text, setText] = useState(value);

  const handleChange = (val) => {
    setText(val);
    onChangeText && onChangeText(val);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={text}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        onChangeText={handleChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surface,
  },
});
