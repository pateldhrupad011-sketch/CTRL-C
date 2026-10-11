// Client-side Firebase SDK — safe to import in browser ("use client") components only.
// Do NOT import this from server-only files; use lib/firebase.ts (Admin) there.

import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Reuse existing app if already initialized (hot-reload / StrictMode safe).
export const firebaseApp = getApps()[0] ?? initializeApp(firebaseConfig);

/** Firebase Auth instance for client-side sign-in / sign-up. */
export const clientAuth = getAuth(firebaseApp);

/** Lazily initialise Analytics (browser-only). Call inside a useEffect. */
export async function getFirebaseAnalytics() {
  const { getAnalytics, isSupported } = await import("firebase/analytics");
  if (await isSupported()) return getAnalytics(firebaseApp);
  return null;
}
