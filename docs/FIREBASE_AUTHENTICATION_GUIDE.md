# Firebase Authentication Setup Guide

## 🔥 Overview

This guide covers the complete Firebase authentication implementation supporting both **Email/Password** and **Phone/OTP** authentication methods.

---

## 📋 What's Included

### Frontend Components

- ✅ Firebase SDK configuration
- ✅ Email authentication (login, register, reset password)
- ✅ Phone/OTP authentication with reCAPTCHA
- ✅ Reusable auth components
- ✅ Unified login page with tabs
- ✅ Integration with existing auth system

### Backend Integration

- ✅ Firebase Admin SDK setup
- ✅ Token verification
- ✅ User creation/sync
- ✅ Extended User model with Firebase fields

---

## 🚀 Quick Start

### 1. Firebase Console Setup

#### Enable Authentication Methods

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **radeo-2026**
3. Navigate to **Authentication** → **Sign-in method**
4. Enable the following:
   - ✅ **Email/Password**
   - ✅ **Phone** (requires configuration)

#### Phone Authentication Setup

1. In Phone authentication settings:
   - Add test phone numbers (optional, for development)
   - Configure phone number verification
2. Enable **reCAPTCHA v2** (automatic)

#### Get API Keys

Your Firebase config (already added):

```javascript
{
  apiKey: "AIzaSyCA1p_WyJ7m3j97HnjKA05EPRq5001LT2k",
  authDomain: "radeo-2026.firebaseapp.com",
  projectId: "radeo-2026",
  storageBucket: "radeo-2026.firebasestorage.app",
  messagingSenderId: "1016544530927",
  appId: "1:1016544530927:web:ed217482d6dc73192ba61a",
  measurementId: "G-5PR3Z8K7YT"
}
```

---

## 📁 File Structure

```
frontend/
├── src/
│   ├── config/
│   │   └── firebase.js                    # Firebase client config
│   ├── utils/
│   │   └── firebaseAuth.js                # Auth utility functions
│   ├── components/
│   │   └── auth/
│   │       ├── EmailAuth.jsx              # Email authentication component
│   │       └── PhoneAuth.jsx              # Phone/OTP authentication component
│   └── app/
│       └── auth/
│           ├── firebase-login/
│           │   └── page.jsx               # Unified Firebase login page
│           └── login/
│               └── page.jsx               # Traditional login (updated with Firebase link)

backend/
├── config/
│   └── firebase.js                        # Firebase Admin SDK config
├── controllers/
│   └── authController.js                  # Added firebaseLogin() handler
├── models/
│   └── User.js                            # Updated with Firebase fields
└── routes/
    └── authRoutes.js                      # Added /firebase-login endpoint
```

---

## 🔐 Authentication Flows

### Email Authentication Flow

```
1. User enters email & password
   ├─ Login mode → signInWithEmailAndPassword()
   │   ├─ Check email verification
   │   ├─ Get Firebase ID token
   │   └─ Send to backend for session creation
   │
   └─ Register mode → createUserWithEmailAndPassword()
       ├─ Send verification email
       ├─ Create Firebase user
       └─ Wait for email verification

2. Backend receives Firebase token
   ├─ Verify token with Firebase Admin SDK
   ├─ Find or create user in database
   ├─ Generate JWT tokens (access + refresh)
   └─ Return session to frontend

3. Frontend stores session
   └─ Redirect to home page
```

### Phone Authentication Flow

```
1. User enters phone number (+91XXXXXXXXXX)
   └─ Display reCAPTCHA verification

2. Click "Send OTP"
   ├─ setupRecaptcha() → Initialize verifier
   ├─ sendOTP() → signInWithPhoneNumber()
   └─ Firebase sends SMS with 6-digit code

3. User enters OTP
   └─ verifyOTP() → confirmationResult.confirm()

4. OTP verification successful
   ├─ Get Firebase ID token
   └─ Send to backend for session creation

5. Backend creates/updates user
   └─ Return session to frontend
```

---

## 💻 Backend Implementation

### User Model Updates

Added fields to `backend/models/User.js`:

```javascript
{
  // Existing fields
  name: String,
  email: String,
  passwordHash: String, // Now optional

  // New Firebase fields
  firebaseUid: String,        // Firebase User ID
  authProvider: String,       // 'local', 'phone', 'password'
  phone: String,              // Phone number
  profilePicture: String,     // Profile photo URL
  emailVerified: Boolean,     // Email verification status
  phoneVerified: Boolean,     // Phone verification status
}
```

### API Endpoint

**POST** `/api/v1/auth/firebase-login`

**Request Body:**

```json
{
  "firebaseToken": "eyJhbGciOiJSUzI1...",
  "email": "user@example.com",
  "phoneNumber": "+919876543210",
  "displayName": "John Doe",
  "photoURL": "https://...",
  "uid": "firebase_uid_here"
}
```

**Response:**

```json
{
  "message": "Firebase authentication successful",
  "accessToken": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": "user_mongodb_id",
    "name": "John Doe",
    "email": "user@example.com",
    "phone": "+919876543210",
    "role": "customer",
    "profilePicture": "https://...",
    "emailVerified": true,
    "phoneVerified": true
  }
}
```

**Cookies Set:**

- `refreshToken` (httpOnly, 7 days)

---

## 🎨 Frontend Components

### EmailAuth Component

**Location:** `frontend/src/components/auth/EmailAuth.jsx`

**Props:**

- `onSuccess(result)` - Callback on successful auth
- `mode` - Initial mode: 'login', 'register', 'reset', 'verify'

**Features:**

- Login with email/password
- Register new account
- Password reset via email
- Email verification notice
- Resend verification email

**Usage:**

```jsx
<EmailAuth
  onSuccess={(result) => {
    // result contains: user, token
    console.log("Firebase auth successful:", result);
  }}
  mode="login"
/>
```

### PhoneAuth Component

**Location:** `frontend/src/components/auth/PhoneAuth.jsx`

**Props:**

- `onSuccess(result)` - Callback on successful auth

**Features:**

- Country code selector (10 countries)
- Phone number input with validation
- reCAPTCHA v2 integration
- OTP input with 6-digit verification
- Resend OTP with 60s cooldown
- Change phone number option

**Usage:**

```jsx
<PhoneAuth
  onSuccess={(result) => {
    console.log("Phone auth successful:", result);
  }}
/>
```

### Firebase Login Page

**Location:** `frontend/src/app/auth/firebase-login/page.jsx`

**Features:**

- Tab switcher (Email / Phone)
- Handles success callbacks
- Syncs with backend
- Updates AuthContext
- Redirects after login

**Access:**

- URL: `/auth/firebase-login`
- Link from traditional login page

---

## 🛠️ Firebase Auth Utilities

**Location:** `frontend/src/utils/firebaseAuth.js`

### Email Functions

```javascript
// Register with email
registerWithEmail(email, password, displayName);
// Returns: { success, user, message } or { success: false, error }

// Login with email
loginWithEmail(email, password);
// Returns: { success, user, token } or { success: false, error, needsVerification }

// Reset password
resetPassword(email);
// Returns: { success, message } or { success: false, error }

// Resend verification email
resendVerificationEmail();
// Returns: { success, message } or { success: false, error }
```

### Phone Functions

```javascript
// Setup reCAPTCHA
setupRecaptcha(containerId);
// Returns: RecaptchaVerifier instance

// Send OTP
sendOTP(phoneNumber);
// phoneNumber format: "+91XXXXXXXXXX"
// Returns: { success, confirmationResult, message } or { success: false, error }

// Verify OTP
verifyOTP(confirmationResult, otp);
// otp: 6-digit code
// Returns: { success, user, token } or { success: false, error }

// Link phone to existing account
linkPhoneNumber(phoneNumber, verificationId, verificationCode);
// Returns: { success, message } or { success: false, error }
```

### Common Functions

```javascript
// Logout
logoutFirebase();

// Get current user's token
getFirebaseToken();

// Get current user
getCurrentFirebaseUser();

// Subscribe to auth state changes
onAuthStateChange(callback);
```

---

## 🔧 Configuration

### Frontend Environment Variables

Add to `.env.local` (optional, already hardcoded):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCA1p_WyJ7m3j97HnjKA05EPRq5001LT2k
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=radeo-2026.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=radeo-2026
```

### Backend Environment Variables

Add to `.env`:

```env
# Firebase Admin SDK
FIREBASE_PROJECT_ID=radeo-2026

# Optional: For production
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@radeo-2026.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Getting Service Account Key (Production)

1. Go to Firebase Console → **Project Settings**
2. Navigate to **Service accounts** tab
3. Click **Generate new private key**
4. Download JSON file
5. Extract `client_email` and `private_key`
6. Add to `.env` file

---

## 🧪 Testing

### Email Authentication Test

1. Visit `/auth/firebase-login`
2. Select **Email** tab
3. Click "Sign Up" to create account
4. Enter:
   - Name: Test User
   - Email: test@example.com
   - Password: test123
   - Confirm: test123
5. Click "Create Account"
6. Check email for verification link
7. Click verification link
8. Return to login page
9. Login with email/password

### Phone Authentication Test

1. Visit `/auth/firebase-login`
2. Select **Phone** tab
3. Select country code: **+91** (India)
4. Enter phone: `9876543210`
5. Complete reCAPTCHA
6. Click "Send OTP"
7. Check SMS for 6-digit code
8. Enter OTP
9. Click "Verify & Sign In"

### Test Phone Numbers (Development)

Add test numbers in Firebase Console:

- Phone: `+1 650-555-3434` / Code: `123456`
- Phone: `+91 99999 99999` / Code: `123456`

---

## 🚨 Error Handling

### Common Errors

#### Email Authentication

```
auth/email-already-in-use → "This email is already registered"
auth/invalid-email → "Invalid email address"
auth/weak-password → "Password is too weak. Use at least 6 characters"
auth/user-not-found → "No account found with this email"
auth/wrong-password → "Incorrect password"
auth/invalid-credential → "Invalid email or password"
```

#### Phone Authentication

```
auth/invalid-phone-number → "Invalid phone number format"
auth/quota-exceeded → "SMS quota exceeded. Try again later"
auth/too-many-requests → "Too many attempts. Try again later"
auth/invalid-verification-code → "Invalid OTP. Please check and try again"
auth/code-expired → "OTP has expired. Request a new one"
```

### Error Display

All errors are automatically shown via `react-hot-toast`:

- ✅ Success messages (green)
- ❌ Error messages (red)
- ℹ️ Info messages (blue)

---

## 🔒 Security Considerations

### Frontend

- ✅ Firebase SDK handles token management
- ✅ reCAPTCHA prevents bot abuse
- ✅ Email verification required for email auth
- ✅ Phone verification via OTP
- ✅ Tokens stored securely (Firebase handles this)

### Backend

- ✅ Firebase Admin SDK verifies all tokens
- ✅ Invalid tokens rejected immediately
- ✅ Blocked users cannot authenticate
- ✅ JWT tokens with expiration
- ✅ Refresh tokens in httpOnly cookies
- ✅ Rate limiting on endpoints (recommended)

### Recommendations

1. **Enable reCAPTCHA Enterprise** for better bot protection
2. **Add rate limiting** to `/auth/firebase-login` endpoint
3. **Monitor Firebase usage** to prevent quota exhaustion
4. **Implement 2FA** for admin accounts
5. **Log all authentication attempts** for audit trail

---

## 📊 Database Schema Updates

### User Collection

```javascript
{
  _id: ObjectId("..."),
  name: "John Doe",
  email: "john@example.com",
  phone: "+919876543210",

  // Traditional auth
  passwordHash: "$2b$12$...",  // Optional for Firebase users

  // Firebase auth
  firebaseUid: "firebase_uid_123",
  authProvider: "phone",
  emailVerified: true,
  phoneVerified: true,
  profilePicture: "https://...",

  // Other fields
  role: "customer",
  isBlocked: false,
  addresses: [...],

  createdAt: ISODate("2026-02-09"),
  updatedAt: ISODate("2026-02-09")
}
```

### Indexes Required

```javascript
// Add these indexes for performance
db.users.createIndex({ firebaseUid: 1 }, { unique: true, sparse: true });
db.users.createIndex({ phone: 1 }, { unique: true, sparse: true });
db.users.createIndex({ email: 1 }, { unique: true });
```

---

## 🎯 Usage Examples

### Checking Auth State

```javascript
import {
  getCurrentFirebaseUser,
  onAuthStateChange,
} from "@/utils/firebaseAuth";

// Get current user
const user = getCurrentFirebaseUser();
if (user) {
  console.log("User logged in:", user.email);
}

// Listen to auth changes
const unsubscribe = onAuthStateChange((user) => {
  if (user) {
    console.log("User logged in:", user);
  } else {
    console.log("User logged out");
  }
});

// Cleanup
unsubscribe();
```

### Getting User Token

```javascript
import { getFirebaseToken } from "@/utils/firebaseAuth";

const token = await getFirebaseToken();
if (token) {
  // Use token for API calls
  console.log("Firebase token:", token);
}
```

### Logout

```javascript
import { logoutFirebase } from "@/utils/firebaseAuth";

const handleLogout = async () => {
  const result = await logoutFirebase();
  if (result.success) {
    // Redirect to home or login
    router.push("/");
  }
};
```

---

## 🐛 Troubleshooting

### Issue: reCAPTCHA not appearing

**Solution:** Ensure `<div id="recaptcha-container"></div>` exists in DOM before calling `setupRecaptcha()`

### Issue: OTP not received

**Solutions:**

1. Check phone number format: `+91XXXXXXXXXX`
2. Verify Firebase Phone Auth is enabled
3. Check Firebase SMS quota (free: 10/day)
4. Try test phone numbers first

### Issue: Email verification link not working

**Solutions:**

1. Check spam folder
2. Verify `authDomain` in Firebase config
3. Try resending verification email
4. Check Firebase email templates

### Issue: Backend token verification fails

**Solutions:**

1. Ensure Firebase Admin SDK is initialized
2. Check Firebase project ID matches
3. Verify service account credentials
4. Check token hasn't expired

### Issue: User created in Firebase but not in database

**Solutions:**

1. Check backend `/auth/firebase-login` endpoint
2. Verify API call is being made
3. Check console for errors
4. Ensure MongoDB connection is active

---

## 📈 Analytics & Monitoring

### Track Auth Events

Firebase automatically tracks:

- Sign-ins
- Sign-ups
- Email verifications
- Password resets

View in Firebase Console → **Analytics** → **Events**

### Custom Events

Add to your components:

```javascript
import { analytics } from "@/config/firebase";
import { logEvent } from "firebase/analytics";

// Track successful login
logEvent(analytics, "login", {
  method: "email", // or 'phone'
});

// Track registration
logEvent(analytics, "sign_up", {
  method: "email",
});
```

---

## 🚀 Next Steps

### Enhancements to Consider

1. **Social Login**
   - Add Google Sign-In
   - Add Facebook Login
   - Add Apple Sign-In

2. **Multi-Factor Authentication**
   - Require phone verification after email login
   - Send OTP for sensitive operations

3. **Profile Management**
   - Update email (requires reverification)
   - Change phone number
   - Upload profile picture

4. **Admin Features**
   - View Firebase users in admin panel
   - Disable/enable users
   - Reset user passwords
   - View login history

5. **Better UX**
   - Remember last auth method
   - Auto-fill phone number
   - Biometric authentication (fingerprint/face)
   - Magic link login

---

## 📚 Resources

- [Firebase Auth Docs](https://firebase.google.com/docs/auth)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Phone Auth Guide](https://firebase.google.com/docs/auth/web/phone-auth)
- [reCAPTCHA v2](https://developers.google.com/recaptcha/docs/display)

---

## ✅ Testing Checklist

- [ ] Email registration works
- [ ] Email verification link received
- [ ] Login with verified email works
- [ ] Password reset email received
- [ ] Reset password link works
- [ ] Phone OTP sent successfully
- [ ] OTP verification works
- [ ] User created in database
- [ ] JWT tokens generated
- [ ] Session persists after refresh
- [ ] Logout works properly
- [ ] Blocked users rejected
- [ ] Traditional login still works
- [ ] Firebase link visible on login page

---

## 🎉 Conclusion

You now have a complete Firebase authentication system with:

- ✅ Email/Password authentication
- ✅ Phone/OTP authentication
- ✅ Seamless backend integration
- ✅ User verification
- ✅ Error handling
- ✅ Security best practices

**Access Firebase Auth:** Navigate to `/auth/firebase-login`

**Test the system** and let me know if you need any adjustments! 🚀
