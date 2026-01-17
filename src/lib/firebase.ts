"use client";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, ref, set, get, child, update } from "firebase/database";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User
} from "firebase/auth";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);
const auth = getAuth(app);

// Helper to construct fake email from username
const getEmail = (username: string) => `${username.toLowerCase()}@codedungeon.local`;

export const signUpWithUsername = async (username: string, password: string) => {
  const email = getEmail(username);
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await updateProfile(user, { displayName: username });

  // Create initial user profile in DB
  await set(ref(db, `users/${user.uid}/profile`), {
    username,
    email,
    createdAt: Date.now()
  });

  // Initialize empty progress if not exists
  await set(ref(db, `users/${user.uid}/progress`), {
    dungeonsEntered: {},
    dungeonsCleared: {},
    questionsSolved: 0,
    questionsAttempted: 0,
    currentDungeon: null,
    totalPlayTime: 0,
    highestStreak: 0,
    lastLoginAt: Date.now()
  });

  return user;
};

export const loginWithUsername = async (username: string, password: string) => {
  const email = getEmail(username);
  const userCredential = await signInWithEmailAndPassword(auth, email, password);

  // Update last login
  await update(ref(db, `users/${userCredential.user.uid}/progress`), {
    lastLoginAt: Date.now()
  });

  return userCredential.user;
};

export const logout = () => signOut(auth);

export const getRealm = () => {
  if (!firebaseConfig.databaseURL) return 'unknown-realm';
  const match = firebaseConfig.databaseURL.match(/https:\/\/[\w-]+\-default-rtdb\.([\w-]+)\.firebasedatabase\.app/);
  return match ? match[1] : 'unknown-realm';
}

export { db, auth, onAuthStateChanged, ref, set, get, child, update };
export type { User };
