import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { GoogleButton } from '../src/components/GoogleButton';
import { ErrorBanner } from '../src/components/ErrorBanner';
import { radii, shadows, spacing, typography } from '../src/theme';

export default function LoginScreen() {
  const { login, loading, error, clearError } = useAuth();
  const { colors, mode, toggleTheme } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;

  const renderBrandPanel = () => (
    <LinearGradient
      colors={['#042F2E', '#0F766E', '#064E3B']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={isDesktop ? styles.desktopBrandPanel : styles.mobileBrandHeader}
    >
      {/* Decorative background glow circle */}
      <View style={styles.brandGlow} />

      <View style={styles.brandContent}>
        {/* Logo Badge */}
        <View style={styles.logoRow}>
          <View style={styles.brandLogoCircle}>
            <Text style={styles.brandLogoText}>HB+</Text>
          </View>
          <View>
            <Text style={styles.brandBadgeTitle}>HB+ HEALTH</Text>
            <Text style={styles.brandBadgeSubtitle}>SECURE ACCESS PORTAL</Text>
          </View>
        </View>

        {/* Tagline & Accurate Description */}
        <View style={styles.taglineBlock}>
          <Text style={styles.tagline}>
            Fitness, Nutrition, Mental health & Beyond
          </Text>
          <Text style={styles.taglineDesc}>
            The secure access portal for HB+ team members and administrators.
          </Text>
        </View>

        {/* Feature Bullets with Exact Requested Items */}
        {isDesktop && (
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <View style={styles.featureIconWrap}>
                <Ionicons name="fitness-outline" size={20} color="#5EEAD4" />
              </View>
              <View style={styles.featureTextWrap}>
                <Text style={styles.featureTitle}>Holistic Performance</Text>
                <Text style={styles.featureDesc}>
                  One workspace for fitness, nutrition and mental wellness teams.
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIconWrap}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#5EEAD4" />
              </View>
              <View style={styles.featureTextWrap}>
                <Text style={styles.featureTitle}>Domain-Restricted Access</Text>
                <Text style={styles.featureDesc}>
                  Entry restricted to verified organization emails.
                </Text>
              </View>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIconWrap}>
                <Ionicons name="trending-up-outline" size={20} color="#5EEAD4" />
              </View>
              <View style={styles.featureTextWrap}>
                <Text style={styles.featureTitle}>Centralized Governance</Text>
                <Text style={styles.featureDesc}>
                  Login activity tracking and role management for administrators.
                </Text>
              </View>
            </View>
          </View>
        )}

        {isDesktop && (
          <Text style={styles.brandFooter}>
            © HB+
          </Text>
        )}
      </View>
    </LinearGradient>
  );

  const renderLoginCard = () => (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.borderLight,
        },
      ]}
    >
      {/* Top right theme toggle */}
      <View style={styles.cardTopBar}>
        <TouchableOpacity
          style={[
            styles.themeToggleBtn,
            {
              backgroundColor: colors.surfaceSubtle,
              borderColor: colors.border,
            },
          ]}
          onPress={toggleTheme}
          activeOpacity={0.7}
          accessibilityLabel="Toggle Theme"
        >
          <Ionicons
            name={mode === 'light' ? 'moon-outline' : 'sunny-outline'}
            size={18}
            color={mode === 'light' ? colors.textSecondary : colors.accentOrange}
          />
        </TouchableOpacity>
      </View>

      {/* Mobile-only logo icon above title */}
      {!isDesktop && (
        <View style={[styles.mobileCardLogo, { backgroundColor: colors.primary }]}>
          <Text style={styles.mobileCardLogoText}>HB+</Text>
        </View>
      )}

      {/* Card Header */}
      <View style={styles.cardHeader}>
        <Text style={[styles.welcomeTitle, { color: colors.text }]}>
          Sign in to HB+
        </Text>
        <Text style={[styles.welcomeSubtitle, { color: colors.textSecondary }]}>
          Use your official company Google account to access your dashboard.
        </Text>
      </View>

      {/* Error Banner */}
      <ErrorBanner message={error} onDismiss={clearError} />

      {/* Google Button */}
      <GoogleButton onPress={login} loading={loading} />

      {/* Lock note */}
      <View style={styles.lockNoteContainer}>
        <Ionicons name="lock-closed" size={14} color={colors.textSecondary} />
        <Text style={[styles.lockNoteText, { color: colors.textSecondary }]}>
          Only company accounts can sign in
        </Text>
      </View>

      {/* Security reassurance */}
      <View style={styles.cardFooterDivider}>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        <Text style={[styles.dividerText, { color: colors.textMuted }]}>
          SECURE WORKSPACE
        </Text>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
      </View>

      <Text style={[styles.helpText, { color: colors.textMuted }]}>
        Authorized email domains are verified upon sign-in. External accounts
        are automatically denied access.
      </Text>
    </View>
  );

  if (isDesktop) {
    return (
      <View style={[styles.desktopContainer, { backgroundColor: colors.background }]}>
        {renderBrandPanel()}
        <View style={[styles.desktopCardArea, { backgroundColor: colors.background }]}>
          {renderLoginCard()}
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.mobileContainer, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.mobileScrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {renderBrandPanel()}
        <View style={styles.mobileCardWrapper}>
          {renderLoginCard()}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // Desktop Split Layout
  desktopContainer: {
    flex: 1,
    flexDirection: 'row',
    minHeight: '100%',
  },
  desktopBrandPanel: {
    flex: 1.1,
    padding: spacing.huge,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  brandGlow: {
    position: 'absolute',
    top: -120,
    right: -120,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: 'rgba(94, 234, 212, 0.08)',
  },
  brandContent: {
    maxWidth: 520,
    alignSelf: 'center',
    width: '100%',
    zIndex: 2,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  brandLogoCircle: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  brandLogoText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 1,
  },
  brandBadgeTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  brandBadgeSubtitle: {
    color: '#99F6E4',
    fontSize: 13, // minimum 13px
    fontWeight: '600',
    letterSpacing: 1.5,
  },
  taglineBlock: {
    marginBottom: spacing.xxxl,
  },
  tagline: {
    fontSize: 32,
    fontWeight: '600', // heading weight 600
    color: '#FFFFFF',
    lineHeight: 40,
    marginBottom: spacing.md,
    letterSpacing: -0.5,
  },
  taglineDesc: {
    fontSize: 15,
    color: '#CCFBF1',
    lineHeight: 22,
    fontWeight: '400',
  },
  featureList: {
    marginVertical: spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  featureIconWrap: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    marginTop: 2,
  },
  featureTextWrap: {
    flex: 1,
  },
  featureTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600', // heading weight 600
    marginBottom: 2,
  },
  featureDesc: {
    color: '#99F6E4',
    fontSize: 13, // minimum 13px
    lineHeight: 18,
  },
  brandFooter: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 13, // minimum 13px
    fontWeight: '500',
    marginTop: spacing.xxxl,
  },

  // Desktop Right Column
  desktopCardArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxxl,
  },

  // Mobile Single Column Layout
  mobileContainer: {
    flex: 1,
  },
  mobileScrollContent: {
    flexGrow: 1,
  },
  mobileBrandHeader: {
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    borderBottomLeftRadius: radii.xl,
    borderBottomRightRadius: radii.xl,
  },
  mobileCardWrapper: {
    padding: spacing.lg,
    marginTop: -spacing.xl,
    alignItems: 'center',
  },
  mobileCardLogo: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  mobileCardLogoText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },

  // Universal Login Card
  card: {
    width: '100%',
    maxWidth: 440,
    borderRadius: radii.card,
    padding: spacing.xxxl,
    alignItems: 'center',
    borderWidth: 1,
    position: 'relative',
    ...shadows.card,
  },
  cardTopBar: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: spacing.sm,
  },
  themeToggleBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  welcomeTitle: {
    ...typography.h1,
    fontSize: 26,
    fontWeight: '600', // heading weight 600
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  welcomeSubtitle: {
    ...typography.body,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  lockNoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  lockNoteText: {
    fontSize: 13, // minimum 13px
    marginLeft: 6,
    fontWeight: '500',
  },
  cardFooterDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 13, // minimum 13px (raised from 11px)
    fontWeight: '600', // WCAG AA label weight
    marginHorizontal: spacing.md,
    letterSpacing: 1,
  },
  helpText: {
    fontSize: 13, // minimum 13px (raised from 12px)
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 340,
  },
});
