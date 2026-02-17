# Firebase Backend Configuration

## ✅ Setup Complete

The backend Firebase Admin SDK is now configured to use your service account credentials.

## Files Created/Modified

1. **backend/firebase-service-account.json** - Your service account credentials file
2. **backend/config/firebase.js** - Updated to support multiple credential methods
3. **backend/.env** - Added Firebase configuration variables
4. **.gitignore** - Added patterns to exclude service account files

## Configuration Methods

The backend supports three methods (in priority order):

### Method 1: Service Account File (Recommended for Local Development)

```env
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json
```

### Method 2: Environment Variables (For Production/Docker)

```env
FIREBASE_PROJECT_ID=weBazaar-2026
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@weBazaar-2026.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Method 3: Default (Development Only - Limited Functionality)

Uses only project ID, no token verification available.

## Security Measures Applied

✅ **backend/firebase-service-account.json** - Added to .gitignore
✅ **.env files** - Already excluded from git
✅ **Service account patterns** - Multiple patterns covered:

- `firebase-service-account.json`
- `*-firebase-adminsdk-*.json`
- `service-account*.json`

## Testing the Configuration

### 1. Start the backend server:

```bash
cd backend
npm start
```

You should see:

```
✅ Firebase Admin initialized with service account file
```

### 2. Test Firebase authentication flow:

On the frontend, go to: `http://localhost:3000/auth/firebase-login`

Try any authentication method (Email, Phone, or Google), then check backend logs for:

```
POST /api/v1/auth/firebase-login
User authenticated via Firebase: [uid]
```

### 3. Verify token verification:

The backend should successfully verify Firebase ID tokens and create/sync users in MongoDB.

## Production Deployment

For production environments (VPS, Docker, etc.):

### Option A: Using Service Account File

1. Copy `firebase-service-account.json` to your production server (securely via SCP/SFTP)
2. Set environment variable:
   ```bash
   FIREBASE_SERVICE_ACCOUNT_PATH=/path/to/firebase-service-account.json
   ```

### Option B: Using Environment Variables (Recommended for Docker)

Extract the credentials from the JSON file and set:

```bash
export FIREBASE_PROJECT_ID="weBazaar-2026"
export FIREBASE_CLIENT_EMAIL="firebase-adminsdk-fbsvc@weBazaar-2026.iam.gserviceaccount.com"
export FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCzNu6Qw4sfxWWg
...
-----END PRIVATE KEY-----"
```

**Important:** When using environment variables, the private key must include `\n` for newlines:

```
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----\n"
```

### Docker Compose Example:

```yaml
services:
  backend:
    environment:
      - FIREBASE_PROJECT_ID=weBazaar-2026
      - FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@weBazaar-2026.iam.gserviceaccount.com
      - FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----\n
```

## Security Best Practices

⚠️ **CRITICAL - Never commit service account files to git!**

1. ✅ Service account JSON is in .gitignore
2. ✅ Environment variables are excluded from git
3. ⚠️ Always use HTTPS in production for API calls
4. ⚠️ Rotate service account keys periodically in Firebase Console
5. ⚠️ Use separate service accounts for development and production

## Verify .gitignore Protection

Before committing any changes:

```bash
git status
```

You should **NOT** see:

- `backend/firebase-service-account.json`
- Any `*-firebase-adminsdk-*.json` files
- `.env` files

If you see these files, they're not properly excluded!

## Firebase Console Setup

Ensure these are enabled in Firebase Console:

1. **Authentication Providers:**
   - ✅ Email/Password
   - ✅ Phone (with reCAPTCHA v2)
   - ⏳ Google Sign-In (needs configuration)

2. **Authorized Domains:**
   - Add your production domain
   - Add localhost for development

3. **OAuth Redirect URIs** (for Google Sign-In):
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)

## Troubleshooting

### Error: "Firebase Admin initialization error"

- Check if service account file exists at specified path
- Verify JSON format is valid
- Check file permissions (readable)

### Error: "Invalid credentials"

- Verify service account is active in Firebase Console
- Check if private key is properly formatted (includes `\n` newlines)
- Ensure client email matches service account

### Error: "Token verification failed"

- Confirm Firebase project ID matches in both frontend and backend
- Check if user is properly authenticated on frontend
- Verify token is being sent in request body as `idToken`

### Backend logs show: "⚠️ Firebase Admin initialized without credentials"

- Service account path not found
- Environment variables not set
- Check `.env` file is loaded (using `dotenv`)

## Next Steps

1. ✅ Backend Firebase Admin SDK configured
2. ⏳ Enable Google Sign-In in Firebase Console
3. ⏳ Add Google OAuth redirect URIs
4. ⏳ Test complete authentication flows
5. ⏳ Deploy to production with secure credentials

## Additional Resources

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Service Account Key Management](https://cloud.google.com/iam/docs/creating-managing-service-account-keys)
- [Firebase Authentication Best Practices](https://firebase.google.com/docs/auth/admin/manage-users)

---

**Configuration completed at:** ${new Date().toISOString()}
**Project:** weBazaar-2026
**Service Account:** firebase-adminsdk-fbsvc@weBazaar-2026.iam.gserviceaccount.com
