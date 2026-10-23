import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography } from '../theme';

interface LoaderProps {
  message?: string;
}

export function Loader({ message }: LoaderProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.logoBadge, { backgroundColor: colors.primary }]}>
        <Text style={styles.logoText}>HB+</Text>
      </View>
      <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />
      {message ? (
        <Text style={[styles.message, { color: colors.textSecondary }]}>
          {message}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
  },
  spinner: {
    marginVertical: spacing.xs,
  },
  message: {
    ...typography.bodySmall,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
