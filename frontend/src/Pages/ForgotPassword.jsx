import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../Assets/Css/auth.css";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail]   = useState("");
  const [error, setError]   = useState("");
  const [sent, setSent]     = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError("Please enter your email address."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError("Enter a valid email address."); return; }
    setLoading(true);
    try {
      await api.post("/users/forgot-password", { email: email.trim().toLowerCase() });
      sessionStorage.setItem("wearly_reset_email", email.trim().toLowerCase());
      setSent(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg-page">
      <div className="auth-page-brand" onClick={() => navigate("/")}>WEARLY</div>
      <div className="auth-card premium-card">
        {sent ? (
          <div className="success-card">
            <h4>Check Your Email ✉️</h4>
            <p>If an account exists for <strong>{email}</strong>, a reset link has been sent.</p>
            <div style={{ marginTop: "20px" }}>
              <button className="btn-primary auth-btn" onClick={() => navigate("/login")}>← Back to Login</button>
            </div>
          </div>
        ) : (
          <>
            <div className="auth-header">
              <h2 className="auth-title">Forgot Password</h2>
              <p className="auth-subtitle">Enter your email and we'll help you reset it</p>
            </div>
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className={`input-wrapper${error ? " input-error" : ""}`}>
                  <input
                    type="email" placeholder="you@example.com" value={email}
                    onChange={e => { setEmail(e.target.value); setError(""); }}
                    autoComplete="email"
                  />
                </div>
                {error && <p className="field-error">{error}</p>}
              </div>
              <button type="submit" className="btn-primary auth-btn" disabled={loading}>
                {loading ? "Sending…" : "Send Reset Link"}
              </button>
            </form>
          </>
        )}
        <p className="auth-footer"><Link to="/login">← Back to Login</Link></p>
      </div>
    </div>
  );
}
