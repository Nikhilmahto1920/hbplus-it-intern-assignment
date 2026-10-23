import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from './Avatar';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { radii, shadows, spacing } from '../theme';

interface AppHeaderProps {
  brandSubtitle?: string;
}

export function AppHeader({ brandSubtitle = 'PORTAL' }: AppHeaderProps) {
  const { user, logout } = useAuth();
  const { colors, mode, toggleTheme } = useTheme();
  const { width } = useWindowDimensions();
  const isMobile = width < 640;

  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.container}>
        {/* Left: Brand Logo */}
        <View style={styles.brandRow}>
          <View style={[styles.logoBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.logoText}>HB+</Text>
          </View>
          <View style={styles.brandMeta}>
            <Text style={[styles.brandTitle, { color: colors.text }]}>
              HB+ HEALTH
            </Text>
            <Text style={[styles.brandSubtitle, { color: colors.primary }]}>
              {brandSubtitle}
            </Text>
          </View>
        </View>

        {/* Right: Theme Toggle, Avatar + Name, Sign out button */}
        <View style={styles.rightRow}>
          {/* Light / Dark Mode Toggle */}
          <TouchableOpacity
            style={[
              styles.iconBtn,
              {
                backgroundColor: colors.surfaceSubtle,
                borderColor: colors.border,
              },
            ]}
            onPress={toggleTheme}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
          >
            <Ionicons
              name={mode === 'light' ? 'moon-outline' : 'sunny-outline'}
              size={18}
              color={mode === 'light' ? colors.textSecondary : colors.accentOrange}
            />
          </TouchableOpacity>

          {/* Avatar + User Name */}
          <View style={styles.userProfile}>
            <Avatar
              uri={user?.photoURL}
              name={user?.displayName}
              size={isMobile ? 32 : 36}
              fontSize={14}
            />
            {!isMobile && (
              <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
                {user?.displayName || 'User'}
              </Text>
            )}
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity
            style={[
              styles.logoutBtn,
              {
                backgroundColor: colors.surfaceSubtle,
                borderColor: colors.border,
              },
            ]}
            onPress={logout}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Sign out"
          >
            <Ionicons name="log-out-outline" size={17} color={colors.textSecondary} />
            {!isMobile && (
              <Text style={[styles.logoutText, { color: colors.textSecondary }]}>
                Sign out
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderBottomWidth: 1,
    ...shadows.subtle,
    zIndex: 10,
  },
  container: {
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm + 2,
  },
  logoText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  brandMeta: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 13, // minimum 13px rule
    fontWeight: '600',
    letterSpacing: 1,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  userName: {
    marginLeft: spacing.sm,
    fontSize: 14,
    fontWeight: '600',
    maxWidth: 140,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
});
