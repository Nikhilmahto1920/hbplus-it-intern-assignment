import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { radii, spacing } from '../theme';

interface BadgeProps {
  role: 'admin' | 'user' | string | null;
  size?: 'sm' | 'md';
}

export function Badge({ role, size = 'md' }: BadgeProps) {
  const { colors } = useTheme();
  const isAdmin = role === 'admin';
  const isSm = size === 'sm';

  const badgeBg = isAdmin ? colors.adminBadgeBg : colors.userBadgeBg;
  const badgeBorder = isAdmin ? colors.adminBadgeBorder : colors.userBadgeBorder;
  const badgeText = isAdmin ? colors.adminBadgeText : colors.userBadgeText;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: badgeBg,
          borderColor: badgeBorder,
        },
        isSm && styles.badgeSm,
      ]}
    >
      <Ionicons
        name={isAdmin ? 'shield-checkmark' : 'person'}
        size={14}
        color={badgeText}
        style={styles.icon}
      />
      <Text
        style={[
          styles.text,
          { color: badgeText },
        ]}
      >
        {isAdmin ? 'Admin' : 'User'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
  },
  icon: {
    marginRight: 5,
  },
  text: {
    fontSize: 13, // minimum 13px rule
    fontWeight: '600', // heading/badge weight 600
    letterSpacing: 0.3,
  },
});
