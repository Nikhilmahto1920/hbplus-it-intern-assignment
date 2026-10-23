import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
  collection,
  getDocs,
  collectionGroup,
  query,
  orderBy,
  limit,
  type FieldValue,
  type Timestamp,
} from 'firebase/firestore';
import { Platform } from 'react-native';
import { db } from '../config/firebase';
import type { User as FirebaseUser } from 'firebase/auth';

/** Shape of a user document stored in Firestore. */
export interface UserDoc {
  uid: string;
  email: string;
  name: string;
  photoURL: string | null;
  role: 'user' | 'admin';
  createdAt: Timestamp | FieldValue;
  lastLoginAt: Timestamp | FieldValue;
  lastPlatform?: string;
}

/** Shape of a login activity log in users/{uid}/logins subcollection */
export interface LoginDoc {
  id?: string;
  at: Timestamp | FieldValue | null;
  platform: string;
  uid?: string;
  email?: string;
  name?: string;
}

/**
 * Creates a new user doc on first login (role defaults to "user").
 * On subsequent logins only `lastLoginAt` and `lastPlatform` are updated.
 * Also appends a login record to `users/{uid}/logins`.
 * Returns the current user document.
 */
export async function createOrUpdateUser(firebaseUser: FirebaseUser): Promise<UserDoc> {
  const ref = doc(db, 'users', firebaseUser.uid);
  const snap = await getDoc(ref);

  let userDoc: UserDoc;

  if (snap.exists()) {
    await updateDoc(ref, {
      lastLoginAt: serverTimestamp(),
      lastPlatform: Platform.OS,
    });
    const updated = await getDoc(ref);
    userDoc = updated.data() as UserDoc;
  } else {
    const newUser: UserDoc = {
      uid: firebaseUser.uid,
      email: firebaseUser.email ?? '',
      name: firebaseUser.displayName ?? '',
      photoURL: firebaseUser.photoURL ?? null,
      role: 'user',
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
      lastPlatform: Platform.OS,
    };

    await setDoc(ref, newUser);
    const created = await getDoc(ref);
    userDoc = created.data() as UserDoc;
  }

  // Requirement: On each successful login write a doc to users/{uid}/logins
  // with { at: serverTimestamp, platform: Platform.OS }
  try {
    await addDoc(collection(db, 'users', firebaseUser.uid, 'logins'), {
      at: serverTimestamp(),
      platform: Platform.OS,
      uid: firebaseUser.uid,
      email: firebaseUser.email ?? '',
      name: firebaseUser.displayName ?? '',
    });
  } catch (_logErr) {
    // Non-blocking for the login flow
  }

  return userDoc;
}

/**
 * Updates a user's role (Admin role management).
 */
export async function updateUserRole(
  uid: string,
  newRole: 'user' | 'admin'
): Promise<void> {
  const ref = doc(db, 'users', uid);
  await updateDoc(ref, { role: newRole });
}

/** Fetch all user documents (admin-only). */
export async function fetchAllUsers(): Promise<UserDoc[]> {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map((d) => d.data() as UserDoc);
}

/**
 * Fetch the latest 10 logins across users.
 * Uses collectionGroup query, falling back gracefully to users sorted by lastLoginAt.
 */
export async function fetchRecentLogins(): Promise<LoginDoc[]> {
  try {
    const q = query(
      collectionGroup(db, 'logins'),
      orderBy('at', 'desc'),
      limit(10)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<LoginDoc, 'id'>),
      }));
    }
  } catch (_cgErr) {
    // Collection group indexing or permissions fallback
  }

  // Graceful fallback from users collection
  try {
    const users = await fetchAllUsers();
    return users
      .filter((u) => u.lastLoginAt)
      .sort((a, b) => {
        const timeA = (a.lastLoginAt as Timestamp)?.toMillis?.() ?? 0;
        const timeB = (b.lastLoginAt as Timestamp)?.toMillis?.() ?? 0;
        return timeB - timeA;
      })
      .slice(0, 10)
      .map((u) => ({
        id: u.uid,
        at: u.lastLoginAt,
        platform: u.lastPlatform || 'web',
        uid: u.uid,
        email: u.email,
        name: u.name,
      }));
  } catch {
    return [];
  }
}

/** Read a single user's role. Returns "user" if the doc doesn't exist yet. */
export async function getUserRole(uid: string): Promise<'user' | 'admin'> {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return (snap.data() as UserDoc).role;
  }
  return 'user';
}
