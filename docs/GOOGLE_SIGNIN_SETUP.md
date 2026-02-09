# Google Sign-In Setup Guide for Firebase

## 🎯 Overview

This guide will help you enable Google Sign-In using the OAuth Client ID from your screenshot.

**Client ID:** `1016544530927-4lr457bua5ittrmfcu44lrjqqp9jjmq.apps.googleusercontent.com`

---

## 📋 Step-by-Step Setup

### Step 1: Enable Google Sign-In in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **radeo-2026**
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **Google** in the providers list
5. Click **Enable** toggle to ON
6. You'll see two fields:

#### Configure Google Provider:

```
Web SDK configuration
├─ Web client ID: Automatically filled by Firebase
└─ Web client secret: Automatically filled by Firebase

Public-facing name for project: Radeo
Support email: your-email@example.com
```

### Step 2: Add Your OAuth Client ID (Important!)

⚠️ **You need to link your Google Cloud OAuth Client:**

1. In the Google provider settings, scroll down to **Web SDK configuration**
2. Click **Use a different Google Cloud project's OAuth client**
3. Enter your OAuth Client ID from the screenshot:
   ```
   1016544530927-4lr457bua5ittrmfcu44lrjqqp9jjmq.apps.googleusercontent.com
   ```
4. Click **Save**

### Step 3: Configure Authorized Domains

Firebase will automatically add these domains, but verify:

**For Development:**

- ✅ `localhost`
- ✅ `127.0.0.1`

**For Production:**

- ✅ `radeo-2026.firebaseapp.com`
- ✅ `radeo-2026.web.app`
- ➕ Add your production domain (e.g., `radeo.com`)

### Step 4: Add Authorized Redirect URIs in Google Cloud

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID: `1016544530927-4lr457bua5ittrmfcu44lrjqqp9jjmq`
4. Under **Authorized redirect URIs**, add:

```
https://radeo-2026.firebaseapp.com/__/auth/handler
https://radeo-2026.web.app/__/auth/handler
http://localhost:3000/__/auth/handler (for testing)
```

5. Click **Save**

---

## ⚙️ Environment Configuration

### Frontend Environment Variables

Create/update `.env.local` in your `frontend/` directory:

```env
# Firebase Config (already in code, but you can use env vars)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCA1p_WyJ7m3j97HnjKA05EPRq5001LT2k
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=radeo-2026.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=radeo-2026

# Google OAuth Client ID (from your screenshot)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=1016544530927-4lr457bua5ittrmfcu44lrjqqp9jjmq.apps.googleusercontent.com
```

**Note:** The Google Client ID is optional for frontend since Firebase handles it automatically. It's already configured in Firebase.

### Backend Environment Variables

**No additional env vars needed!**

The backend already verifies Firebase tokens, which includes Google sign-in users.

---

## 🔧 Optional: Use Environment Variables

If you want to use environment variables instead of hardcoded config:

### Update `frontend/src/config/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyCA1p_WyJ7m3j97HnjKA05EPRq5001LT2k",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "radeo-2026.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "radeo-2026",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "radeo-2026.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1016544530927",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:1016544530927:web:ed217482d6dc73192ba61a",
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-5PR3Z8K7YT",
};
```

---

## 🧪 Testing Google Sign-In

### Development Testing

1. **Start your app:**

   ```bash
   cd frontend
   npm run dev
   ```

2. **Visit:** `http://localhost:3000/auth/firebase-login`

3. **Click:** "Continue with Google" button

4. **Expected Flow:**
   ```
   1. Google popup appears
   2. Select/login with Google account
   3. Grant permissions
   4. Popup closes
   5. User logged in automatically
   6. Redirected to homepage
   ```

### Test with Different Scenarios

#### Scenario 1: New User

```
User: test.user@gmail.com (never signed up before)
Expected:
  ✅ Google popup opens
  ✅ User selects account
  ✅ New user created in MongoDB
  ✅ User logged in
  ✅ Profile picture from Google saved
```

#### Scenario 2: Existing User (Email)

```
User: john@example.com (already registered via email)
Expected:
  ✅ Google popup opens
  ✅ Sign in with john@example.com Google account
  ✅ Accounts linked automatically
  ✅ User logged in
```

#### Scenario 3: Popup Blocked

```
Browser blocks popup
Expected:
  ❌ Error: "Popup was blocked. Please allow popups for this site."
  🔧 Solution: Allow popups in browser settings
```

---

## 🔍 Verification Checklist

After setup, verify these:

### Firebase Console

- [ ] Google provider is **Enabled**
- [ ] OAuth client ID is configured
- [ ] Support email is set
- [ ] Authorized domains include localhost and production domains

### Google Cloud Console

- [ ] OAuth 2.0 Client ID exists
- [ ] Redirect URIs include Firebase handlers
- [ ] OAuth consent screen is configured
- [ ] Test users are added (if in testing mode)

### Your Application

- [ ] "Continue with Google" button appears
- [ ] Button is clickable and not disabled
- [ ] Google popup opens when clicked
- [ ] No console errors

---

## 🐛 Troubleshooting

### Error: "Popup blocked"

**Solution:** Check browser popup settings and allow popups for localhost/your domain

### Error: "unauthorized_client"

**Solution:**

1. Verify redirect URI in Google Cloud Console includes Firebase handler
2. Check that OAuth client ID matches in Firebase

### Error: "invalid_client"

**Solution:** Verify the OAuth client ID is correctly configured in Firebase

### Error: "auth/operation-not-allowed"

**Solution:** Enable Google provider in Firebase Console → Authentication → Sign-in method

### Error: "auth/unauthorized-domain"

**Solution:** Add your domain to Firebase authorized domains:

- Firebase Console → Authentication → Settings → Authorized domains

### Popup doesn't open

**Solutions:**

1. Check browser console for errors
2. Verify Firebase is initialized properly
3. Check that `auth` object exists in `firebase.js`

### User created but not logging in

**Solution:** Check backend `/auth/firebase-login` endpoint is working

---

## 📊 How It Works

### Authentication Flow:

```
┌─────────────────────┐
│  User clicks        │
│  "Google Sign-In"   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Google Popup       │
│  Opens              │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  User selects       │
│  Google Account     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Firebase verifies  │
│  with Google        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Firebase returns   │
│  ID Token           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Frontend sends     │
│  token to backend   │
│  /auth/firebase-    │
│  login              │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Backend verifies   │
│  token with         │
│  Firebase Admin SDK │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  User created/      │
│  found in MongoDB   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  JWT tokens         │
│  generated          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Session created    │
│  User logged in     │
└─────────────────────┘
```

### Data Extracted from Google:

When a user signs in with Google, Firebase provides:

```javascript
{
  uid: "google_user_id_123",
  email: "user@gmail.com",
  displayName: "John Doe",
  photoURL: "https://lh3.googleusercontent.com/...",
  emailVerified: true,
  providerData: [{
    providerId: "google.com",
    uid: "google_user_id_123",
    displayName: "John Doe",
    email: "user@gmail.com",
    photoURL: "https://..."
  }]
}
```

This data is sent to your backend and saved in MongoDB.

---

## 🔐 Security Considerations

### OAuth Consent Screen

Your OAuth consent screen shows:

- ✅ App name: "radeo-2026"
- ✅ User support email
- ⚠️ **Status:** Currently in "Testing" mode

**Testing Mode** means:

- Only test users can sign in
- No app verification required
- Limited to 100 test users

**To Go Live:**

1. Go to OAuth consent screen in Google Cloud
2. Click "PUBLISH APP"
3. Submit for verification (may take days/weeks)
4. Once approved, anyone with a Google account can sign in

### Test Users

While in testing mode, add test users:

1. Google Cloud Console → OAuth consent screen
2. Scroll to **Test users**
3. Click **+ ADD USERS**
4. Enter email addresses of testers
5. Save

### Privacy & Scopes

Your app requests:

- ✅ `email` - User's email address
- ✅ `profile` - User's basic profile info (name, photo)

These are **non-sensitive scopes** and don't require special verification.

---

## 🎨 UI Customization

### Change Button Text

In `firebase-login/page.jsx`:

```javascript
<button onClick={handleGoogleSignIn}>
  <FcGoogle className="w-5 h-5" />
  <span>Sign in with Google</span> {/* ← Change this */}
</button>
```

### Change Button Style

```javascript
className="w-full flex items-center justify-center gap-3 px-4 py-3
  bg-white border-2 border-blue-500 rounded-lg  {/* ← Customize */}
  hover:bg-blue-50 transition-all"
```

### Add Google Icon from react-icons

Already using: `FcGoogle` (colored Google icon)

Alternatives:

- `FaGoogle` - Monochrome Google logo
- `AiFillGoogleCircle` - Google in circle

---

## 📈 Analytics & Monitoring

### Track Google Sign-Ins

Firebase automatically tracks:

- ✅ Number of sign-ins
- ✅ Active users
- ✅ Provider breakdown (Google vs Email vs Phone)

View in: **Firebase Console → Analytics → Events**

### Custom Events

Add to track conversions:

```javascript
import { logEvent } from "firebase/analytics";
import { analytics } from "@/config/firebase";

// After successful Google login
logEvent(analytics, "login", {
  method: "google",
});
```

---

## ✅ Quick Setup Checklist

**Firebase Console:**

- [ ] Enable Google provider
- [ ] Add OAuth Client ID: `1016544530927-4lr457bua5ittrmfcu44lrjqqp9jjmq`
- [ ] Set support email
- [ ] Save settings

**Google Cloud Console:**

- [ ] Add redirect URIs (Firebase handlers)
- [ ] Configure OAuth consent screen
- [ ] Add test users (if in testing mode)

**Code (Already Done ✅):**

- [x] Google auth utilities added
- [x] Firebase login page updated
- [x] Google button implemented
- [x] Backend integration ready

**Testing:**

- [ ] Start dev server
- [ ] Visit `/auth/firebase-login`
- [ ] Click "Continue with Google"
- [ ] Verify login works
- [ ] Check user created in MongoDB

---

## 🚀 You're Ready!

Once you complete the Firebase Console setup:

1. **Enable Google in Firebase** ✅
2. **Add your OAuth Client ID** ✅
3. **Test the login flow** ✅

The code is already implemented and waiting! 🎉

---

## 📞 Need Help?

Common issues and quick fixes:

| Issue                     | Quick Fix                             |
| ------------------------- | ------------------------------------- |
| Popup blocked             | Allow popups in browser               |
| unauthorized_client       | Check redirect URIs in Google Cloud   |
| operation-not-allowed     | Enable Google in Firebase Console     |
| Only test users can login | Add user to test users OR publish app |

---

**Your OAuth Client ID is ready to use!** Just follow the Firebase Console steps above. 🔥
