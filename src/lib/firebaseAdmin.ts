import admin from "firebase-admin";

// Ensure we don't crash the build if env vars are missing
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
const projectId = process.env.FIREBASE_PROJECT_ID;

if (!admin.apps.length) {
  try {
    if (!serviceAccountJson || !projectId) {
      // Logic: If we are in Vercel Build phase, just warn. Don't crash.
      // We check if we are in production but missing keys.
      if (process.env.NODE_ENV === 'production' && !serviceAccountJson) {
         console.warn("⚠️ BUILD WARNING: Firebase keys missing. Skipping init (this is fine during build).");
      } else {
         // In local dev, we want to know immediately.
         console.error("❌ LOCAL ERROR: Missing Firebase Env Vars.");
      }
    } else {
      // Clean and Parse
      const cleanedJson = serviceAccountJson.replace(/\\n/g, "\n");
      
      admin.initializeApp({
        credential: admin.credential.cert(JSON.parse(cleanedJson)),
        projectId: projectId,
      });
      console.log("✅ Firebase Admin initialized.");
    }
  } catch (error: any) {
    console.error("Firebase init error (Ignored during build):", error.message);
  }
}

// Safe Export: If init failed, create a dummy proxy to prevent import crashes
let firestore: FirebaseFirestore.Firestore;
try {
  firestore = admin.firestore();
} catch (e) {
  console.warn("⚠️ Firestore not available (Build phase).");
  firestore = {} as any; 
}

export { firestore };
export const FieldValue = admin.firestore?.FieldValue || {};