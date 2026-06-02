import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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

function Toast({ message, onClose }) {
  React.useEffect(() => { const t = setTimeout(onClose, 2500); return () => clearTimeout(t); }, [onClose]);
  return <div className="auth-toast auth-toast-success"><span>✓</span>{message}</div>;
}

function validate(form) {
  const e = {};
  if (!form.name.trim()) e.name = "Full name is required.";
  else if (form.name.trim().length < 3) e.name = "Name must be at least 3 characters.";
  if (!form.email.trim()) e.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Enter a valid email address.";
  if (!form.phone.trim()) e.phone = "Phone number is required.";
  else if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ""))) e.phone = "Enter a valid 10-digit phone number.";
  if (!form.password) e.password = "Password is required.";
  else if (form.password.length < 6) e.password = "Password must be at least 6 characters.";
  else if (!/[A-Z]/.test(form.password)) e.password = "Password must contain at least 1 uppercase letter.";
  else if (!/[a-z]/.test(form.password)) e.password = "Password must contain at least 1 lowercase letter.";
  else if (!/[0-9]/.test(form.password)) e.password = "Password must contain at least 1 number.";
  if (!form.confirm) e.confirm = "Please confirm your password.";
  else if (form.confirm !== form.password) e.confirm = "Passwords do not match.";
  return e;
}

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [errs, setErrs] = useState({});
  const [show, setShow] = useState({ password: false, confirm: false });
  const [toast, setToast] = useState(false);

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrs(e => ({ ...e, [key]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validate(form);
    if (Object.keys(errors).length) { setErrs(errors); return; }
    try {
      const users = JSON.parse(localStorage.getItem("users")) || [];
      if (users.find(u => u.email.toLowerCase() === form.email.toLowerCase().trim())) {
        setErrs({ email: "An account with this email already exists." }); return;
      }
      users.push({
        id: Date.now(), name: form.name.trim(), email: form.email.toLowerCase().trim(),
        phone: form.phone.trim(), password: form.password, role: "customer", status: "active",
        registeredAt: new Date().toISOString(),
      });
      localStorage.setItem("users", JSON.stringify(users));
    } catch { setErrs({ general: "Registration failed. Please try again." }); return; }
    setToast(true);
    setTimeout(() => navigate("/login"), 2200);
  };

  const fields = [
    { key: "name",     label: "Full Name",        type: "text",     placeholder: "Your full name",         eye: false },
    { key: "email",    label: "Email Address",     type: "email",    placeholder: "you@example.com",        eye: false },
    { key: "phone",    label: "Phone Number",      type: "tel",      placeholder: "10-digit mobile number", eye: false },
    { key: "password", label: "Password",          type: "password", placeholder: "Min. 6 characters",      eye: true  },
    { key: "confirm",  label: "Confirm Password",  type: "password", placeholder: "Repeat your password",   eye: true  },
  ];

  return (
    <div className="auth-page" style={adminBgStyle}>
      {toast && <Toast message="Account created successfully!" onClose={() => setToast(false)} />}
      <div className="auth-page-brand" onClick={() => navigate("/")}>WEARLY</div>
      <div className="auth-card premium-card">
        <div className="auth-header">
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join the WEARLY family today</p>
        </div>

        {toast ? (
          <div className="success-card">
            <h4>Account Created! 🎉</h4>
            <p>Redirecting you to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {fields.map(({ key, label, type, placeholder, eye }) => (
              <div className="form-group" key={key}>
                <label className="form-label">{label}</label>
                <div className={`input-wrapper${eye ? " input-with-eye" : ""}${errs[key] ? " input-error" : ""}`}>
                  <input
                    type={eye ? (show[key] ? "text" : "password") : type}
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={e => set(key, e.target.value)}
                    autoComplete={key === "confirm" ? "new-password" : key === "password" ? "new-password" : key}
                  />
                  {eye && (
                    <button type="button" className="eye-btn" onClick={() => setShow(s => ({ ...s, [key]: !s[key] }))} tabIndex={-1}>
                      {show[key] ? <EyeClosed /> : <EyeOpen />}
                    </button>
                  )}
                </div>
                {errs[key] && <p className="field-error">{errs[key]}</p>}
              </div>
            ))}

            {errs.general && <div className="auth-error">{errs.general}</div>}
            <button type="submit" className="btn-primary auth-btn">Create Account</button>
          </form>
        )}
        <p className="auth-footer">Already have an account? <Link to="/login">Login here</Link></p>
      </div>
    </div>
  );
}
