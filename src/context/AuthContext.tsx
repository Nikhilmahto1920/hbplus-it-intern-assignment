import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import { auth } from '../config/firebase';
import { validateDomain } from '../utils/validateDomain';
import { createOrUpdateUser } from '../services/userService';
import type { UserDoc } from '../services/userService';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface AuthState {
  user: User | null;
  role: 'user' | 'admin' | null;
  loading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthState>({
  user: null,
  role: null,
  loading: true,
  error: null,
  login: async () => {},
  logout: async () => {},
  clearError: () => {},
});

export const useAuth = () => useContext(AuthContext);

// ---------------------------------------------------------------------------
// Env-based client IDs
// ---------------------------------------------------------------------------
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '';

if (Platform.OS !== 'web') {
  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
  });
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'user' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Guard: prevent double-processing during signOut-on-invalid-domain
  const signingOut = useRef(false);
  // Guard: prevent duplicate domain check & Firestore user sync
  const isSyncingUser = useRef<string | null>(null);

  // ------------------------------------------------------------------
  // Domain-validate → Firestore sync → set state
  // ------------------------------------------------------------------
  const handleAuthenticatedUser = useCallback(async (firebaseUser: User) => {
    if (signingOut.current) return; // avoid loop
    if (isSyncingUser.current === firebaseUser.uid) return;
    isSyncingUser.current = firebaseUser.uid;

    const result = validateDomain(firebaseUser.email, firebaseUser.emailVerified);

    if (!result.valid) {
      signingOut.current = true;
      try {
        if (Platform.OS !== 'web') {
          try {
            await GoogleSignin.signOut();
          } catch {
            // ignore
          }
        }
        await signOut(auth);
      } finally {
        signingOut.current = false;
      }
      isSyncingUser.current = null;
      setUser(null);
      setRole(null);
      setError(result.reason ?? 'Access restricted. Please login using your official domain email.');
      setLoading(false);
      return;
    }

    try {
      const userDoc: UserDoc = await createOrUpdateUser(firebaseUser);
      setUser(firebaseUser);
      setRole(userDoc.role);
      setError(null);
    } catch {
      // Firestore write failed — sign out so user isn't half-logged-in
      signingOut.current = true;
      try {
        if (Platform.OS !== 'web') {
          try {
            await GoogleSignin.signOut();
          } catch {
            // ignore
          }
        }
        await signOut(auth);
      } finally {
        signingOut.current = false;
      }
      isSyncingUser.current = null;
      setUser(null);
      setRole(null);
      setError('Failed to sync user data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // ------------------------------------------------------------------
  // Firebase onAuthStateChanged listener
  // ------------------------------------------------------------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (signingOut.current) return; // ignore intermediate null during forced sign-out
      if (firebaseUser) {
        await handleAuthenticatedUser(firebaseUser);
      } else {
        isSyncingUser.current = null;
        setUser(null);
        setRole(null);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, [handleAuthenticatedUser]);

  // ------------------------------------------------------------------
  // login()
  // ------------------------------------------------------------------
  const login = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      if (Platform.OS === 'web') {
        const provider = new GoogleAuthProvider();
        provider.addScope('email');
        provider.addScope('profile');
        await signInWithPopup(auth, provider);
        // onAuthStateChanged handles the rest
      } else {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        const response = await GoogleSignin.signIn();

        if (response.type === 'cancelled') {
          setError('Login was cancelled. Please try again.');
          setLoading(false);
          return;
        }

        const idToken = response.data?.idToken;
        if (!idToken) {
          setError('No ID token received from Google. Please try again.');
          setLoading(false);
          return;
        }

        const credential = GoogleAuthProvider.credential(idToken);
        const userCredential = await signInWithCredential(auth, credential);
        await handleAuthenticatedUser(userCredential.user);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      setLoading(false);
    }
  }, [handleAuthenticatedUser]);

  // ------------------------------------------------------------------
  // logout()
  // ------------------------------------------------------------------
  const logout = useCallback(async () => {
    try {
      if (Platform.OS !== 'web') {
        try {
          await GoogleSignin.signOut();
        } catch {
          // ignore native sign out error
        }
      }
      await signOut(auth);
      isSyncingUser.current = null;
      setUser(null);
      setRole(null);
      setError(null);
    } catch {
      setError('Failed to sign out. Please try again.');
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider
      value={{ user, role, loading, error, login, logout, clearError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Error mapper
// ---------------------------------------------------------------------------
function getErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const code = String((err as { code: unknown }).code);
    switch (code) {
      case statusCodes.SIGN_IN_CANCELLED:
      case 'SIGN_IN_CANCELLED':
      case '12501':
      case 'auth/cancelled-popup-request':
        return 'Login was cancelled. Please try again.';
      case 'auth/popup-closed-by-user':
        return 'Login popup was closed. Please try again.';
      case statusCodes.IN_PROGRESS:
      case 'IN_PROGRESS':
      case 'ASYNC_OP_IN_PROGRESS':
        return 'Google Sign-In is not ready yet. Please wait a moment and try again.';
      case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
      case 'PLAY_SERVICES_NOT_AVAILABLE':
        return 'Google Play Services is not available or outdated.';
      case '7':
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.';
      case 'auth/user-disabled':
        return 'This account has been disabled. Contact your administrator.';
      case 'auth/popup-blocked':
        return 'Login popup was blocked by the browser. Please allow popups and try again.';
      default:
        break;
    }
  }
  if (err instanceof Error) {
    if (err.message.toLowerCase().includes('network')) {
      return 'Network error. Please check your connection and try again.';
    }
    return err.message;
  }
  return 'An unexpected error occurred. Please try again.';
}
