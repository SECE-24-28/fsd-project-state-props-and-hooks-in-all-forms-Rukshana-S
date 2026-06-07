import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import "./PendingSellerPage.css";
import "./RejectedPage.css";

export default function RejectedPage() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const status = (user?.status || "").toLowerCase();

  const [isResubmitting, setIsResubmitting] = useState(false);
  const [form, setForm] = useState({ storeName: "", brandName: "", phone: "", description: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/login", { replace: true }); return; }
    if (status === "approved") navigate("/store-admin/dashboard", { replace: true });
    if (status === "pending")  navigate("/store-admin/pending",   { replace: true });
  }, [user, status, loading, navigate]);

  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        storeName: user.storeName || "",
        brandName: user.brandName || "",
        phone:     user.phone     || "",
      }));
    }
  }, [user]);

  if (loading || !user || status !== "rejected") return null;

  const handleLogout = () => { logout(); navigate("/login"); };

  const handleResubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.storeName.trim()) errs.storeName = "Store name is required.";
    if (!form.brandName.trim()) errs.brandName  = "Brand name is required.";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      await api.put("/users/profile", {
        storeName: form.storeName.trim(),
        brandName: form.brandName.trim(),
        phone:     form.phone.trim(),
      });
      setSuccess("Application resubmitted! Please wait for admin approval.");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setErrors({ general: err?.response?.data?.message || "Resubmission failed. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: "" })); };

  return (
    <div className="psp-shell">
      <div className="psp-content">
        <div className="psp-brand" onClick={() => navigate("/")}>WEARLY</div>

        <div className="psp-card">
          {!isResubmitting ? (
            <>
              <div className="psp-icon-wrap" style={{ borderColor: "#fca5a5" }}>
                <div className="psp-icon-circle" style={{ background: "#fdf0f0", color: "#DC2626" }}>✕</div>
                <div className="psp-icon-ring" style={{ border: "2px solid rgba(220,38,38,0.15)" }} />
              </div>

              <h1 className="psp-title" style={{ color: "#b33a3a" }}>Application Rejected</h1>

              <div className="psp-status-badge" style={{ background: "#fdf0f0", color: "#DC2626", border: "1px solid #fca5a5" }}>
                <span className="psp-dot" style={{ background: "#DC2626" }} />Rejected
              </div>

              <div className="psp-reason-card">
                <p className="psp-reason-title">What happened?</p>
                <p className="psp-reason-text">
                  Your seller registration was reviewed and could not be approved. This may be due to incomplete business information.
                  Please resubmit with updated details or contact support.
                </p>
              </div>

              <div className="psp-divider" />

              <div className="psp-actions" style={{ flexDirection: "column", gap: "12px" }}>
                <button className="psp-btn psp-btn-dark" style={{ width: "100%", background: "#2f2f2f" }} onClick={() => setIsResubmitting(true)}>
                  Resubmit Application
                </button>
                <div style={{ display: "flex", gap: "12px", width: "100%" }}>
                  <button className="psp-btn psp-btn-outline" style={{ flex: 1 }} onClick={() => navigate("/")}>Browse Store</button>
                  <button className="psp-btn psp-btn-outline" style={{ flex: 1 }} onClick={handleLogout}>Logout</button>
                </div>
              </div>
            </>
          ) : (
            <form onSubmit={handleResubmit}>
              <h2 className="psp-title" style={{ fontSize: "1.45rem", marginBottom: "4px" }}>Resubmit Application</h2>
              <p className="psp-desc" style={{ marginBottom: "20px" }}>Update your store details and resubmit.</p>

              {success && <div className="auth-toast auth-toast-success" style={{ position: "static", transform: "none", margin: "0 0 16px", width: "100%" }}>{success}</div>}
              {errors.general && <div className="auth-error">{errors.general}</div>}

              {[
                { key: "storeName", label: "Store Name *",  placeholder: "e.g. Priya Boutique" },
                { key: "brandName", label: "Brand Name *",  placeholder: "e.g. Priya" },
                { key: "phone",     label: "Phone Number",  placeholder: "10-digit number" },
              ].map(({ key, label, placeholder }) => (
                <div className="form-group" key={key}>
                  <label className="form-label">{label}</label>
                  <div className={`input-wrapper${errors[key] ? " input-error" : ""}`}>
                    <input type="text" value={form[key]} placeholder={placeholder} onChange={e => set(key, e.target.value)} />
                  </div>
                  {errors[key] && <p className="field-error">{errors[key]}</p>}
                </div>
              ))}

              <div className="psp-actions" style={{ gap: "10px", marginTop: "16px" }}>
                <button type="button" className="psp-btn psp-btn-outline" style={{ flex: 1 }} onClick={() => setIsResubmitting(false)}>Back</button>
                <button type="submit" className="psp-btn psp-btn-dark" style={{ flex: 1, background: "#2f2f2f" }} disabled={submitting}>
                  {submitting ? "Submitting..." : "Resubmit"}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="psp-footer-note">
          Need help? <a href="mailto:hello@wearly.com">hello@wearly.com</a>
        </p>
      </div>
    </div>
  );
}
