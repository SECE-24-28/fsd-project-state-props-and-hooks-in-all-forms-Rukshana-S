import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./PendingSellerPage.css";

const TIMELINE = [
  { icon: "✔", label: "Registration Completed",   desc: "Your seller account details have been submitted.", state: "done"   },
  { icon: "⏳", label: "Verification In Progress", desc: "Our team is reviewing your KYC documents.",        state: "active" },
  { icon: "🔒", label: "Dashboard Locked",          desc: "Store dashboard access is currently restricted.", state: "locked" },
  { icon: "🎉", label: "Access After Approval",     desc: "Full access granted once Super Admin approves.",  state: "locked" },
];

export default function PendingSellerPage() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const status = (user?.status || "").toLowerCase();

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/login", { replace: true }); return; }
    if (status === "approved") navigate("/store-admin/dashboard", { replace: true });
    if (status === "rejected") navigate("/store-admin/rejected",  { replace: true });
  }, [user, status, loading, navigate]);

  if (loading || !user || status !== "pending") return null;

  return (
    <div className="psp-shell">
      <div className="psp-content">
        <div className="psp-brand" onClick={() => navigate("/")}>WEARLY</div>

        <div className="psp-card">
          <div className="psp-icon-wrap">
            <div className="psp-icon-circle">⏳</div>
            <div className="psp-icon-ring" />
          </div>

          <h1 className="psp-title">Application Submitted Successfully</h1>
          <p className="psp-seller-name">{user.brandName || user.storeName || user.name}</p>

          <div className="psp-status-badge">
            <span className="psp-dot" />
            Pending Verification
          </div>

          <p className="psp-desc">
            Your seller account is currently under review by the WEARLY Super Admin.<br />
            Once approved, you will gain access to the complete Store Admin Dashboard.
          </p>

          <div className="psp-divider" />

          <div className="psp-timeline">
            {TIMELINE.map((step, i) => (
              <div key={i} className={`psp-step psp-step-${step.state}`}>
                <div className="psp-step-left">
                  <div className="psp-step-icon">{step.icon}</div>
                  {i < TIMELINE.length - 1 && <div className="psp-step-line" />}
                </div>
                <div className="psp-step-body">
                  <p className="psp-step-label">{step.label}</p>
                  <p className="psp-step-desc">{step.desc}</p>
                </div>
                <div className="psp-step-badge-wrap">
                  {step.state === "done"   && <span className="psp-tbadge psp-tbadge-done">Done</span>}
                  {step.state === "active" && <span className="psp-tbadge psp-tbadge-active">In Progress</span>}
                  {step.state === "locked" && <span className="psp-tbadge psp-tbadge-locked">Locked</span>}
                </div>
              </div>
            ))}
          </div>

          <div className="psp-actions">
            <button className="psp-btn psp-btn-outline" onClick={() => navigate("/")}>Browse Store</button>
            <button className="psp-btn psp-btn-dark" onClick={() => { logout(); navigate("/login"); }}>Back to Login</button>
          </div>
        </div>

        <p className="psp-footer-note">
          Questions? <a href="mailto:hello@wearly.com">hello@wearly.com</a>
        </p>
      </div>
    </div>
  );
}
