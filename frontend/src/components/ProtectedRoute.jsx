import React, { useState, useEffect } from "react";
import { useAuth } from "../firebase/AuthContext";
import AuthModal from "./AuthModal";
import "./ProtectedRoute.css";

/**
 * ProtectedRoute — wraps any page that requires authentication.
 * If the user is not logged in:
 *   - Shows a blurred overlay with the auth modal automatically opened
 *   - On successful login the overlay disappears and the page is revealed
 * If the user is logged in:
 *   - Renders children normally
 */
export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Auto-open auth modal when user is not authenticated
  useEffect(() => {
    if (!loading && !currentUser) {
      setShowAuthModal(true);
    }
  }, [loading, currentUser]);

  // Loading state
  if (loading) {
    return (
      <div className="protected-loading">
        <div className="protected-spinner" />
        <p>Verifying authentication…</p>
      </div>
    );
  }

  // Authenticated — render page
  if (currentUser) {
    return children;
  }

  // Not authenticated — show blocked screen with auth modal
  return (
    <div className="protected-blocked">
      <div className="protected-blocked-backdrop" />
      <div className="protected-blocked-content">
        <div className="protected-lock-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            <circle cx="12" cy="16" r="1" />
          </svg>
        </div>
        <h2>Authentication Required</h2>
        <p>Please sign in to access this feature.</p>
        <button
          className="protected-signin-btn"
          onClick={() => setShowAuthModal(true)}
        >
          Sign In to Continue
        </button>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
      />
    </div>
  );
}
