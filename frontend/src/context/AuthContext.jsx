'use client';

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { authAPI } from '@/utils/api';
import Cookies from 'js-cookie';
import {
  logoutFirebase,
  onAuthStateChange,
} from '@/utils/firebaseAuth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Guard: when true an explicit login/register is in progress — the
  // onAuthStateChanged listener must NOT race it with its own backend call.
  const loginInProgressRef = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      // If an explicit login/register call is running, skip — the caller
      // will set user + cookie itself once the backend responds.
      if (loginInProgressRef.current) return;

      try {
        if (firebaseUser) {
          const accessToken = Cookies.get('accessToken');

          if (accessToken) {
            // We already have a backend token — just validate it.
            try {
              const response = await authAPI.getCurrentUser();
              setUser(response.data);
            } catch {
              // Token expired / invalid — clear it and let the user re-login.
              Cookies.remove('accessToken');
              setUser(null);
            }
          } else {
            // Firebase says signed-in but we have no backend token.
            // This happens on a hard refresh where the Firebase SDK
            // restores the session from IndexedDB but the JS cookie is gone.
            // We could try to auto-sync, but without a recaptchaToken the
            // backend may reject firebaseLogin in production.  Safest to
            // just leave the user as null and let them click "Log in" again.
            setUser(null);
          }
        } else {
          // Signed out of Firebase.
          setUser(null);
          Cookies.remove('accessToken');
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  /**
   * Sync a Firebase user with the backend.  Called by explicit login flows
   * (email, Google, phone) which already obtained a recaptchaToken.
   *
   * Sets the loginInProgressRef guard so onAuthStateChanged does not race.
   */
  const syncWithBackend = useCallback(async (payload) => {
    const response = await authAPI.firebaseLogin(payload);
    const { accessToken, user: backendUser } = response.data;
    if (accessToken) Cookies.set('accessToken', accessToken, { expires: 1 });
    setUser(backendUser);
    return response.data;
  }, []);

  const login = async (credentials) => {
    // Handled entirely by the firebase-login page now — this method is kept
    // for backwards-compat but should not be the primary path.
    return { success: false, error: 'Use the Firebase login page' };
  };

  const register = async (userData) => {
    return { success: false, error: 'Use the Firebase register page' };
  };

  const logout = async () => {
    try {
      await logoutFirebase();
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      Cookies.remove('accessToken');
      setUser(null);
    }
  };

  const updateUser = useCallback((userData) => {
    setUser(userData);
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    syncWithBackend,
    loginInProgressRef,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
