import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// 30 minutes of inactivity in milliseconds
const IDLE_TIMEOUT_MS = 30 * 60 * 1000;

export function useIdleTimeout() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActiveRef = useRef<number>(Date.now());

  const resetTimer = () => {
    lastActiveRef.current = Date.now();
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    if (!user) return;

    timerRef.current = setTimeout(async () => {
      if (user) {
        showToast('Signed out due to 30 minutes of inactivity.', 'info');
        await logout();
      }
    }, IDLE_TIMEOUT_MS);
  };

  useEffect(() => {
    if (!user) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    resetTimer();

    // Listen for Web interaction events
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const activityEvents = [
        'mousedown',
        'mousemove',
        'keydown',
        'scroll',
        'touchstart',
        'click',
      ];

      const handleUserActivity = () => {
        // Debounce timer resets slightly (at most once every 2 seconds)
        if (Date.now() - lastActiveRef.current > 2000) {
          resetTimer();
        }
      };

      activityEvents.forEach((event) => {
        window.addEventListener(event, handleUserActivity, { passive: true });
      });

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        activityEvents.forEach((event) => {
          window.removeEventListener(event, handleUserActivity);
        });
      };
    }

    // Native AppState tracking
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        const elapsed = Date.now() - lastActiveRef.current;
        if (elapsed >= IDLE_TIMEOUT_MS) {
          showToast('Signed out due to 30 minutes of inactivity.', 'info');
          logout();
        } else {
          resetTimer();
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      subscription.remove();
    };
  }, [user, logout, showToast]);
}
