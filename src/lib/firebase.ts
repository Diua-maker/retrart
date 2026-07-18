/**
 * Firebase Client SDK Initialization & Fallback Engine
 */
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import firebaseConfigDefault from "../../firebase-applet-config.json";

// Your web app's Firebase configuration (hardcoded fallback for seamless deployment)
const hardcodedConfig = {
  apiKey: "AIzaSyCxwaRwB4NPyUHB7jZUU9Wc5MFPGAU2LNQ",
  authDomain: "galeriapro-c7d01.firebaseapp.com",
  projectId: "galeriapro-c7d01",
  storageBucket: "galeriapro-c7d01.firebasestorage.app",
  messagingSenderId: "1037133167930",
  appId: "1:1037133167930:web:d36f60ec6e35fb0aaea403",
  firestoreDatabaseId: ""
};

// Allow override via environment variables for safe public repository deployment (GitHub)
const metaEnv = (import.meta as any).env || {};
const envConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY,
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID,
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: metaEnv.VITE_FIREBASE_APP_ID,
  firestoreDatabaseId: metaEnv.VITE_FIREBASE_DATABASE_ID,
};

const hasEnvConfig = !!(envConfig.apiKey && envConfig.projectId);
const config = hasEnvConfig ? envConfig : (hardcodedConfig.apiKey ? hardcodedConfig : firebaseConfigDefault);

let app;
let db: Firestore | null = null;
let auth: Auth | null = null;
let isFirebaseAvailable = false;

try {
  if (getApps().length === 0) {
    app = initializeApp(config);
  } else {
    app = getApp();
  }
  // Ensure that if the user's custom config doesn't have firestoreDatabaseId, we fall back to default Firestore
  const databaseId = (config as any).firestoreDatabaseId;
  if (databaseId) {
    db = getFirestore(app, databaseId);
  } else {
    db = getFirestore(app);
  }
  auth = getAuth(app);
  isFirebaseAvailable = true;
  console.log("Firebase initialized successfully with project ID:", config.projectId);
} catch (error) {
  console.warn("Firebase initialization failed, falling back to LocalStorage Database: ", error);
  isFirebaseAvailable = false;
}

export { app, db, auth, isFirebaseAvailable };
