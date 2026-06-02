import React, { useState } from "react";
import "../styles/AdminManagement.css";
import { useAdmin } from "../context/AdminContext";

const EMPTY = { name: "", email: "", password: "" };

export default function AdminManagement() {
  const { admins, createAdmin, updateAdmin, deleteAdmin, toggleAdminStatus } = useAdmin();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState("");

  const storeAdmins = admins.filter(a => !String(a.role || "").toLowerCase().includes("super"));
  const superAdmins = admins.filter(a => String(a.role || "").toLowerCase().includes("super"));

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const openAdd = () => { setForm(EMPTY); setEditId(null); setError(""); setShowForm(true); };
  const openEdit = (a) => { setForm({ name: a.name, email: a.email, password: a.password }); setEditId(a.id); setError(""); setShowForm(true); };

  const save = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return setError("All fields are required.");
    const existing = admins.find(a => a.email === form.email && a.id !== editId);
    if (existing) return setError("Email already in use.");
    if (editId) updateAdmin(editId, form);
    else createAdmin(form);
    setShowForm(false);
  };

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Admin Management</h1>
          <p className="adm-page-sub">Super Admin Only — Manage store admin accounts</p>
        </div>
        <button className="adm-btn adm-btn-primary" onClick={openAdd}>＋ Create Store Admin</button>
      </div>

      {/* Super Admins */}
      <div className="adm-card" style={{ marginBottom: "24px" }}>
        <h3 className="adm-card-title">Super Admins</h3>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Note</th></tr></thead>
            <tbody>
              {superAdmins.map(a => (
                <tr key={a.id}>
                  <td>
                    <div className="adm-customer-cell">
                      <div className="adm-customer-avatar" style={{ background: "#7C3AED20", color: "#7C3AED" }}>{a.name[0]}</div>
                      <span className="adm-customer-name">{a.name}</span>
                    </div>
                  </td>
                  <td className="adm-customer-email">{a.email}</td>
                  <td><span className="adm-role-badge adm-role-super">Super Admin</span></td>
                  <td><span className="adm-status-badge" style={{ background: "#D1FAE520", color: "#059669" }}>Active</span></td>
                  <td><span style={{ fontSize: "0.78rem", color: "#6B7280" }}>Cannot be deleted</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Store Admins */}
      <div className="adm-card">
        <h3 className="adm-card-title">Store Admins ({storeAdmins.length})</h3>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
            <tbody>
              {storeAdmins.length === 0 ? (
                <tr><td colSpan={6} className="adm-empty">No store admins yet. Create one above.</td></tr>
              ) : storeAdmins.map(a => (
                <tr key={a.id}>
                  <td>
                    <div className="adm-customer-cell">
                      <div className="adm-customer-avatar">{a.name[0]}</div>
                      <span className="adm-customer-name">{a.name}</span>
                    </div>
                  </td>
                  <td className="adm-customer-email">{a.email}</td>
                  <td><span className="adm-role-badge adm-role-store">Store Admin</span></td>
                  <td>
                    <span className="adm-status-badge" style={{
                      background: a.status === "active" ? "#D1FAE520" : "#FEE2E220",
                      color: a.status === "active" ? "#059669" : "#DC2626"
                    }}>{a.status}</span>
                  </td>
                  <td style={{ fontSize: "0.82rem", color: "#6B7280" }}>{a.createdAt?.slice(0, 10)}</td>
                  <td>
                    <div className="adm-actions">
                      <button className="adm-action-btn adm-edit" onClick={() => openEdit(a)}>Edit</button>
                      <button className="adm-action-btn adm-edit" onClick={() => toggleAdminStatus(a.id)}>
                        {a.status === "active" ? "Deactivate" : "Activate"}
                      </button>
                      <button className="adm-action-btn adm-delete" onClick={() => setDeleteId(a.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="adm-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="adm-modal adm-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h2>{editId ? "Edit Store Admin" : "Create Store Admin"}</h2>
              <button className="adm-modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            {error && <div className="adm-alert adm-alert-error" style={{ margin: "0 0 12px" }}>{error}</div>}
            <form onSubmit={save} className="adm-modal-form">
              <div className="adm-form-group">
                <label className="adm-label">Full Name *</label>
                <input className="adm-input" name="name" value={form.name} onChange={handle} placeholder="Admin Name" />
              </div>
              <div className="adm-form-group">
                <label className="adm-label">Email Address *</label>
                <input className="adm-input" type="email" name="email" value={form.email} onChange={handle} placeholder="admin@wearly.com" />
              </div>
              <div className="adm-form-group">
                <label className="adm-label">Password *</label>
                <input className="adm-input" type="password" name="password" value={form.password} onChange={handle} placeholder="Set password" />
              </div>
              <div className="adm-modal-footer">
                <button type="button" className="adm-btn adm-btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="adm-btn adm-btn-primary">{editId ? "Update" : "Create Admin"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="adm-modal-overlay" onClick={() => setDeleteId(null)}>
          <div className="adm-modal adm-modal-sm" onClick={e => e.stopPropagation()}>
            <h3 className="adm-confirm-title">Delete Admin?</h3>
            <p className="adm-confirm-text">This admin will be permanently removed and lose all access.</p>
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
