import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { ThemeProvider } from '../src/context/ThemeContext';
import { ToastProvider } from '../src/context/ToastContext';
import { useIdleTimeout } from '../src/hooks/useIdleTimeout';
import { Loader } from '../src/components/Loader';

/**
 * Inner layout that handles auth-based redirects and idle session timeout.
 * Runs INSIDE AuthProvider and ToastProvider.
 */
function RootNavigator() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Automatic 30-minute idle session timeout
  useIdleTimeout();

  useEffect(() => {
    if (loading) return;

    const inApp = segments[0] === '(app)';

    if (!user && inApp) {
      // Not logged in but trying to access protected route → login
      router.replace('/login');
    } else if (user && !inApp) {
      // Logged in but on login page → dashboard
      router.replace('/(app)/dashboard');
    }
  }, [user, loading, segments, router]);

  if (loading) {
    return <Loader />;
  }

  return <Slot />;
}

/**
 * Root layout — wraps entire app in ThemeProvider, AuthProvider, and ToastProvider.
 */
export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <RootNavigator />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
