import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Link, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../src/context/ThemeContext';
import { useAuth } from '../src/context/AuthContext';
import { radii, shadows, spacing, typography } from '../src/theme';

export default function NotFoundScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();

  const destination = user ? '/(app)/dashboard' : '/login';
  const buttonLabel = user ? 'Return to Dashboard' : 'Return to Login';

  return (
    <>
      <Stack.Screen options={{ title: 'Oops! Page Not Found', headerShown: false }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
          <View style={[styles.iconWrap, { backgroundColor: colors.surfaceSubtle }]}>
            <Ionicons name="compass-outline" size={48} color={colors.primary} />
          </View>

          <Text style={[styles.code, { color: colors.primary }]}>404</Text>
          <Text style={[styles.title, { color: colors.text }]}>Page Not Found</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            The screen or link you were trying to access does not exist or has been moved.
          </Text>

          <Link href={destination as any} asChild>
            <TouchableOpacity
              style={[styles.btn, { backgroundColor: colors.primary }]}
              activeOpacity={0.85}
            >
              <Ionicons name="home-outline" size={18} color="#FFFFFF" />
              <Text style={styles.btnText}>{buttonLabel}</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    maxWidth: 440,
    width: '100%',
    borderRadius: radii.card,
    padding: spacing.xxxl,
    alignItems: 'center',
    borderWidth: 1,
    ...shadows.card,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  code: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 4,
  },
  title: {
    ...typography.h1,
    fontSize: 24,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xxl,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.xxl,
    borderRadius: radii.md,
    gap: 8,
    width: '100%',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
