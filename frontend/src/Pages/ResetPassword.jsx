import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../Assets/Css/auth.css";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const resetEmail = sessionStorage.getItem("wearly_reset_email");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.password || !form.confirm) { setError("Please fill in all fields."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }

    try {
      await api.post("/users/reset-password", { email: resetEmail, password: form.password });
      sessionStorage.removeItem("wearly_reset_email");
      setDone(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to reset password. Please try again.");
    }
  };

  if (!resetEmail) {
    return (
      <div className="auth-page">
        <div className="auth-page-brand" onClick={() => navigate("/")}>WEARLY</div>
        <div className="auth-card">
          <div className="auth-error" style={{ marginBottom: 0 }}>
            No reset request found. Please{" "}
            <Link to="/forgot-password" className="terms-link">request a new link</Link>.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-page-brand" onClick={() => navigate("/")}>WEARLY</div>
      <div className="auth-card">
        {done ? (
          <div className="success-card">
            <h4>Password Reset! 🎉</h4>
            <p>Your password has been updated. Redirecting you to login...</p>
          </div>
        ) : (
          <>
            <div className="auth-header">
              <h2 className="auth-title">Reset Password</h2>
              <p className="auth-subtitle">Choose a new password for your account</p>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div className="input-wrapper">
                  <input
                    type="password"
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setError(""); }}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="input-wrapper">
                  <input
                    type="password"
                    placeholder="Repeat your new password"
                    value={form.confirm}
                    onChange={e => { setForm(f => ({ ...f, confirm: e.target.value })); setError(""); }}
                  />
                </div>
              </div>
              {error && <div className="auth-error">{error}</div>}
              <button type="submit" className="btn-primary auth-btn">Reset Password</button>
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
