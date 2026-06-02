import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { useAdmin } from "../admin/context/AdminContext";
import "../Assets/Css/auth.css";
import { adminBgStyle } from "../utils/adminBgStyle";

const EyeOpen = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeClosed = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`auth-toast auth-toast-${type}`}>
      <span>{type === "success" ? "✓" : "✕"}</span>
      {message}
    </div>
  );
}

function validate(form) {
  const errs = {};
  if (!form.email.trim()) errs.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = "Enter a valid email address.";
  if (!form.password) errs.password = "Password is required.";
  else if (form.password.length < 6) errs.password = "Password must contain at least 6 characters.";
  else if (form.password.length > 20) errs.password = "Password must not exceed 20 characters.";
  return errs;
}

export default function Login() {
  const { login } = useStore();
  const { adminLogin, adminSession, adminLogout } = useAdmin();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [errs, setErrs] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (!adminSession) return;
    const role = (adminSession.role || "").toLowerCase().replace(/_/g, "-");
    if (role.includes("super")) navigate("/admin/dashboard", { replace: true });
    else if (role.includes("store")) navigate("/store-admin/dashboard", { replace: true });
  }, [adminSession, navigate]);

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrs(e => ({ ...e, [key]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validate(form);
    if (Object.keys(errors).length) { setErrs(errors); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const adminRole = adminLogin(form.email, form.password);
      if (adminRole) {
        setToast({ message: "Login successful!", type: "success" });
        setTimeout(() => {
          const r = adminRole.toLowerCase().replace(/_/g, "-");
          navigate(r.includes("super") ? "/admin/dashboard" : "/store-admin/dashboard");
        }, 600);
        return;
      }
      try {
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const found = users.find(
          u => u.email.toLowerCase() === form.email.toLowerCase().trim() &&
               u.password === form.password && (u.status || "active") === "active"
        );
        if (found) {
          login({ id: found.id, name: found.name, email: found.email, role: "customer" });
          setToast({ message: "Login successful!", type: "success" });
          setTimeout(() => navigate("/"), 600);
          return;
        }
      } catch { /* ignore */ }
      setErrs({ general: "Invalid credentials. Please check your email and password." });
    }, 400);
  };

  // Direct demo access — no form fill
  const demoLogin = (type) => {
    if (type === "customer") {
      login({ id: 100, name: "Demo Customer", email: "customer@wearly.com", role: "customer" });
      navigate("/");
    } else if (type === "super-admin") {
      adminLogout();
      const role = adminLogin("rukshana@gmail.com", "admin");
      if (role) navigate("/admin/dashboard");
    } else if (type === "store-admin") {
      adminLogout();
      const role = adminLogin("storeadmin@wearly.com", "store123");
      if (role) navigate("/store-admin/dashboard");
    }
  };

  const DEMOS = [
    { key: "customer",    label: "Try Customer Demo",    badge: "Customer",    badgeColor: "#059669", badgeBg: "#ebf8ee" },
    { key: "super-admin", label: "Try Super Admin Demo", badge: "Super Admin", badgeColor: "#7C3AED", badgeBg: "#f5f3ff" },
    { key: "store-admin", label: "Try Store Admin Demo", badge: "Store Admin", badgeColor: "#0891B2", badgeBg: "#f0f7ff" },
  ];

  return (
    <div className="auth-page" style={adminBgStyle}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="auth-page-brand" onClick={() => navigate("/")}>WEARLY</div>

      <div className="auth-card premium-card">
        <div className="auth-header">
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to your WEARLY account</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className={`input-wrapper${errs.email ? " input-error" : ""}`}>
              <input type="email" placeholder="you@example.com" value={form.email}
                onChange={e => set("email", e.target.value)} autoComplete="email" />
            </div>
            {errs.email && <p className="field-error">{errs.email}</p>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className={`input-wrapper input-with-eye${errs.password ? " input-error" : ""}`}>
              <input type={showPass ? "text" : "password"} placeholder="Enter your password"
                value={form.password} onChange={e => set("password", e.target.value)} autoComplete="current-password" />
              <button type="button" className="eye-btn" onClick={() => setShowPass(s => !s)} tabIndex={-1}>
                {showPass ? <EyeClosed /> : <EyeOpen />}
              </button>
            </div>
            {errs.password && <p className="field-error">{errs.password}</p>}
          </div>

          <div className="auth-row">
            <label className="auth-remember">
              <input type="checkbox" checked={form.remember} onChange={e => set("remember", e.target.checked)} />
              Remember me
            </label>
            <Link to="/forgot-password" className="auth-link-sm">Forgot password?</Link>
          </div>

          {errs.general && <div className="auth-error">{errs.general}</div>}

          <button type="submit" className="btn-primary auth-btn" disabled={loading}>
            {loading ? "Signing in…" : "Login"}
          </button>
        </form>

        {/* Demo Access */}
        <div className="demo-section">
          <p className="demo-heading">Demo Access</p>
          <div className="demo-buttons">
            {DEMOS.map(({ key, label, badge, badgeColor, badgeBg }) => (
              <button key={key} type="button" className="demo-btn" onClick={() => demoLogin(key)}>
                <span className="demo-btn-label">{label}</span>
                <span className="demo-badge" style={{ color: badgeColor, background: badgeBg }}>{badge}</span>
              </button>
            ))}
          </div>
          <p className="demo-note">Demo accounts are available for project evaluation and testing purposes.</p>
        </div>

        <p className="auth-footer">Don't have an account? <Link to="/register">Register here</Link></p>
      </div>
    </div>
  );
}
