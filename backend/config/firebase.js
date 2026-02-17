/**
 * Firebase Admin SDK Configuration
 * For verifying Firebase ID tokens on the backend
 */

const admin = require("firebase-admin");
const path = require("path");

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Option 1: Use service account JSON file (recommended for production)
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

    if (serviceAccountPath) {
      const serviceAccount = require(path.resolve(serviceAccountPath));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id,
      });
      console.log("✅ Firebase Admin initialized with service account file");
    }
    // Option 2: Use individual environment variables
    else if (
      process.env.FIREBASE_PRIVATE_KEY &&
      process.env.FIREBASE_CLIENT_EMAIL
    ) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID || "webazaar-62921",
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
        }),
      });
      console.log("✅ Firebase Admin initialized with environment variables");
    }
    // Option 3: Fallback for development (limited functionality)
    else {
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || "webazaar-62921",
      });
      console.log(
        "⚠️  Firebase Admin initialized without credentials (limited functionality)",
      );
    }
  } catch (error) {
    console.error("❌ Firebase Admin initialization error:", error);
  }
}

module.exports = admin;
