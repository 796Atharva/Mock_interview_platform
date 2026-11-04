import React, { useState } from "react";
import { useAuth } from "../firebase/AuthContext";
import { X, Mail, Lock, User, Sparkles, CheckCircle2 } from "lucide-react";
import "./AuthModal.css";

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const { login, signup, loginWithGoogle, firebaseActive } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      if (isSignUp) {
        await signup(email.trim(), password, name.trim());
      } else {
        await login(email.trim(), password);
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Auth error:", err);
      let msg = err.message || "Authentication failed.";
      if (msg.includes("auth/invalid-credential") || msg.includes("auth/wrong-password")) {
        msg = "Invalid email or password.";
      } else if (msg.includes("auth/email-already-in-use")) {
        msg = "An account with this email already exists.";
      } else if (msg.includes("auth/weak-password")) {
        msg = "Password should be at least 6 characters.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      setLoading(true);
      setError("");
      await loginWithGoogle();
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Google auth error:", err);
      setError(err.message || "Failed to sign in with Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    try {
      setLoading(true);
      setError("");
      await login("candidate@interviewai.dev", "demo123456");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to sign in as demo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={18} />
        </button>

        <div className="auth-header">
          <div className="auth-badge">
            <Sparkles size={14} />
            <span>Firebase Authentication</span>
          </div>
          <h2>{isSignUp ? "Create Your Account" : "Welcome Back"}</h2>
          <p>
            {isSignUp
              ? "Join InterviewAI to analyze resumes, track mock interviews & access AI mentors."
              : "Sign in to access your interview reports, career guidance, and mentor chats."}
          </p>
        </div>

        {error && (
          <div className="auth-error-banner">
            <span>!</span>
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {isSignUp && (
            <div className="auth-field">
              <label>Full Name</label>
              <div className="auth-input-wrapper">
                <User size={16} className="auth-icon" />
                <input
                  type="text"
                  placeholder="e.g. Atharva Sanganwar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <div className="auth-field">
            <label>Email Address</label>
            <div className="auth-input-wrapper">
              <Mail size={16} className="auth-icon" />
              <input
                type="email"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label>Password</label>
            <div className="auth-input-wrapper">
              <Lock size={16} className="auth-icon" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
          </button>
        </form>

        <div className="auth-divider">
          <span>or continue with</span>
        </div>

        <div className="auth-social-buttons">
          <button
            type="button"
            className="auth-google-btn"
            onClick={handleGoogle}
            disabled={loading}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <button
            type="button"
            className="auth-demo-btn"
            onClick={handleDemoSignIn}
            disabled={loading}
          >
            <CheckCircle2 size={16} />
            <span>Quick Demo Sign In</span>
          </button>
        </div>

        <div className="auth-footer-toggle">
          {isSignUp ? (
            <p>
              Already have an account?{" "}
              <button type="button" onClick={() => setIsSignUp(false)}>
                Sign In
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{" "}
              <button type="button" onClick={() => setIsSignUp(true)}>
                Sign Up
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
