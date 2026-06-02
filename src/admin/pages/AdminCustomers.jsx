import React, { useState } from "react";
import "../styles/AdminUsers.css";
import { useAdmin } from "../context/AdminContext";

export default function AdminCustomers() {
  const { customers, deleteCustomer, toggleCustomerStatus } = useAdmin();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState(null);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

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
          <div><p className="adm-stat-value">{customers.filter(c => c.status === "active").length}</p><p className="adm-stat-label">Active</p></div>
        </div>
        <div className="adm-stat-card">
          <div className="adm-stat-icon" style={{ background: "#FEE2E2", color: "#DC2626" }}>✗</div>
          <div><p className="adm-stat-value">{customers.filter(c => c.status !== "active").length}</p><p className="adm-stat-label">Inactive</p></div>
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
              <tr><th>Name</th><th>Email</th><th>Phone</th><th>Orders</th><th>Registered</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td>
                    <div className="adm-customer-cell">
                      <div className="adm-customer-avatar">{c.name[0]}</div>
                      <span className="adm-customer-name">{c.name}</span>
                    </div>
                  </td>
                  <td className="adm-customer-email">{c.email}</td>
                  <td>{c.phone}</td>
                  <td><span className="adm-badge-pill">{c.orders} orders</span></td>
                  <td>{c.registeredAt}</td>
                  <td>
                    <span className="adm-status-badge" style={{
                      background: c.status === "active" ? "#D1FAE520" : "#FEE2E220",
                      color: c.status === "active" ? "#059669" : "#DC2626"
                    }}>{c.status}</span>
                  </td>
                  <td>
                    <div className="adm-actions">
                      <button className="adm-action-btn adm-edit" onClick={() => toggleCustomerStatus(c.id)}>
                        {c.status === "active" ? "Deactivate" : "Activate"}
                      </button>
                      <button className="adm-action-btn adm-delete" onClick={() => setDeleteId(c.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="adm-empty">No customers found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deleteId && (
        <div className="adm-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="adm-modal adm-modal-sm" onClick={e => e.stopPropagation()}>
            <h3 className="adm-confirm-title">Delete Customer?</h3>
            <p className="adm-confirm-text">This will permanently delete this customer and cannot be undone.</p>
            <div className="adm-modal-footer">
              <button className="adm-btn adm-btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="adm-btn adm-btn-danger" onClick={() => { deleteCustomer(deleteId); setDeleteId(null); }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
