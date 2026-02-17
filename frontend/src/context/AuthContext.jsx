'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/utils/api';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import {
  loginWithEmail,
  registerWithEmail,
  logoutFirebase,
  onAuthStateChange,
  getFirebaseToken
} from '@/utils/firebaseAuth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // User is signed in to Firebase
          const token = await firebaseUser.getIdToken();
          const accessToken = Cookies.get('accessToken');

          if (accessToken) {
            try {
              const response = await authAPI.getCurrentUser();
              setUser(response.data);
            } catch {
              try {
                const response = await authAPI.firebaseLogin({
                  firebaseToken: token,
                  email: firebaseUser.email,
                  uid: firebaseUser.uid,
                });
                const { accessToken: nextAccessToken, user: backendUser } = response.data;
                Cookies.set('accessToken', nextAccessToken, { expires: 1 });
                setUser(backendUser);
              } catch (syncErr) {
                console.error('Failed to auto-sync backend session:', syncErr);
              }
            }
          } else {
            try {
              const response = await authAPI.firebaseLogin({
                firebaseToken: token,
                email: firebaseUser.email,
                uid: firebaseUser.uid,
              });
              const { accessToken: nextAccessToken, user: backendUser } = response.data;
              Cookies.set('accessToken', nextAccessToken, { expires: 1 });
              setUser(backendUser);
            } catch (syncErr) {
              console.error('Failed to establish backend session from Firebase user:', syncErr);
              setUser(null);
            }
          }
        } else {
          // User is signed out of Firebase
          setUser(null);
          Cookies.remove('accessToken');
        }
      } catch (error) {
        console.error('Auth state change error:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (credentials) => {
    try {
      // 1. Login with Firebase
      const { user: firebaseUser, token } = await loginWithEmail(credentials.email, credentials.password);

      if (!firebaseUser) return { success: false, error: 'Firebase login failed' };

      // 2. Sync with Backend
      const response = await authAPI.firebaseLogin({
        firebaseToken: token,
        email: firebaseUser.email,
        uid: firebaseUser.uid
      });

      const { accessToken, user: backendUser } = response.data;

      // Store accessToken
      Cookies.set('accessToken', accessToken, { expires: 1 });

      setUser(backendUser);
      return { success: true };
    } catch (error) {
      console.error('Login context error:', error);
      const message = error.response?.data?.message || error.message || 'Login failed';
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      // 1. Register with Firebase
      const { user: firebaseUser, token } = await registerWithEmail(userData.email, userData.password, userData.name);

      if (!firebaseUser) return { success: false, error: 'Firebase registration failed' };

      // 2. Create User in Backend
      const response = await authAPI.firebaseLogin({
        firebaseToken: token,
        email: firebaseUser.email,
        uid: firebaseUser.uid,
        displayName: userData.name,
      });

      const { accessToken, user: backendUser } = response.data;

      Cookies.set('accessToken', accessToken, { expires: 1 });

      setUser(backendUser);
      return { success: true };
    } catch (error) {
      console.error('Registration context error:', error);
      const message = error.response?.data?.message || error.message || 'Registration failed';
      return { success: false, error: message };
    }
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

  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
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
