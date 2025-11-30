import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  // Use your hardcoded keys here if .env is still giving you trouble, 
  // otherwise use process.env.NEXT_PUBLIC_...
  apiKey: "AIzaSyB6QBAVfrdL0BhZ3FU-11uYvxTGt3ixalQ",
  authDomain: "glamops-8d0dd.firebaseapp.com",
  projectId: "glamops-8d0dd",
  storageBucket: "glamops-8d0dd.firebasestorage.app",
  messagingSenderId: "685092597446",
  appId: "1:685092597446:web:f5389e9a106d2dfe7b31c7",
  measurementId: "G-9HEZ0T3V6T"
};

// 1. Initialize App (Singleton Pattern)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// 2. Initialize Services
const auth = getAuth(app);
const db = getFirestore(app); // <--- THIS WAS LIKELY MISSING
const googleProvider = new GoogleAuthProvider();

// 3. Export them so other files can use them
export { app, auth, db, googleProvider };