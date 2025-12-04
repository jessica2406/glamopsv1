import admin from "firebase-admin";

// Use a separate variable to check if the app has already been initialized
// This prevents crashes in development environments where hot-reloading might try to initialize twice.
if (!admin.apps.length) {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const projectId = process.env.FIREBASE_PROJECT_ID;

  // --- CRITICAL CONFIGURATION CHECKS ---
  if (!serviceAccountJson) {
    // The error you saw is thrown here if the JSON variable is missing or empty.
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not set or is empty. Please check your .env.local file formatting.");
  }
  if (!projectId) {
    throw new Error("FIREBASE_PROJECT_ID is not set in .env.local.");
  }

  try {
    const serviceAccount = JSON.parse(serviceAccountJson);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: projectId,
      // Optional: Add databaseURL if you use Realtime Database, otherwise it's fine.
    });
    console.log("Firebase Admin SDK initialized successfully.");

  } catch (e) {
    // This catches errors if JSON.parse(serviceAccountJson) fails, 
    // which confirms your single-line formatting of the JSON is still incorrect.
    console.error("Error parsing FIREBASE_SERVICE_ACCOUNT_JSON:", e);
    throw new Error("Failed to parse Firebase Service Account JSON. Ensure it is a single-line string wrapped in single quotes.");
  }
}

export const firestore = admin.firestore();
export const FieldValue = admin.firestore.FieldValue;