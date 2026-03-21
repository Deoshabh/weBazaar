'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiMail, FiChevronLeft } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import EmailAuth from '@/components/auth/EmailAuth';
import PhoneAuth from '@/components/auth/PhoneAuth';
import { useAuth } from '@/context/AuthContext';
import { loginWithGoogle } from '@/utils/firebaseAuth';
import { useRecaptcha, RECAPTCHA_ACTIONS } from '@/utils/recaptcha';
import toast from 'react-hot-toast';

export default function FirebaseLoginPage() {
  const router = useRouter();
  const { updateUser, isAuthenticated, loading, syncWithBackend, loginInProgressRef } = useAuth();
  const { getToken } = useRecaptcha();
  const [authMethod, setAuthMethod] = useState('phone'); // 'phone' or 'email'
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/');
    }
  }, [loading, isAuthenticated, router]);

  if (!loading && isAuthenticated) {
    return null;
  }

  /**
   * Handle successful Firebase authentication
   * Sync Firebase user with backend
   * 
   * ✅ SECURITY CHECKS:
   * - Verify email returned from Firebase isn't empty
   * - Validate backend response includes correct user email
   * - Reject if email mismatch between Firebase and backend
   */
  const handleFirebaseSuccess = async (result) => {
    // Raise the guard so AuthContext's onAuthStateChanged listener
    // does NOT fire a competing firebaseLogin call.
    loginInProgressRef.current = true;

    try {
      const { user, token } = result;

      if (!user?.email) {
        toast.error("Unable to retrieve your email. Please try again.");
        return;
      }

      if (!token) {
        toast.error("Failed to get Firebase ID token. Please try again.");
        return;
      }

      const recaptchaToken = await getToken(RECAPTCHA_ACTIONS.LOGIN);

      const payload = {
        firebaseToken: token,
        email: user.email,
        phoneNumber: user.phoneNumber,
        displayName: user.displayName,
        photoURL: user.photoURL,
        uid: user.uid,
        recaptchaToken,
      };

      const data = await syncWithBackend(payload);

      if (data?.user) {
        // Verify email consistency between Firebase and backend
        if (data.user.email !== user.email) {
          console.error('EMAIL MISMATCH:', { firebaseEmail: user.email, backendEmail: data.user.email });
          toast.error('Email mismatch detected. Please contact support.');
          return;
        }

        toast.success(`Logged in as ${user.email}`);
        router.push('/');
      } else {
        toast.error('Failed to sync with server. Please try again.');
      }
    } catch (error) {
      console.error('Backend sync error:', JSON.stringify({
        status: error.response?.status,
        message: error.message,
        responseData: error.response?.data,
        url: error.config?.url,
      }, null, 2));

      if (error.response?.data?.error === 'FIREBASE_UID_MISMATCH') {
        toast.error(
          'Account security check failed. This email is already linked to another account. ' +
          'If this is your account, please contact support.'
        );
        return;
      }

      const errorMessage = error.response?.data?.message || 'Failed to sync with server. Please try again.';
      toast.error(errorMessage);
    } finally {
      // Release the guard so future onAuthStateChanged calls work normally
      // (e.g. on page refresh after login, on logout, etc.)
      loginInProgressRef.current = false;
    }
  };

  /**
   * Handle Google Sign-In
   */
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);

    try {
      const result = await loginWithGoogle();



      if (!result) {
        toast.error('No response from Google sign-in');
        setGoogleLoading(false);
        return;
      }

      if (!result.success) {
        console.error('Google sign-in failed:', result.error);
        toast.error(result.error || 'Google sign-in failed');
        setGoogleLoading(false);
        return;
      }

      if (!result.token) {
        console.error('⚠️  Google sign-in returned no token:', result);
        toast.error('Failed to get authentication token from Google');
        setGoogleLoading(false);
        return;
      }

      await handleFirebaseSuccess(result);
    } catch (error) {
      console.error('Google sign-in exception:', error);
      toast.error('An error occurred during Google sign-in');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-brand-cream/20 to-primary-100">
      <div className="container-custom py-8">
        <div className="max-w-md mx-auto">
          {/* Back Button */}
          <Link href="/" className="inline-flex items-center gap-2 text-primary-600 hover:text-brand-brown mb-8">
            <FiArrowLeft />
            Back to Home
          </Link>

          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Auth Components */}
            <div className="p-8">
              {authMethod === 'email' ? (
                <>
                  {/* Back to Phone button */}
                  <button
                    onClick={() => setAuthMethod('phone')}
                    aria-label="Return to phone number login"
                    className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-brand-brown mb-6"
                  >
                    <FiChevronLeft className="w-4 h-4" />
                    Back to Phone Login
                  </button>
                  <EmailAuth onSuccess={handleFirebaseSuccess} mode="login" />
                </>
              ) : (
                <PhoneAuth onSuccess={handleFirebaseSuccess} />
              )}

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-primary-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-primary-500">OR</span>
                </div>
              </div>

              {/* Continue with Email button (only shown when phone is active) */}
              {authMethod === 'phone' && (
                <>
                  <button
                    onClick={() => setAuthMethod('email')}
                    aria-label="Switch to email login"
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-primary-200 rounded-lg hover:bg-primary-50 hover:border-primary-300 transition-all mb-4"
                  >
                    <FiMail className="w-5 h-5 text-primary-600" />
                    <span className="font-medium text-primary-900">Continue with Email</span>
                  </button>

                  {/* Divider */}
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-primary-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-white text-primary-500">OR</span>
                    </div>
                  </div>
                </>
              )}

              {/* Google Sign-In Button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-primary-200 rounded-lg hover:bg-primary-50 hover:border-primary-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FcGoogle className="w-5 h-5" />
                <span className="font-medium text-primary-900">
                  {googleLoading ? 'Connecting to Google...' : 'Continue with Google'}
                </span>
              </button>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-8 text-center">
            <p className="text-xs text-primary-500">
              By continuing, you agree to our{' '}
              <Link href="/terms" className="text-brand-brown hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-brand-brown hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
