import React, { useState } from "react";
import "../styles/AdminManagement.css";
import { useAdmin } from "../context/AdminContext";

export default function AdminManagement() {
  const { admins, deleteAdmin, deactivateAdmin, activateAdmin } = useAdmin();
  const [deleteId, setDeleteId]   = useState(null);
  const [viewAdmin, setViewAdmin] = useState(null);
  const [search, setSearch]       = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const superAdmins = admins.filter(a => (a.role || "").toLowerCase().includes("super"));
  const storeAdmins = admins.filter(a => !(a.role || "").toLowerCase().includes("super"));

  const filteredStore = storeAdmins.filter(a => {
    const matchSearch =
      (a.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.storeName || a.brandName || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Seller Management</h1>
          <p className="adm-page-sub">Manage seller accounts — Super Admin only</p>
        </div>
      </div>

      {/* Super Admins */}
      <div className="adm-card" style={{ marginBottom: "24px" }}>
        <h3 className="adm-card-title" style={{ marginBottom: "16px" }}>Super Admins</h3>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th></tr></thead>
            <tbody>
              {superAdmins.length === 0 && <tr><td colSpan={4} className="adm-empty">No super admins found</td></tr>}
              {superAdmins.map(a => (
                <tr key={a._id}>
                  <td>
                    <div className="adm-customer-cell">
                      <div className="adm-customer-avatar" style={{ background: "#7C3AED20", color: "#7C3AED" }}>{(a.name || "A")[0]}</div>
                      <span className="adm-customer-name">{a.name}</span>
                    </div>
                  </td>
                  <td className="adm-customer-email">{a.email}</td>
                  <td><span className="adm-role-badge adm-role-super">Super Admin</span></td>
                  <td><span className="adm-status-badge" style={{ background: "#D1FAE520", color: "#059669" }}>Active</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Store Admins */}
      <div className="adm-card">
        <h3 className="adm-card-title" style={{ marginBottom: "16px" }}>Store Admins ({storeAdmins.length})</h3>
        <div className="adm-toolbar adm-toolbar-wrap" style={{ marginBottom: "16px", gap: "10px" }}>
          <input className="adm-search" placeholder="Search store admins..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="adm-input adm-select-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="All">All Status</option>
            <option value="approved">Approved</option>
            <option value="deactivated">Deactivated</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr><th>Store Name</th><th>Owner</th><th>Email</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filteredStore.length === 0 && <tr><td colSpan={6} className="adm-empty">No store admins found.</td></tr>}
              {filteredStore.map(a => {
                const aid = a._id;
                return (
                  <tr key={aid}>
                    <td><span style={{ fontWeight: 600 }}>{a.storeName || a.brandName || "—"}</span></td>
                    <td>
                      <div className="adm-customer-cell">
                        <div className="adm-customer-avatar">{(a.name || "S")[0]}</div>
                        <span className="adm-customer-name">{a.name}</span>
                      </div>
                    </td>
                    <td className="adm-customer-email">{a.email}</td>
                    <td>
                      <span className="adm-status-badge" style={{
                        background: a.status === "approved" ? "#D1FAE520" : "#FEE2E220",
                        color:      a.status === "approved" ? "#059669"   : "#DC2626",
                      }}>{a.status}</span>
                    </td>
                    <td style={{ fontSize: "0.82rem", color: "#6B7280" }}>{a.createdAt ? new Date(a.createdAt).toLocaleDateString("en-IN") : "—"}</td>
                    <td>
                      <div className="adm-actions">
                        <button className="adm-action-btn adm-view" onClick={() => setViewAdmin(a)}>View Details</button>
                        {a.status === "approved"
                          ? <button className="adm-action-btn" style={{ color: "#D97706" }} onClick={() => deactivateAdmin(aid)}>Deactivate</button>
                          : <button className="adm-action-btn" style={{ color: "#059669" }} onClick={() => activateAdmin(aid)}>Activate</button>
                        }
                        <button className="adm-action-btn adm-delete" onClick={() => setDeleteId(aid)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Details Modal */}
      {viewAdmin && (
        <div className="adm-modal-overlay" onClick={() => setViewAdmin(null)}>
          <div className="adm-modal" style={{ maxWidth: "480px" }} onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h2 className="adm-modal-title">{viewAdmin.storeName || viewAdmin.brandName || viewAdmin.name}</h2>
              <button className="adm-modal-close" onClick={() => setViewAdmin(null)}>✕</button>
            </div>
            <div style={{ padding: "4px 0 16px", fontSize: "0.88rem", lineHeight: 1.9 }}>
              <p><strong>Owner Name:</strong> {viewAdmin.name}</p>
              <p><strong>Email:</strong> {viewAdmin.email}</p>
              <p><strong>Phone:</strong> {viewAdmin.phone || "—"}</p>
              <p><strong>Store Name:</strong> {viewAdmin.storeName || "—"}</p>
              <p><strong>Brand Name:</strong> {viewAdmin.brandName || "—"}</p>
              <p><strong>Status:</strong> <span style={{ fontWeight: 700, color: viewAdmin.status === "approved" ? "#059669" : "#DC2626" }}>{viewAdmin.status}</span></p>
              <p><strong>Joined:</strong> {viewAdmin.createdAt ? new Date(viewAdmin.createdAt).toLocaleDateString("en-IN") : "—"}</p>
            </div>
            <div className="adm-modal-footer">
              <button className="adm-btn adm-btn-secondary" onClick={() => setViewAdmin(null)}>Close</button>
              {viewAdmin.status === "approved"
                ? <button className="adm-btn" style={{ background: "#fffbeb", color: "#D97706", border: "1px solid #fde68a" }} onClick={() => { deactivateAdmin(viewAdmin._id); setViewAdmin(null); }}>Deactivate</button>
                : <button className="adm-btn adm-btn-primary" onClick={() => { activateAdmin(viewAdmin._id); setViewAdmin(null); }}>Activate</button>
              }
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="adm-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="adm-modal adm-modal-sm" onClick={e => e.stopPropagation()}>
            <h3 className="adm-confirm-title">Delete Admin?</h3>
            <p className="adm-confirm-text">This admin will permanently lose access.</p>
            <div className="adm-modal-footer">
              <button className="adm-btn adm-btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="adm-btn adm-btn-danger" onClick={() => { deleteAdmin(deleteId); setDeleteId(null); }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
