import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { AppHeader } from '../../src/components/AppHeader';
import { Avatar } from '../../src/components/Avatar';
import { Badge } from '../../src/components/Badge';
import { radii, shadows, spacing, typography } from '../../src/theme';

export default function DashboardScreen() {
  const { user, role } = useAuth();
  const { colors } = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const isWide = width >= 800;

  // Subtle fade-in animation on mount
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // Open external links in a new tab
  const openExternalUrl = (url: string) => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      Linking.openURL(url);
    }
  };

  // Time-based greeting ("Good morning, Nikhil")
  const getGreeting = () => {
    const hour = new Date().getHours();
    let timeOfDay = 'Good evening';
    if (hour < 12) {
      timeOfDay = 'Good morning';
    } else if (hour < 17) {
      timeOfDay = 'Good afternoon';
    }
    const firstName = user?.displayName?.trim()?.split(' ')[0] || 'Team Member';
    return `${timeOfDay}, ${firstName}`;
  };

  const formattedLastLogin = user?.metadata?.lastSignInTime
    ? new Date(user.metadata.lastSignInTime).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'Active Session';

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Shared AppHeader across Dashboard and Admin */}
      <AppHeader brandSubtitle="DASHBOARD" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Hero Welcome Card */}
          <View
            style={[
              styles.heroCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.borderLight,
              },
            ]}
          >
            <View style={styles.heroContentRow}>
              <View style={styles.avatarWrapper}>
                <Avatar
                  uri={user?.photoURL}
                  name={user?.displayName}
                  size={84}
                  fontSize={32}
                />
              </View>

              <View style={styles.heroTextCol}>
                <View style={styles.heroBadgeRow}>
                  <Badge role={role} />
                  <View style={styles.statusDot}>
                    <View style={styles.activeDot} />
                    <Text style={[styles.statusText, { color: colors.textSecondary }]}>
                      Verified Domain
                    </Text>
                  </View>
                </View>

                <Text style={[styles.heroGreeting, { color: colors.text }]}>
                  {getGreeting()}
                </Text>
                <Text style={[styles.heroEmail, { color: colors.textSecondary }]}>
                  {user?.email || '—'}
                </Text>
                <Text style={[styles.heroMotto, { color: colors.textMuted }]}>
                  Welcome to your HB+ Health & Wellness portal.
                </Text>
              </View>
            </View>
          </View>

          {/* Admin Banner (Admin only) */}
          {role === 'admin' && (
            <TouchableOpacity
              style={[styles.adminBanner, { backgroundColor: colors.primary }]}
              onPress={() => router.push('/(app)/admin')}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Open Admin Panel"
            >
              <View style={styles.adminBannerLeft}>
                <View style={styles.adminIconCircle}>
                  <Ionicons name="shield-half" size={24} color="#FFFFFF" />
                </View>
                <View style={styles.adminBannerText}>
                  <Text style={styles.adminBannerTitle}>
                    Administrative Control Panel
                  </Text>
                  <Text style={styles.adminBannerDesc}>
                    View registered users, inspect access logs, and manage roles.
                  </Text>
                </View>
              </View>
              <View style={styles.adminBannerBtn}>
                <Text style={styles.adminBannerBtnText}>Open Panel</Text>
                <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          )}

          {/* Quick Access Row with Two Cards */}
          <View style={styles.quickAccessSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Quick Access
            </Text>
            <View style={[styles.quickAccessRow, isWide && styles.quickAccessRowWide]}>
              {/* Card 1: Services */}
              <TouchableOpacity
                style={[
                  styles.quickCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.borderLight,
                  },
                ]}
                onPress={() => openExternalUrl('https://hbplus.fit/services')}
                activeOpacity={0.8}
                accessibilityRole="link"
                accessibilityLabel="Open HB+ Services in a new tab"
              >
                <View style={styles.quickCardTop}>
                  <View style={[styles.quickIconCircle, { backgroundColor: colors.primaryLight }]}>
                    <Ionicons name="sparkles-outline" size={22} color={colors.primary} />
                  </View>
                  <Ionicons name="open-outline" size={18} color={colors.textSecondary} />
                </View>
                <Text style={[styles.quickTitle, { color: colors.text }]}>
                  Services
                </Text>
                <Text style={[styles.quickDesc, { color: colors.textSecondary }]}>
                  Explore personalized training, nutrition coaching, and holistic wellness programs.
                </Text>
              </TouchableOpacity>

              {/* Card 2: Lifestyle Test */}
              <TouchableOpacity
                style={[
                  styles.quickCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.borderLight,
                  },
                ]}
                onPress={() => openExternalUrl('https://onboarding.hbplus.fit/')}
                activeOpacity={0.8}
                accessibilityRole="link"
                accessibilityLabel="Open Lifestyle Test in a new tab"
              >
                <View style={styles.quickCardTop}>
                  <View style={[styles.quickIconCircle, { backgroundColor: colors.accentOrangeLight }]}>
                    <Ionicons name="clipboard-outline" size={22} color={colors.accentOrange} />
                  </View>
                  <Ionicons name="open-outline" size={18} color={colors.textSecondary} />
                </View>
                <Text style={[styles.quickTitle, { color: colors.text }]}>
                  Lifestyle Test
                </Text>
                <Text style={[styles.quickDesc, { color: colors.textSecondary }]}>
                  Complete your comprehensive lifestyle evaluation and health baseline assessment.
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Info Cards Grid */}
          <View style={[styles.infoGrid, isWide && styles.infoGridWide]}>
            {/* Card 1: Account Information */}
            <View
              style={[
                styles.infoCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.borderLight,
                },
                isWide && styles.infoCardCol,
              ]}
            >
              <View style={styles.cardHeaderRow}>
                <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="person-outline" size={20} color={colors.primary} />
                </View>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  Account Details
                </Text>
              </View>

              <View style={styles.itemRow}>
                <Text style={[styles.itemLabel, { color: colors.textMuted }]}>
                  Full Name
                </Text>
                <Text style={[styles.itemValue, { color: colors.text }]}>
                  {user?.displayName || 'Not provided'}
                </Text>
              </View>

              <View style={styles.itemRow}>
                <Text style={[styles.itemLabel, { color: colors.textMuted }]}>
                  Email Address
                </Text>
                <Text
                  style={[styles.itemValue, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {user?.email || '—'}
                </Text>
              </View>

              <View style={styles.itemRow}>
                <Text style={[styles.itemLabel, { color: colors.textMuted }]}>
                  Identity Provider
                </Text>
                <Text style={[styles.itemValue, { color: colors.text }]}>
                  Google
                </Text>
              </View>
            </View>

            {/* Card 2: Role & Access */}
            <View
              style={[
                styles.infoCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.borderLight,
                },
                isWide && styles.infoCardCol,
              ]}
            >
              <View style={styles.cardHeaderRow}>
                <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="key-outline" size={20} color={colors.primary} />
                </View>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  Role & Access
                </Text>
              </View>

              <View style={styles.roleHeaderWrap}>
                <Badge role={role} size="md" />
              </View>

              <Text style={[styles.accessDescription, { color: colors.textSecondary }]}>
                {role === 'admin'
                  ? 'Administrator: Full visibility into the user directory, active sessions, and privilege governance.'
                  : 'Standard Member: Access to your personal dashboard and verified organization workspace.'}
              </Text>

              <View style={[styles.securityNote, { backgroundColor: colors.surfaceSubtle }]}>
                <Ionicons
                  name="lock-closed-outline"
                  size={15}
                  color={colors.textSecondary}
                />
                <Text style={[styles.securityNoteText, { color: colors.textSecondary }]}>
                  Role permissions are enforced via Firestore Security Rules.
                </Text>
              </View>
            </View>

            {/* Card 3: Session */}
            <View
              style={[
                styles.infoCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.borderLight,
                },
                isWide && styles.infoCardCol,
              ]}
            >
              <View style={styles.cardHeaderRow}>
                <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="time-outline" size={20} color={colors.primary} />
                </View>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  Session Security
                </Text>
              </View>

              <View style={styles.itemRow}>
                <Text style={[styles.itemLabel, { color: colors.textMuted }]}>
                  Current Status
                </Text>
                <View
                  style={[
                    styles.securePill,
                    {
                      backgroundColor: colors.successBg,
                      borderColor: colors.successBorder,
                    },
                  ]}
                >
                  <Text style={[styles.securePillText, { color: colors.successText }]}>
                    Authenticated
                  </Text>
                </View>
              </View>

              <View style={styles.itemRow}>
                <Text style={[styles.itemLabel, { color: colors.textMuted }]}>
                  Last Login
                </Text>
                <Text style={[styles.itemValue, { color: colors.text }]}>
                  {formattedLastLogin}
                </Text>
              </View>

              <View style={styles.itemRow}>
                <Text style={[styles.itemLabel, { color: colors.textMuted }]}>
                  Session
                </Text>
                <Text style={[styles.itemValue, { color: colors.text }]}>
                  Session: persisted via Firebase Auth
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
  },
  container: {
    width: '100%',
    maxWidth: 1040,
    alignSelf: 'center',
  },

  // Hero Card
  heroCard: {
    borderRadius: radii.card,
    padding: spacing.xxxl,
    borderWidth: 1,
    marginBottom: spacing.xl,
    ...shadows.card,
  },
  heroContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  avatarWrapper: {
    marginRight: spacing.xxl,
    marginBottom: spacing.md,
  },
  heroTextCol: {
    flex: 1,
    minWidth: 240,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  statusDot: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  statusText: {
    fontSize: 13, // minimum 13px rule
    fontWeight: '600',
  },
  heroGreeting: {
    ...typography.h1,
    fontSize: 26,
    fontWeight: '600', // heading weight 600
    marginBottom: 4,
  },
  heroEmail: {
    fontSize: 14,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  heroMotto: {
    ...typography.body,
    fontSize: 14,
  },

  // Admin Banner
  adminBanner: {
    borderRadius: radii.card,
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    flexWrap: 'wrap',
    gap: spacing.md,
    ...shadows.hover,
  },
  adminBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 260,
  },
  adminIconCircle: {
    width: 46,
    height: 46,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  adminBannerText: {
    flex: 1,
  },
  adminBannerTitle: {
    fontSize: 17,
    fontWeight: '600', // heading weight 600
    color: '#FFFFFF',
    marginBottom: 2,
  },
  adminBannerDesc: {
    fontSize: 13, // minimum 13px
    color: '#CCFBF1',
  },
  adminBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
    gap: 6,
  },
  adminBannerBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Quick Access Section
  quickAccessSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h2,
    fontSize: 20,
    fontWeight: '600', // heading weight 600
    marginBottom: spacing.md,
  },
  quickAccessRow: {
    flexDirection: 'column',
    gap: spacing.lg,
  },
  quickAccessRowWide: {
    flexDirection: 'row',
  },
  quickCard: {
    flex: 1,
    borderRadius: radii.card,
    padding: spacing.xl,
    borderWidth: 1,
    ...shadows.card,
  },
  quickCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  quickIconCircle: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickTitle: {
    fontSize: 17,
    fontWeight: '600', // heading weight 600
    marginBottom: 4,
  },
  quickDesc: {
    fontSize: 13, // minimum 13px
    lineHeight: 19,
  },

  // Info Grid
  infoGrid: {
    flexDirection: 'column',
    gap: spacing.xl,
  },
  infoGridWide: {
    flexDirection: 'row',
  },
  infoCard: {
    flex: 1,
    borderRadius: radii.card,
    padding: spacing.xxl,
    borderWidth: 1,
    ...shadows.card,
  },
  infoCardCol: {
    minWidth: 260,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  cardTitle: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: '600', // heading weight 600
  },
  itemRow: {
    marginBottom: spacing.md,
  },
  itemLabel: {
    fontSize: 13, // minimum 13px (raised from 12px)
    fontWeight: '600', // WCAG AA label weight
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  roleHeaderWrap: {
    marginBottom: spacing.md,
  },
  accessDescription: {
    ...typography.body,
    fontSize: 13, // minimum 13px
    lineHeight: 19,
    marginBottom: spacing.lg,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radii.sm,
    gap: 8,
  },
  securityNoteText: {
    fontSize: 13, // minimum 13px (raised from 11px)
    flex: 1,
    lineHeight: 18,
  },
  securePill: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.pill,
  },
  securePillText: {
    fontSize: 13, // minimum 13px
    fontWeight: '600',
  },
});
