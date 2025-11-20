// components/SearchBar.js
import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors } from '../utils/colors';

export default function SearchBar({
  value,
  onChangeText,
  onClear,
  placeholder,
  autoFocus = true,
}) {
  const { t } = useTranslation();
  const displayPlaceholder = placeholder || t('components.searchBar.placeholder');
  return (
    <View style={styles.container}>
      <Ionicons 
        name="search" 
        size={20} 
        color={colors.textSecondary} 
        style={styles.searchIcon} 
      />
      
      <TextInput
        style={styles.input}
        placeholder={displayPlaceholder}
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      
      {value.length > 0 && (
        <TouchableOpacity onPress={onClear} style={styles.clearButton}>
          <Ionicons 
            name="close-circle" 
            size={20} 
            color={colors.textSecondary} 
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginVertical: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
});