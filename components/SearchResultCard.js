// components/SearchResultCard.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';

export default function SearchResultCard({ card, onPress }) {
  const fields = card.fields || card;
  const name = fields.name || card.name || 'İsimsiz';
  const company = fields.company || card.company || 'Şirket bilgisi yok';
  const title = fields.title || card.title || '';
  const service = fields.service || card.service || '';
  const isFavorite = card.isFavorite || false;
  const qaScore = card.qaScore || 0;

  // QA Score rengini belirle
  const getQAColor = (score) => {
    if (score >= 80) return colors.success;
    if (score >= 60) return colors.warning;
    return colors.error;
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="person" size={24} color={colors.primary} />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          {isFavorite && (
            <Ionicons name="star" size={16} color="#FFD700" style={styles.favoriteIcon} />
          )}
        </View>

        <Text style={styles.company} numberOfLines={1}>
          🏢 {company}
        </Text>

        {title && (
          <Text style={styles.detail} numberOfLines={1}>
            💼 {title}
          </Text>
        )}

        {service && (
          <Text style={styles.detail} numberOfLines={1}>
            🛠️ {service}
          </Text>
        )}

        {qaScore > 0 && (
          <View style={styles.qaContainer}>
            <Text style={[styles.qaScore, { color: getQAColor(qaScore) }]}>
              QA: {qaScore}%
            </Text>
          </View>
        )}
      </View>

      <Ionicons 
        name="chevron-forward" 
        size={20} 
        color={colors.textSecondary} 
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBackground,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  favoriteIcon: {
    marginLeft: 8,
  },
  company: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  detail: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 2,
  },
  qaContainer: {
    marginTop: 4,
  },
  qaScore: {
    fontSize: 11,
    fontWeight: '600',
  },
});