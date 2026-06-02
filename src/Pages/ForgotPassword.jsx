import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Assets/Css/auth.css";
import { adminBgStyle } from "../utils/adminBgStyle";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) { setError("Please enter your email address."); return; }
    const stored = JSON.parse(localStorage.getItem("wearly_registered_user") || "null");
    if (!stored || stored.email !== email) { setError("No account found with that email address."); return; }
    localStorage.setItem("wearly_reset_email", email);
    setSent(true);
  };

  return (
    <div className="auth-page" style={adminBgStyle}>
      <div className="auth-page-brand" onClick={() => navigate("/")}>WEARLY</div>
      <div className="auth-card">
        {sent ? (
          <div className="success-card">
            <h4>Check Your Email ✉️</h4>
            <p>We've sent a password reset link to <strong>{email}</strong>.</p>
            <div style={{ marginTop: "20px" }}>
              <Link to="/reset-password" className="btn-primary auth-btn" style={{ display: "inline-flex", textDecoration: "none" }}>
                Reset Password →
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="auth-header">
              <h2 className="auth-title">Forgot Password</h2>
              <p className="auth-subtitle">Enter your email and we'll help you reset it</p>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(""); }}
                  />
                </div>
              </div>
              {error && <div className="auth-error">{error}</div>}
              <button type="submit" className="btn-primary auth-btn">Send Reset Link</button>
            </form>
          </>
        )}
        <p className="auth-footer">
          <Link to="/login">← Back to Login</Link>
        </p>
      </div>
    </div>
  );
}
