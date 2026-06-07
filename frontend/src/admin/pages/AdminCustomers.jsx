import React, { useState } from "react";
import "../styles/AdminUsers.css";
import { useAdmin } from "../context/AdminContext";

export default function AdminCustomers() {
  const { customers, deleteCustomer, toggleCustomerStatus } = useAdmin();
  const [search, setSearch]     = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const filtered = customers.filter(c =>
    (c.name  || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Customers</h1>
          <p className="adm-page-sub">{customers.length} registered customers</p>
        </div>
      </div>

      <div className="adm-stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: "24px" }}>
        <div className="adm-stat-card">
          <div className="adm-stat-icon" style={{ background: "#D1FAE5", color: "#059669" }}>👥</div>
          <div><p className="adm-stat-value">{customers.length}</p><p className="adm-stat-label">Total Customers</p></div>
        </div>
        <div className="adm-stat-card">
          <div className="adm-stat-icon" style={{ background: "#CFFAFE", color: "#0891B2" }}>✓</div>
          <div><p className="adm-stat-value">{customers.filter(c => c.status !== "deactivated").length}</p><p className="adm-stat-label">Active</p></div>
        </div>
        <div className="adm-stat-card">
          <div className="adm-stat-icon" style={{ background: "#FEE2E2", color: "#DC2626" }}>✗</div>
          <div><p className="adm-stat-value">{customers.filter(c => c.status === "deactivated").length}</p><p className="adm-stat-label">Inactive</p></div>
        </div>
      </div>

      <div className="adm-card">
        <div className="adm-toolbar">
          <input className="adm-search" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} />
          <span className="adm-count">{filtered.length} results</span>
        </div>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {paginated.map(c => {
                const cid = c._id || c.id;
                return (
                  <tr key={cid}>
                    <td>
                      <div className="adm-customer-cell">
                        <div className="adm-customer-avatar">{(c.name || "?")[0]}</div>
                        <span className="adm-customer-name">{c.name}</span>
                      </div>
                    </td>
                    <td className="adm-customer-email">{c.email}</td>
                    <td>{c.phone || "—"}</td>
                    <td style={{ fontSize: "0.82rem" }}>{c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-IN") : c.registeredAt || "—"}</td>
                    <td>
                      <span className="adm-status-badge" style={{
                         background: (c.status === "deactivated") ? "#FEE2E220" : "#D1FAE520",
                         color:      (c.status === "deactivated") ? "#DC2626"   : "#059669",
                      }}>{c.status || "active"}</span>
                    </td>
                    <td>
                      <div className="adm-actions">
                        <button className="adm-action-btn adm-delete" onClick={() => setDeleteId(cid)}>Remove</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && <tr><td colSpan={6} className="adm-empty">No customers found</td></tr>}
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

      {deleteId && (
        <div className="adm-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="adm-modal adm-modal-sm" onClick={e => e.stopPropagation()}>
            <h3 className="adm-confirm-title">Remove Customer?</h3>
            <p className="adm-confirm-text">This removes the customer from the list view.</p>
            <div className="adm-modal-footer">
              <button className="adm-btn adm-btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="adm-btn adm-btn-danger" onClick={() => { deleteCustomer(deleteId); setDeleteId(null); }}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
