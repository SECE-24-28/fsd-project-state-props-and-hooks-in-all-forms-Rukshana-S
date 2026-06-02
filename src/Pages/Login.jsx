import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import "../Assets/Css/auth.css";
import { adminBgStyle } from "../utils/adminBgStyle";

export default function Login() {
  const { login } = useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError("Please fill in all fields."); return; }
    const stored = JSON.parse(localStorage.getItem("wearly_registered_user") || "null");
    if (stored && stored.email === form.email && stored.password === form.password) {
      login({ name: stored.name, email: stored.email });
      navigate("/");
    } else {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div className="auth-page" style={adminBgStyle}>
      <div className="auth-page-brand" onClick={() => navigate("/")}>WEARLY</div>
      <div className="auth-card premium-card">
        <div className="auth-header">
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to your WEARLY account</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-wrapper">
              <input type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <input type="password" placeholder="Enter your password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
          </div>
          {error && <div className="auth-error">{error}</div>}
          <div style={{ textAlign: "right", marginBottom: "8px" }}>
            <Link to="/forgot-password" style={{ fontSize: "0.84rem", color: "#c4a0a6", fontWeight: 600, textDecoration: "none" }}>Forgot password?</Link>
          </div>
          <button type="submit" className="btn-primary auth-btn">Login</button>
        </form>
        <p className="auth-footer">Don't have an account? <Link to="/register">Register here</Link></p>
      </div>
    </div>
  );
}
