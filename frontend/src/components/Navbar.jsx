import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../firebase/AuthContext";
import {
  Compass,
  MessageSquare,
  Mic,
  LogIn,
  LogOut,
  Sparkles,
  ChevronDown
} from "lucide-react";
import AuthModal from "./AuthModal";
import "./Navbar.css";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const [authOpen, setAuthOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      <nav className="global-navbar">
        <div className="navbar-container">
          {/* Brand */}
          <Link to="/" className="navbar-brand">
            <div className="navbar-logo-mark">
              <Sparkles size={16} />
            </div>
            <span className="navbar-brand-name">
              Interview<span className="navbar-brand-accent">AI</span>
            </span>
            <span className="navbar-badge">PRO</span>
          </Link>

          {/* Navigation Links */}
          <div className="navbar-links">
            <Link
              to="/upload"
              className={`navbar-link ${isActive("/upload") || isActive("/interview") ? "active" : ""}`}
            >
              <Mic size={16} />
              <span>Mock Interview</span>
            </Link>

            <Link
              to="/career-guidance"
              className={`navbar-link ${isActive("/career-guidance") ? "active" : ""}`}
            >
              <Compass size={16} />
              <span>Career Guidance</span>
            </Link>

            <Link
              to="/mentor-chat"
              className={`navbar-link ${isActive("/mentor-chat") ? "active" : ""}`}
            >
              <MessageSquare size={16} />
              <span>Mentor Chat</span>
            </Link>
          </div>

          {/* Right Actions */}
          <div className="navbar-actions">
            {/* Auth section */}
            {currentUser ? (
              <div className="user-dropdown-container">
                <button
                  className="user-profile-trigger"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <div className="user-avatar">
                    {currentUser.photoURL ? (
                      <img src={currentUser.photoURL} alt={currentUser.displayName} />
                    ) : (
                      <span>{currentUser.displayName?.charAt(0)?.toUpperCase() || "U"}</span>
                    )}
                  </div>
                  <span className="user-name">{currentUser.displayName}</span>
                  <ChevronDown size={14} className={userMenuOpen ? "rotated" : ""} />
                </button>

                {userMenuOpen && (
                  <div className="user-dropdown-menu">
                    <div className="user-menu-header">
                      <strong>{currentUser.displayName}</strong>
                      <span>{currentUser.email}</span>
                      {currentUser.isDemo && (
                        <span className="demo-tag">Demo Session</span>
                      )}
                    </div>
                    <div className="user-menu-divider" />
                    <button
                      className="user-menu-item"
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate("/career-guidance");
                      }}
                    >
                      <Compass size={15} />
                      <span>Career Path Insights</span>
                    </button>
                    <button
                      className="user-menu-item"
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate("/mentor-chat");
                      }}
                    >
                      <MessageSquare size={15} />
                      <span>Chat with Alex (Mentor)</span>
                    </button>
                    <div className="user-menu-divider" />
                    <button
                      className="user-menu-item logout"
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                    >
                      <LogOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="navbar-signin-btn" onClick={() => setAuthOpen(true)}>
                <LogIn size={15} />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
