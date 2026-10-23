import React from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { radii, shadows, spacing } from '../theme';

interface GoogleButtonProps {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

const GOOGLE_LOGO_URI =
  'https://developers.google.com/identity/images/g-logo.png';

export function GoogleButton({
  onPress,
  loading,
  disabled,
}: GoogleButtonProps) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        isDisabled && {
          opacity: 0.7,
          backgroundColor: colors.surfaceSubtle,
          borderColor: colors.borderLight,
        },
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel="Sign in with Google"
    >
      {loading ? (
        <View style={styles.contentRow}>
          <ActivityIndicator
            size="small"
            color={colors.primary}
            style={styles.spinner}
          />
          <Text style={[styles.loadingLabel, { color: colors.primary }]}>
            Signing in...
          </Text>
        </View>
      ) : (
        <View style={styles.contentRow}>
          <View style={styles.iconWrapper}>
            <Image
              source={{ uri: GOOGLE_LOGO_URI }}
              style={styles.icon}
              resizeMode="contain"
            />
          </View>
          <Text style={[styles.label, { color: colors.text }]}>
            Continue with Google
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 1.5,
    borderRadius: radii.md,
    paddingVertical: 14,
    paddingHorizontal: spacing.xxl,
    width: '100%',
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.card,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 22,
    height: 22,
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 20,
    height: 20,
  },
  spinner: {
    marginRight: spacing.md,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  loadingLabel: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
