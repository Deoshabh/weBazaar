// Firebase Configuration and Initialization
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCA1p_WyJ7m3j97HnjKA05EPRq5001LT2k",
  authDomain: "radeo-2026.firebaseapp.com",
  projectId: "radeo-2026",
  storageBucket: "radeo-2026.firebasestorage.app",
  messagingSenderId: "1016544530927",
  appId: "1:1016544530927:web:ed217482d6dc73192ba61a",
  measurementId: "G-5PR3Z8K7YT",
};

// Initialize Firebase (singleton pattern)
let app;
let auth;
let analytics;

if (typeof window !== "undefined") {
  // Only initialize on client side
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);

  // Initialize Analytics only on client side and if supported
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, analytics };
export default firebaseConfig;
