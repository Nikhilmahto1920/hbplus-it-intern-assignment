import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useToast } from '../../src/context/ToastContext';
import {
  fetchAllUsers,
  fetchRecentLogins,
  updateUserRole,
  type LoginDoc,
  type UserDoc,
} from '../../src/services/userService';
import { AppHeader } from '../../src/components/AppHeader';
import { ErrorBanner } from '../../src/components/ErrorBanner';
import { Avatar } from '../../src/components/Avatar';
import { Badge } from '../../src/components/Badge';
import { Skeleton } from '../../src/components/Skeleton';
import { radii, shadows, spacing, typography } from '../../src/theme';
import type { Timestamp } from 'firebase/firestore';

interface RoleModalTarget {
  user: UserDoc;
  targetRole: 'user' | 'admin';
}

export default function AdminScreen() {
  const { user: currentUser, role } = useAuth();
  const { colors } = useTheme();
  const { showToast } = useToast();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [users, setUsers] = useState<UserDoc[]>([]);
  const [recentLogins, setRecentLogins] = useState<LoginDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');

  // Role Change Confirmation Modal State
  const [modalTarget, setModalTarget] = useState<RoleModalTarget | null>(null);
  const [updatingRole, setUpdatingRole] = useState(false);

  const isWide = width >= 768;

  // Guard: non-admins get redirected
  useEffect(() => {
    if (role !== null && role !== 'admin') {
      router.replace('/(app)/dashboard');
    }
  }, [role, router]);

  // Fetch all users and recent logins
  const loadData = useCallback(async () => {
    if (role !== 'admin') return;
    setLoading(true);
    setActivityLoading(true);
    setError(null);

    try {
      const [usersData, loginsData] = await Promise.all([
        fetchAllUsers(),
        fetchRecentLogins(),
      ]);
      setUsers(usersData);
      setRecentLogins(loginsData);
    } catch (_err) {
      setError('Failed to load administrative data. You may lack sufficient permissions.');
    } finally {
      setLoading(false);
      setActivityLoading(false);
    }
  }, [role]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Execute role change
  const handleConfirmRoleChange = async () => {
    if (!modalTarget) return;
    const { user: targetUser, targetRole } = modalTarget;

    // Safety guard: Admins cannot change their own role
    if (targetUser.uid === currentUser?.uid) {
      showToast('You cannot change your own administrative role.', 'error');
      setModalTarget(null);
      return;
    }

    setUpdatingRole(true);
    try {
      await updateUserRole(targetUser.uid, targetRole);

      // Update state locally
      setUsers((prev) =>
        prev.map((u) => (u.uid === targetUser.uid ? { ...u, role: targetRole } : u))
      );

      showToast(
        `Updated role for ${targetUser.name || targetUser.email} to ${targetRole}.`,
        'success'
      );
      setModalTarget(null);
    } catch (_err) {
      showToast('Failed to update role. Please verify your admin privileges.', 'error');
    } finally {
      setUpdatingRole(false);
    }
  };

  // Derived stats
  const totalCount = users.length;
  const adminCount = users.filter((u) => u.role === 'admin').length;
  const userCount = users.filter((u) => u.role !== 'admin').length;

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesRole =
      roleFilter === 'all' ||
      (roleFilter === 'admin' ? u.role === 'admin' : u.role !== 'admin');
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q));
    return matchesRole && matchesSearch;
  });

  if (role !== 'admin') {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Shared AppHeader across Dashboard and Admin */}
      <AppHeader brandSubtitle="ADMIN PANEL" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Back to dashboard link under the header */}
          <View style={styles.breadcrumbBar}>
            <TouchableOpacity
              onPress={() => router.push('/(app)/dashboard')}
              style={[
                styles.backBtn,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.borderLight,
                },
              ]}
              activeOpacity={0.7}
              accessibilityRole="link"
              accessibilityLabel="Back to dashboard"
            >
              <Ionicons name="arrow-back" size={16} color={colors.primary} />
              <Text style={[styles.backText, { color: colors.primary }]}>
                Back to dashboard
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={loadData}
              style={[
                styles.refreshBtn,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              activeOpacity={0.7}
              disabled={loading}
              accessibilityLabel="Refresh data"
            >
              <Ionicons
                name="refresh"
                size={16}
                color={loading ? colors.textMuted : colors.primary}
              />
              <Text style={[styles.refreshText, { color: colors.primary }]}>
                Refresh
              </Text>
            </TouchableOpacity>
          </View>

          {/* Title Area */}
          <View style={styles.titleArea}>
            <Text style={[styles.title, { color: colors.text }]}>Admin Panel</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Workspace directory, privileges, and authentication audit logs
            </Text>
          </View>

          {/* Error state with Retry button */}
          {error && (
            <View style={styles.errorCard}>
              <ErrorBanner message={error} onDismiss={() => setError(null)} />
              <TouchableOpacity
                style={[styles.retryBtn, { backgroundColor: colors.primary }]}
                onPress={loadData}
                activeOpacity={0.8}
              >
                <Ionicons name="reload" size={16} color="#FFFFFF" />
                <Text style={styles.retryText}>Retry Loading Data</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Stat Cards */}
          <View style={styles.statsRow}>
            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.borderLight,
                },
              ]}
            >
              <View style={[styles.statIconWrap, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="people" size={20} color={colors.primary} />
              </View>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {loading ? '—' : totalCount}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Total Users
              </Text>
            </View>

            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.borderLight,
                },
              ]}
            >
              <View style={[styles.statIconWrap, { backgroundColor: colors.adminBadgeBg }]}>
                <Ionicons name="shield-checkmark" size={20} color={colors.adminBadgeText} />
              </View>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {loading ? '—' : adminCount}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Admins
              </Text>
            </View>

            <View
              style={[
                styles.statCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.borderLight,
                },
              ]}
            >
              <View style={[styles.statIconWrap, { backgroundColor: colors.userBadgeBg }]}>
                <Ionicons name="person" size={20} color={colors.userBadgeText} />
              </View>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {loading ? '—' : userCount}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Regular Users
              </Text>
            </View>
          </View>

          {/* Recent Activity Section */}
          <View
            style={[
              styles.activityCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.borderLight,
              },
            ]}
          >
            <View style={styles.activityHeader}>
              <View style={styles.activityTitleRow}>
                <View style={[styles.activityIconCircle, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="pulse-outline" size={18} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.activityTitle, { color: colors.text }]}>
                    Recent Login Activity
                  </Text>
                  {/* Exact copy requested: Latest authenticated sessions */}
                  <Text style={[styles.activitySubtitle, { color: colors.textSecondary }]}>
                    Latest authenticated sessions
                  </Text>
                </View>
              </View>
            </View>

            {activityLoading ? (
              <View style={styles.activitySkeletonWrap}>
                {[1, 2, 3].map((i) => (
                  <View key={i} style={styles.activitySkeletonRow}>
                    <Skeleton width={32} height={32} borderRadius={16} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Skeleton width="40%" height={14} />
                      <Skeleton width="60%" height={12} style={{ marginTop: 4 }} />
                    </View>
                    <Skeleton width={60} height={20} borderRadius={radii.sm} />
                  </View>
                ))}
              </View>
            ) : recentLogins.length === 0 ? (
              <View style={styles.activityEmpty}>
                <Text style={[styles.activityEmptyText, { color: colors.textSecondary }]}>
                  No recent login activity recorded yet.
                </Text>
              </View>
            ) : (
              <View style={styles.activityList}>
                {recentLogins.map((log, index) => {
                  const isLast = index === recentLogins.length - 1;
                  const platformIcon =
                    log.platform === 'ios'
                      ? 'logo-apple'
                      : log.platform === 'android'
                      ? 'logo-android'
                      : 'globe-outline';

                  return (
                    <View
                      key={log.id || `${log.uid}-${index}`}
                      style={[
                        styles.activityRow,
                        { borderBottomColor: colors.borderLight },
                        isLast && { borderBottomWidth: 0 },
                      ]}
                    >
                      <View style={styles.activityRowLeft}>
                        <View style={[styles.platformBadge, { backgroundColor: colors.surfaceSubtle }]}>
                          <Ionicons name={platformIcon as any} size={15} color={colors.primary} />
                        </View>
                        <View style={styles.activityMeta}>
                          <Text style={[styles.activityUser, { color: colors.text }]} numberOfLines={1}>
                            {log.name || log.email || 'Authenticated User'}
                          </Text>
                          <Text style={[styles.activityEmail, { color: colors.textSecondary }]} numberOfLines={1}>
                            {log.email || '—'}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.activityRowRight}>
                        <Text style={[styles.activityTime, { color: colors.textSecondary }]}>
                          {formatTimestamp(log.at as Timestamp | null)}
                        </Text>
                        <View style={[styles.platformPill, { backgroundColor: colors.surfaceSubtle, borderColor: colors.border }]}>
                          <Text style={[styles.platformText, { color: colors.textSecondary }]}>
                            {log.platform.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          {/* Controls: Search & Filter Chips */}
          <View
            style={[
              styles.controlsCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.borderLight,
              },
            ]}
          >
            {/* Search Box */}
            <View
              style={[
                styles.searchBox,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons
                name="search"
                size={18}
                color={colors.textSecondary}
                style={styles.searchIcon}
              />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search users by name or email..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                clearButtonMode="while-editing"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.clearSearchBtn}
                >
                  <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Role Filter Chips */}
            <View style={styles.filterChipsRow}>
              <TouchableOpacity
                style={[
                  styles.chip,
                  {
                    backgroundColor: colors.surfaceSubtle,
                    borderColor: colors.border,
                  },
                  roleFilter === 'all' && {
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => setRoleFilter('all')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: colors.textSecondary },
                    roleFilter === 'all' && styles.chipTextActive,
                  ]}
                >
                  All ({totalCount})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.chip,
                  {
                    backgroundColor: colors.surfaceSubtle,
                    borderColor: colors.border,
                  },
                  roleFilter === 'admin' && {
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => setRoleFilter('admin')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: colors.textSecondary },
                    roleFilter === 'admin' && styles.chipTextActive,
                  ]}
                >
                  Admins ({adminCount})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.chip,
                  {
                    backgroundColor: colors.surfaceSubtle,
                    borderColor: colors.border,
                  },
                  roleFilter === 'user' && {
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => setRoleFilter('user')}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: colors.textSecondary },
                    roleFilter === 'user' && styles.chipTextActive,
                  ]}
                >
                  Users ({userCount})
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* User Directory Table Card */}
          <View
            style={[
              styles.tableCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.borderLight,
              },
            ]}
          >
            {/* Table Header on Desktop */}
            {isWide && !loading && filteredUsers.length > 0 && (
              <View
                style={[
                  styles.tableHeaderRow,
                  {
                    backgroundColor: colors.surfaceSubtle,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.colHeader, { flex: 2, color: colors.textSecondary }]}>
                  USER
                </Text>
                <Text style={[styles.colHeader, { flex: 2, color: colors.textSecondary }]}>
                  EMAIL
                </Text>
                <Text style={[styles.colHeader, { flex: 1, color: colors.textSecondary }]}>
                  ROLE
                </Text>
                <Text style={[styles.colHeader, { flex: 1.4, color: colors.textSecondary }]}>
                  LAST LOGIN
                </Text>
                <Text
                  style={[
                    styles.colHeader,
                    { flex: 1.6, textAlign: 'right', color: colors.textSecondary },
                  ]}
                >
                  ROLE ACTION
                </Text>
              </View>
            )}

            {/* Loading Skeletons */}
            {loading && (
              <View style={styles.skeletonContainer}>
                {[1, 2, 3, 4, 5].map((key) => (
                  <View key={key} style={styles.skeletonRow}>
                    <Skeleton width={40} height={40} borderRadius={20} />
                    <View style={styles.skeletonTextCol}>
                      <Skeleton width="45%" height={16} />
                      <Skeleton width="65%" height={13} style={{ marginTop: 6 }} />
                    </View>
                    <Skeleton width={70} height={24} borderRadius={radii.pill} />
                  </View>
                ))}
              </View>
            )}

            {/* Empty state for "no users match your search" in the admin table */}
            {!loading && filteredUsers.length === 0 && (
              <View style={styles.emptyState}>
                <View
                  style={[
                    styles.emptyIconCircle,
                    { backgroundColor: colors.surfaceSubtle },
                  ]}
                >
                  <Ionicons name="search-outline" size={32} color={colors.textSecondary} />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  {searchQuery.trim().length > 0
                    ? 'No users match your search'
                    : 'No users found'}
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  {searchQuery.trim().length > 0
                    ? `No users match "${searchQuery}" with the selected filter. Check the spelling or reset your search.`
                    : 'No users registered under this role filter.'}
                </Text>
                {(searchQuery.length > 0 || roleFilter !== 'all') && (
                  <TouchableOpacity
                    style={[
                      styles.clearFiltersBtn,
                      {
                        backgroundColor: colors.surfaceSubtle,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => {
                      setSearchQuery('');
                      setRoleFilter('all');
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close-circle-outline" size={16} color={colors.primary} />
                    <Text style={[styles.clearFiltersText, { color: colors.primary }]}>
                      Clear search & filters
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* User Rows / Stacked Cards */}
            {!loading &&
              filteredUsers.map((u, index) => {
                const formattedTime = formatTimestamp(u.lastLoginAt as Timestamp | null);
                const isLast = index === filteredUsers.length - 1;
                const isSelf = u.uid === currentUser?.uid;
                const targetRole = u.role === 'admin' ? 'user' : 'admin';
                const actionLabel = u.role === 'admin' ? 'Make User' : 'Make Admin';

                if (isWide) {
                  return (
                    <View
                      key={u.uid}
                      style={[
                        styles.tableRow,
                        { borderBottomColor: colors.borderLight },
                        isLast && styles.tableRowLast,
                      ]}
                    >
                      {/* User Column */}
                      <View style={[styles.userCol, { flex: 2 }]}>
                        <Avatar uri={u.photoURL} name={u.name} size={36} fontSize={14} />
                        <Text
                          style={[styles.rowUserName, { color: colors.text }]}
                          numberOfLines={1}
                        >
                          {u.name || 'Anonymous User'}
                        </Text>
                      </View>

                      {/* Email Column */}
                      <Text
                        style={[styles.rowUserEmail, { flex: 2, color: colors.textSecondary }]}
                        numberOfLines={1}
                      >
                        {u.email}
                      </Text>

                      {/* Role Column */}
                      <View style={{ flex: 1 }}>
                        <Badge role={u.role} size="sm" />
                      </View>

                      {/* Last Login Column */}
                      <Text style={[styles.rowUserDate, { flex: 1.4, color: colors.textSecondary }]}>
                        {formattedTime}
                      </Text>

                      {/* Role Management Action */}
                      <View style={[styles.actionCol, { flex: 1.6 }]}>
                        {isSelf ? (
                          <View style={styles.selfBadgeWrap}>
                            <Text style={[styles.selfText, { color: colors.textSecondary }]}>
                              (You - Admin)
                            </Text>
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={[
                              styles.roleActionBtn,
                              u.role === 'admin'
                                ? {
                                    backgroundColor: colors.surfaceSubtle,
                                    borderColor: colors.border,
                                  }
                                : {
                                    backgroundColor: colors.primaryLight,
                                    borderColor: colors.primaryBorder,
                                  },
                            ]}
                            onPress={() => setModalTarget({ user: u, targetRole })}
                            activeOpacity={0.7}
                          >
                            <Ionicons
                              name={u.role === 'admin' ? 'arrow-down-circle-outline' : 'shield-outline'}
                              size={15}
                              color={u.role === 'admin' ? colors.textSecondary : colors.primary}
                            />
                            <Text
                              style={[
                                styles.roleActionText,
                                {
                                  color: u.role === 'admin' ? colors.textSecondary : colors.primary,
                                },
                              ]}
                            >
                              {actionLabel}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                }

                // Mobile Stacked Card
                return (
                  <View
                    key={u.uid}
                    style={[
                      styles.mobileUserCard,
                      { borderBottomColor: colors.borderLight },
                      isLast && styles.tableRowLast,
                    ]}
                  >
                    <View style={styles.mobileCardTop}>
                      <Avatar uri={u.photoURL} name={u.name} size={42} fontSize={16} />
                      <View style={styles.mobileCardMeta}>
                        <Text
                          style={[styles.rowUserName, { color: colors.text }]}
                          numberOfLines={1}
                        >
                          {u.name || 'Anonymous User'}
                        </Text>
                        <Text
                          style={[styles.rowUserEmail, { color: colors.textSecondary }]}
                          numberOfLines={1}
                        >
                          {u.email}
                        </Text>
                      </View>
                      <Badge role={u.role} size="sm" />
                    </View>

                    <View style={styles.mobileCardBottom}>
                      <View style={styles.mobileDateRow}>
                        <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                        <Text style={[styles.mobileDateText, { color: colors.textSecondary }]}>
                          {formattedTime}
                        </Text>
                      </View>

                      {isSelf ? (
                        <Text style={[styles.selfText, { color: colors.textSecondary }]}>
                          (You - Admin)
                        </Text>
                      ) : (
                        <TouchableOpacity
                          style={[
                            styles.roleActionBtn,
                            u.role === 'admin'
                              ? {
                                  backgroundColor: colors.surfaceSubtle,
                                  borderColor: colors.border,
                                }
                              : {
                                  backgroundColor: colors.primaryLight,
                                  borderColor: colors.primaryBorder,
                                },
                          ]}
                          onPress={() => setModalTarget({ user: u, targetRole })}
                          activeOpacity={0.7}
                        >
                          <Ionicons
                            name={u.role === 'admin' ? 'arrow-down-circle-outline' : 'shield-outline'}
                            size={15}
                            color={u.role === 'admin' ? colors.textSecondary : colors.primary}
                          />
                          <Text
                            style={[
                              styles.roleActionText,
                              {
                                color: u.role === 'admin' ? colors.textSecondary : colors.primary,
                              },
                            ]}
                          >
                            {actionLabel}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
          </View>
        </View>

        {/* Confirmation Modal for Role Changes */}
        {modalTarget && (
          <Modal
            visible={true}
            transparent={true}
            animationType="fade"
            onRequestClose={() => {
              if (!updatingRole) {
                setModalTarget(null);
              }
            }}
          >
            <View style={styles.modalBackdrop}>
              <View
                style={[
                  styles.modalCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.modalIconCircle,
                    modalTarget.targetRole === 'admin'
                      ? { backgroundColor: colors.adminBadgeBg }
                      : { backgroundColor: colors.userBadgeBg },
                  ]}
                >
                  <Ionicons
                    name={
                      modalTarget.targetRole === 'admin'
                        ? 'shield-checkmark'
                        : 'person-remove-outline'
                    }
                    size={28}
                    color={
                      modalTarget.targetRole === 'admin'
                        ? colors.adminBadgeText
                        : colors.userBadgeText
                    }
                  />
                </View>

                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {modalTarget.targetRole === 'admin'
                    ? 'Promote User to Admin?'
                    : 'Change Role to Regular User?'}
                </Text>

                <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
                  Are you sure you want to change the role for{' '}
                  <Text style={{ fontWeight: '600', color: colors.text }}>
                    {modalTarget.user.name || modalTarget.user.email}
                  </Text>{' '}
                  to{' '}
                  <Text style={{ fontWeight: '600', color: colors.primary }}>
                    {modalTarget.targetRole.toUpperCase()}
                  </Text>
                  ?
                </Text>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[
                      styles.modalCancelBtn,
                      {
                        backgroundColor: colors.surfaceSubtle,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() => setModalTarget(null)}
                    disabled={updatingRole}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modalConfirmBtn,
                      { backgroundColor: colors.primary },
                      updatingRole && { opacity: 0.7 },
                    ]}
                    onPress={handleConfirmRoleChange}
                    disabled={updatingRole}
                    activeOpacity={0.8}
                  >
                    {updatingRole ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.modalConfirmText}>Confirm Change</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}
      </ScrollView>
    </View>
  );
}

function formatTimestamp(ts: Timestamp | null): string {
  if (!ts || typeof ts.toDate !== 'function') return '—';
  try {
    return ts.toDate().toLocaleString(undefined, {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return '—';
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  container: {
    width: '100%',
    maxWidth: 1040,
    alignSelf: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Breadcrumb Bar
  breadcrumbBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  backText: {
    fontSize: 13, // minimum 13px
    fontWeight: '600',
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: 6,
  },
  refreshText: {
    fontSize: 13, // minimum 13px
    fontWeight: '600',
  },

  // Title Area
  titleArea: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    fontSize: 28,
    fontWeight: '600', // heading weight 600
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },

  // Error Card
  errorCard: {
    marginBottom: spacing.xl,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    gap: 8,
    marginTop: -spacing.md,
    marginBottom: spacing.lg,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.xl,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: 140,
    borderRadius: radii.card,
    padding: spacing.xl,
    borderWidth: 1,
    ...shadows.card,
  },
  statIconWrap: {
    width: 38,
    height: 38,
    borderRadius: radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statNumber: {
    fontSize: 26,
    fontWeight: '600', // heading weight 600
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 13, // minimum 13px
    fontWeight: '600', // WCAG AA label weight
  },

  // Activity Card
  activityCard: {
    borderRadius: radii.card,
    padding: spacing.xl,
    borderWidth: 1,
    marginBottom: spacing.xl,
    ...shadows.card,
  },
  activityHeader: {
    marginBottom: spacing.md,
  },
  activityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIconCircle: {
    width: 34,
    height: 34,
    borderRadius: radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600', // heading weight 600
  },
  activitySubtitle: {
    fontSize: 13, // minimum 13px
    lineHeight: 18,
  },
  activitySkeletonWrap: {
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  activitySkeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityEmpty: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  activityEmptyText: {
    fontSize: 13, // minimum 13px
  },
  activityList: {
    marginTop: spacing.xs,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  activityRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md,
  },
  platformBadge: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  activityMeta: {
    flex: 1,
  },
  activityUser: {
    fontSize: 14,
    fontWeight: '600',
  },
  activityEmail: {
    fontSize: 13, // minimum 13px
  },
  activityRowRight: {
    alignItems: 'flex-end',
  },
  activityTime: {
    fontSize: 13, // minimum 13px (raised from 12px)
    marginBottom: 4,
  },
  platformPill: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  platformText: {
    fontSize: 13, // minimum 13px (raised from 10px)
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // Controls
  controlsCard: {
    borderRadius: radii.card,
    padding: spacing.lg,
    borderWidth: 1,
    marginBottom: spacing.xl,
    ...shadows.subtle,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    height: 46,
    marginBottom: spacing.md,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  clearSearchBtn: {
    padding: 6,
  },
  filterChipsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  chip: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13, // minimum 13px
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },

  // Table & List
  tableCard: {
    borderRadius: radii.card,
    borderWidth: 1,
    overflow: 'hidden',
    ...shadows.card,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  colHeader: {
    fontSize: 13, // minimum 13px (raised from 11px)
    fontWeight: '600', // WCAG AA label weight
    letterSpacing: 0.8,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  userCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rowUserName: {
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
  },
  rowUserEmail: {
    fontSize: 13, // minimum 13px
  },
  rowUserDate: {
    fontSize: 13, // minimum 13px
  },
  actionCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  roleActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
    borderWidth: 1,
  },
  roleActionText: {
    fontSize: 13, // minimum 13px (raised from 12px)
    fontWeight: '600',
  },
  selfBadgeWrap: {
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
  },
  selfText: {
    fontSize: 13, // minimum 13px
    fontWeight: '500',
    fontStyle: 'italic',
  },

  // Mobile User Card
  mobileUserCard: {
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  mobileCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  mobileCardMeta: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  mobileCardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: spacing.sm,
  },
  mobileDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  mobileDateText: {
    fontSize: 13, // minimum 13px
  },

  // Skeleton
  skeletonContainer: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  skeletonTextCol: {
    flex: 1,
  },

  // Empty State for "no users match your search"
  emptyState: {
    alignItems: 'center',
    padding: spacing.xxxl,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h3,
    fontSize: 18,
    fontWeight: '600', // heading weight 600
    marginBottom: spacing.xs,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 380,
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  clearFiltersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.md,
  },
  clearFiltersText: {
    fontSize: 13, // minimum 13px
    fontWeight: '600',
  },

  // Confirmation Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalCard: {
    maxWidth: 420,
    width: '100%',
    borderRadius: radii.card,
    padding: spacing.xxxl,
    alignItems: 'center',
    borderWidth: 1,
    ...shadows.hover,
  },
  modalIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...typography.h2,
    fontSize: 20,
    fontWeight: '600', // heading weight 600
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  modalMessage: {
    ...typography.body,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.xxl,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalConfirmBtn: {
    flex: 1.2,
    paddingVertical: 12,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
