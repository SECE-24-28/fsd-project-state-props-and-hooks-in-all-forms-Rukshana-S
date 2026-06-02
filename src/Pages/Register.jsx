import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Assets/Css/auth.css";
import { adminBgStyle } from "../utils/adminBgStyle";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", agreed: false });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirm) { setError("Please fill in all fields."); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (!form.agreed) { setError("Please accept the Privacy Policy and Terms & Conditions."); return; }
    localStorage.setItem("wearly_registered_user", JSON.stringify({ name: form.name, email: form.email, password: form.password }));
    setSuccess(true);
    setTimeout(() => navigate("/login"), 2000);
  };

  return (
    <div className="auth-page" style={adminBgStyle}>
      <div className="auth-page-brand" onClick={() => navigate("/")}>WEARLY</div>
      <div className="auth-card premium-card">
        <div className="auth-header">
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join the WEARLY family today</p>
        </div>
        {success ? (
          <div className="success-card">
            <h4>Account Created! 🎉</h4>
            <p>Redirecting you to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-wrapper">
                <input type="text" placeholder="Your full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <input type="password" placeholder="Min. 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-wrapper">
                <input type="password" placeholder="Repeat your password" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="terms-checkbox-label">
                <input
                  type="checkbox"
                  checked={form.agreed}
                  onChange={e => setForm({ ...form, agreed: e.target.checked })}
                />
                <span>
                  I agree to the{" "}
                  <Link to="/privacy-policy" target="_blank" className="terms-link">Privacy Policy</Link>
                  {" "}&amp;{" "}
                  <Link to="/terms" target="_blank" className="terms-link">Terms &amp; Conditions</Link>
                </span>
              </label>
            </div>
            {error && <div className="auth-error">{error}</div>}
            <button type="submit" className="btn-primary auth-btn">Create Account</button>
          </form>
        )}
        <p className="auth-footer">Already have an account? <Link to="/login">Login here</Link></p>
      </div>
    </div>
  );
}
