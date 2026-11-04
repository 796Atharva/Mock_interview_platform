import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged
} from "firebase/auth";

// Read Firebase config from environment variables or localStorage
export function getFirebaseConfig() {
  return {
    apiKey:
      localStorage.getItem("FIREBASE_API_KEY") ||
      import.meta.env.VITE_FIREBASE_API_KEY ||
      "",
    authDomain:
      localStorage.getItem("FIREBASE_AUTH_DOMAIN") ||
      import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
      "",
    projectId:
      localStorage.getItem("FIREBASE_PROJECT_ID") ||
      import.meta.env.VITE_FIREBASE_PROJECT_ID ||
      "",
    storageBucket:
      localStorage.getItem("FIREBASE_STORAGE_BUCKET") ||
      import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
      "",
    messagingSenderId:
      localStorage.getItem("FIREBASE_MESSAGING_SENDER_ID") ||
      import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
      "",
    appId:
      localStorage.getItem("FIREBASE_APP_ID") ||
      import.meta.env.VITE_FIREBASE_APP_ID ||
      ""
  };
}

let app = null;
let auth = null;
let googleProvider = null;

export function isFirebaseConfigured() {
  const config = getFirebaseConfig();
  return Boolean(config.apiKey && config.projectId);
}

export function initFirebase() {
  const config = getFirebaseConfig();

  if (config.apiKey && config.projectId) {
    try {
      app = getApps().length > 0 ? getApp() : initializeApp(config);
      auth = getAuth(app);
      googleProvider = new GoogleAuthProvider();
      return { app, auth, googleProvider, configured: true };
    } catch (err) {
      console.warn("Firebase initialization warning:", err);
    }
  }

  return { app: null, auth: null, googleProvider: null, configured: false };
}

// Initial attempt
const firebaseInstance = initFirebase();
auth = firebaseInstance.auth;
googleProvider = firebaseInstance.googleProvider;

export { auth, googleProvider };
