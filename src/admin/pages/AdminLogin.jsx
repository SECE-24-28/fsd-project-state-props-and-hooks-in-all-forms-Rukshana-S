import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import "../admin.css";
import "../styles/AdminLogin.css";
import adminBg from "../../Assets/images/admin_background.png";

export default function AdminLogin() {
  const { adminLogin, adminSession } = useAdmin();
  const navigate = useNavigate();
  const [form, setForm]         = useState({ email: "", password: "", remember: false });
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Auto-redirect if already logged in (Step 5)
  useEffect(() => {
    if (!adminSession) return;
    const role = (adminSession.role || "").toLowerCase().replace(/_/g, "-");
    if (role.includes("super")) navigate("/admin/dashboard",       { replace: true });
    else                        navigate("/store-admin/dashboard", { replace: true });
  }, [adminSession, navigate]);

  const handle = (e) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) return setError("Please fill in all fields.");
    setLoading(true);
    setTimeout(() => {
      const role = adminLogin(form.email, form.password);
      setLoading(false);
      if (!role) {
        setError("Invalid credentials or account is inactive.");
        return;
      }
      const r = (role || "").toLowerCase().replace(/_/g, "-");
      if (r.includes("super")) navigate("/admin/dashboard");
      else                     navigate("/store-admin/dashboard");
    }, 400);
  };

  return (
    <div className="adm-login-page" style={{ backgroundImage: `url(${adminBg})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", minHeight: "100vh" }}>
      <div className="adm-login-brand">
        <span className="adm-login-logo">WEARLY</span>
        <span className="adm-login-tagline">Admin Portal</span>
      </div>

      <div className="adm-login-card">
        <div className="adm-login-header">
          <h1 className="adm-login-title">Welcome Back</h1>
          <p className="adm-login-sub">Sign in to your admin dashboard</p>
        </div>

        {error && <div className="adm-alert adm-alert-error">{error}</div>}

        <form onSubmit={submit} className="adm-login-form">
          <div className="adm-form-group">
            <label className="adm-label">Email Address</label>
            <input
              className="adm-input" type="email" name="email"
              placeholder="admin@wearly.com" value={form.email}
              onChange={handle} autoComplete="email"
            />
          </div>

          <div className="adm-form-group">
            <label className="adm-label">Password</label>
            <div className="adm-input-wrap">
              <input
                className="adm-input" type={showPass ? "text" : "password"} name="password"
                placeholder="Enter password" value={form.password}
                onChange={handle} autoComplete="current-password"
              />
              <button type="button" className="adm-eye-btn" onClick={() => setShowPass(s => !s)}>
                {showPass ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="adm-login-row">
            <label className="adm-checkbox-label">
              <input type="checkbox" name="remember" checked={form.remember} onChange={handle} />
              <span>Remember me</span>
            </label>
            <button type="button" className="adm-link-btn">Forgot password?</button>
          </div>

          <button type="submit" className="adm-btn adm-btn-primary adm-btn-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div className="adm-login-hint">
          <div>Super Admin: rukshana@gmail.com / admin</div>
          <div>Store Admin: storeadmin@wearly.com / store123</div>
        </div>
      </div>
    </div>
  );
}
