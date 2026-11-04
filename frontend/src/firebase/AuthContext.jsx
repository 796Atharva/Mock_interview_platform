import React, { createContext, useContext, useEffect, useState } from "react";
import {
  auth,
  googleProvider,
  isFirebaseConfigured,
  initFirebase
} from "./firebaseConfig";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [firebaseActive, setFirebaseActive] = useState(isFirebaseConfigured());

  // Check stored demo session or listen to Firebase
  useEffect(() => {
    let unsubscribe = () => {};

    if (auth && firebaseActive) {
      unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email?.split("@")[0] || "User",
            photoURL: user.photoURL || null,
            isDemo: false
          });
        } else {
          // Check for demo user fallback in localStorage
          const savedDemoUser = localStorage.getItem("DEMO_AUTH_USER");
          if (savedDemoUser) {
            try {
              setCurrentUser(JSON.parse(savedDemoUser));
            } catch {
              setCurrentUser(null);
            }
          } else {
            setCurrentUser(null);
          }
        }
        setLoading(false);
      });
    } else {
      // Demo / Local session mode
      const savedDemoUser = localStorage.getItem("DEMO_AUTH_USER");
      if (savedDemoUser) {
        try {
          setCurrentUser(JSON.parse(savedDemoUser));
        } catch {
          setCurrentUser(null);
        }
      }
      setLoading(false);
    }

    return () => unsubscribe();
  }, [firebaseActive]);

  // Sign In with Email & Password
  const login = async (email, password) => {
    if (auth && firebaseActive) {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userObj = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || email.split("@")[0],
        photoURL: user.photoURL,
        isDemo: false
      };
      setCurrentUser(userObj);
      return userObj;
    } else {
      // Demo login
      const demoUser = {
        uid: "demo-" + Date.now(),
        email: email,
        displayName: email.split("@")[0],
        photoURL: null,
        isDemo: true
      };
      localStorage.setItem("DEMO_AUTH_USER", JSON.stringify(demoUser));
      setCurrentUser(demoUser);
      return demoUser;
    }
  };

  // Sign Up with Email & Password
  const signup = async (email, password, displayName) => {
    if (auth && firebaseActive) {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      if (displayName) {
        await updateProfile(user, { displayName });
      }
      const userObj = {
        uid: user.uid,
        email: user.email,
        displayName: displayName || email.split("@")[0],
        photoURL: user.photoURL,
        isDemo: false
      };
      setCurrentUser(userObj);
      return userObj;
    } else {
      const demoUser = {
        uid: "demo-" + Date.now(),
        email: email,
        displayName: displayName || email.split("@")[0],
        photoURL: null,
        isDemo: true
      };
      localStorage.setItem("DEMO_AUTH_USER", JSON.stringify(demoUser));
      setCurrentUser(demoUser);
      return demoUser;
    }
  };

  // Sign In with Google
  const loginWithGoogle = async () => {
    if (auth && googleProvider && firebaseActive) {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const userObj = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email?.split("@")[0],
        photoURL: user.photoURL,
        isDemo: false
      };
      setCurrentUser(userObj);
      return userObj;
    } else {
      // Demo Google login
      const demoUser = {
        uid: "demo-google-" + Date.now(),
        email: "alex.engineer@example.com",
        displayName: "Alex Rivera",
        photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        isDemo: true
      };
      localStorage.setItem("DEMO_AUTH_USER", JSON.stringify(demoUser));
      setCurrentUser(demoUser);
      return demoUser;
    }
  };

  // Logout
  const logout = async () => {
    localStorage.removeItem("DEMO_AUTH_USER");
    if (auth && firebaseActive) {
      await firebaseSignOut(auth);
    }
    setCurrentUser(null);
  };

  // Reload / Re-check config
  const refreshConfig = () => {
    const instance = initFirebase();
    setFirebaseActive(instance.configured);
  };

  const value = {
    currentUser,
    loading,
    firebaseActive,
    login,
    signup,
    loginWithGoogle,
    logout,
    refreshConfig
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
