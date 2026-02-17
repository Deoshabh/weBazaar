// Firebase Configuration and Initialization
import { initializeApp, getApps } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Warn in dev when critical config values are missing (Nixpack build-time issue)
if (
  typeof window !== "undefined" &&
  process.env.NODE_ENV === "development" &&
  !firebaseConfig.apiKey
) {
  console.warn(
    "⚠️  NEXT_PUBLIC_FIREBASE_API_KEY is missing. Firebase Auth will not work. " +
    "Make sure all NEXT_PUBLIC_FIREBASE_* env vars are set at build time."
  );
}

// Initialize Firebase (singleton pattern)
let app;
let auth;
let analytics;

if (typeof window !== "undefined") {
  // Only initialize on client side
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);

  // Explicitly set persistence to localStorage so sessions survive
  // SSR/CSR hydration mismatches and Nixpack container restarts.
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.error("Firebase setPersistence failed:", err);
  });

  // Initialize Analytics only on client side and if supported
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, analytics };
export default firebaseConfig;
