import React, { useState } from "react";
import { useAdmin } from "../context/AdminContext";

const STATUS_STYLE = {
  pending:  { background: "#fffbeb", color: "#D97706", border: "1px solid #fde68a" },
  approved: { background: "#ebf8ee", color: "#059669", border: "1px solid #86efac" },
  rejected: { background: "#fdf0f0", color: "#DC2626", border: "1px solid #fca5a5" },
};

export default function StoreApplications() {
  const { storeApplications, approveApplication, rejectApplication } = useAdmin();
  const [viewApp, setViewApp]           = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [search, setSearch]             = useState("");
  const [filter, setFilter]             = useState("all");
  const [loading, setLoading]           = useState(false);
  const [currentPage, setCurrentPage]   = useState(1);
  const ITEMS_PER_PAGE = 5;

  const filtered = storeApplications.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = [a.brandName || a.storeName, a.name, a.email].some(v => (v || "").toLowerCase().includes(q));
    const matchFilter = filter === "all" || a.status === filter;
    return matchSearch && matchFilter;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, filter]);

  const doAction = async (type) => {
    setLoading(true);
    const id = confirmAction.app._id || confirmAction.app.id;
    if (type === "approve") await approveApplication(id);
    else await rejectApplication(id);
    setLoading(false);
    setConfirmAction(null);
    setViewApp(null);
  };

  const stats = {
    total:    storeApplications.length,
    pending:  storeApplications.filter(a => a.status === "pending").length,
    approved: storeApplications.filter(a => a.status === "approved").length,
    rejected: storeApplications.filter(a => a.status === "rejected").length,
  };

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Seller Requests</h1>
          <p className="adm-page-sub">Review and manage seller applications</p>
        </div>
      </div>

      <div className="adm-stats-grid" style={{ marginBottom: "24px" }}>
        {[
          { label: "Total",    value: stats.total,    icon: "📋", bg: "#f4f0f1", color: "#2a2a2a" },
          { label: "Pending",  value: stats.pending,  icon: "⏳", bg: "#fffbeb", color: "#D97706" },
          { label: "Approved", value: stats.approved, icon: "✅", bg: "#ebf8ee", color: "#059669" },
          { label: "Rejected", value: stats.rejected, icon: "❌", bg: "#fdf0f0", color: "#DC2626" },
        ].map(s => (
          <div key={s.label} className="adm-stat-card">
            <div className="adm-stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div><p className="adm-stat-value">{s.value}</p><p className="adm-stat-label">{s.label}</p></div>
          </div>
        ))}
      </div>

      <div className="adm-card">
        <div className="adm-toolbar adm-toolbar-wrap">
          <input className="adm-search" placeholder="Search name, email..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="adm-input adm-select-sm" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Store Name</th><th>Owner</th><th>Email</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(a => (
                <tr key={a._id || a.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#f5e8e9", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#b89aa0" }}>
                        {((a.brandName || a.storeName || "?")[0]).toUpperCase()}
                      </div>
                      <span className="adm-product-name">{a.brandName || a.storeName || "—"}</span>
                    </div>
                  </td>
                  <td>{a.name || "—"}</td>
                  <td className="adm-customer-email">{a.email || "—"}</td>
                  <td>
                    <span className="adm-status-badge" style={STATUS_STYLE[a.status] || STATUS_STYLE.pending}>
                      {(a.status || "pending").charAt(0).toUpperCase() + (a.status || "pending").slice(1)}
                    </span>
                  </td>
                  <td>
                    <div className="adm-actions">
                      <button className="adm-action-btn adm-view" onClick={() => setViewApp(a)}>View</button>
                      {a.status === "pending" && (
                        <>
                          <button className="adm-action-btn" style={{ background: "#ebf8ee", color: "#059669", border: "1px solid #86efac" }}
                            onClick={() => setConfirmAction({ type: "approve", app: a })}>Approve</button>
                          <button className="adm-action-btn adm-delete"
                            onClick={() => setConfirmAction({ type: "reject", app: a })}>Reject</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {paginated.length === 0 && <tr><td colSpan={5} className="adm-empty">No applications found</td></tr>}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination-wrapper" style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "20px", paddingBottom: "10px" }}>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                style={{
                  padding: "6px 12px", border: "1px solid #e9d5d6", borderRadius: "6px",
                  background: currentPage === i + 1 ? "#2f2f2f" : "#ffffff",
                  color: currentPage === i + 1 ? "#ffffff" : "#2f2f2f",
                  cursor: "pointer", fontWeight: 600, fontSize: "0.85rem"
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {viewApp && (
        <div className="adm-modal-overlay" onClick={() => setViewApp(null)}>
          <div className="adm-modal" style={{ maxWidth: "520px" }} onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h2 className="adm-modal-title">{viewApp.brandName || viewApp.storeName}</h2>
              <button className="adm-modal-close" onClick={() => setViewApp(null)}>✕</button>
            </div>
            <div style={{ maxHeight: "60vh", overflowY: "auto", padding: "4px 0" }}>
              <span className="adm-status-badge" style={STATUS_STYLE[viewApp.status] || STATUS_STYLE.pending}>
                {(viewApp.status || "").charAt(0).toUpperCase() + (viewApp.status || "").slice(1)}
              </span>
              <div style={{ marginTop: "16px", fontSize: "0.88rem", lineHeight: 1.8 }}>
                <p><strong>Name:</strong> {viewApp.name}</p>
                <p><strong>Email:</strong> {viewApp.email}</p>
                <p><strong>Phone:</strong> {viewApp.phone || "—"}</p>
                <p><strong>Store Name:</strong> {viewApp.storeName || "—"}</p>
                <p><strong>Brand Name:</strong> {viewApp.brandName || "—"}</p>
                <p><strong>Applied:</strong> {new Date(viewApp.createdAt).toLocaleDateString("en-IN")}</p>
              </div>
            </div>
            <div className="adm-modal-footer">
              <button className="adm-btn adm-btn-secondary" onClick={() => setViewApp(null)}>Close</button>
              {viewApp.status === "pending" && (
                <>
                  <button className="adm-btn adm-btn-danger"  onClick={() => setConfirmAction({ type: "reject",  app: viewApp })}>Reject</button>
                  <button className="adm-btn adm-btn-primary" onClick={() => setConfirmAction({ type: "approve", app: viewApp })}>Approve</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {confirmAction && (
        <div className="adm-modal-overlay" onClick={() => setConfirmAction(null)}>
          <div className="adm-modal adm-modal-sm" onClick={e => e.stopPropagation()}>
            <h3 className="adm-confirm-title">
              {confirmAction.type === "approve" ? "Approve Application?" : "Reject Application?"}
            </h3>
            <p className="adm-confirm-text">
              {confirmAction.type === "approve"
                ? `Approving "${confirmAction.app.brandName || confirmAction.app.storeName}" grants seller access.`
                : `Rejecting "${confirmAction.app.brandName || confirmAction.app.storeName}" will deny access.`}
            </p>
            <div className="adm-modal-footer">
              <button className="adm-btn adm-btn-secondary" onClick={() => setConfirmAction(null)}>Cancel</button>
              <button
                className={`adm-btn ${confirmAction.type === "approve" ? "adm-btn-primary" : "adm-btn-danger"}`}
                onClick={() => doAction(confirmAction.type)}
                disabled={loading}
              >
                {loading ? "Processing..." : confirmAction.type === "approve" ? "Yes, Approve" : "Yes, Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
