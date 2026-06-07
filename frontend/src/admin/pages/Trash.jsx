import React, { useState } from "react";
import { useAdmin } from "../context/AdminContext";
import "../styles/AdminDashboard.css"; // Reuse dashboard card and table layouts

export default function Trash() {
  const {
    products, restoreProduct, deleteProduct,
    admins, restoreAdmin, deleteAdmin,
    customers, restoreCustomer, deleteCustomer,
  } = useAdmin();

  const [activeTab, setActiveTab] = useState("products");

  // Filter soft-deleted items
  const deletedProducts = (products || []).filter(p => p.isDeleted);
  const deletedAdmins   = (admins || []).filter(a => a.isDeleted);
  const deletedCustomers = (customers || []).filter(c => c.isDeleted);

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Trash System</h1>
          <p className="adm-page-sub">Manage and restore soft-deleted marketplace records</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        {[
          { key: "products", label: `Products (${deletedProducts.length})` },
          { key: "admins", label: `Store Admins (${deletedAdmins.length})` },
          { key: "customers", label: `Customers (${deletedCustomers.length})` },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: "10px 20px",
              borderRadius: "999px",
              fontWeight: 600,
              fontSize: "0.88rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
              background: activeTab === t.key ? "#2F2F2F" : "#ffffff",
              color: activeTab === t.key ? "#ffffff" : "#6c6c6c",
              border: activeTab === t.key ? "1px solid #2F2F2F" : "1px solid rgba(233, 213, 214, 0.6)",
              boxShadow: activeTab === t.key ? "0 8px 16px rgba(47,47,47,0.15)" : "none",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="adm-card">
        <div className="adm-table-wrap">
          {activeTab === "products" && (
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Product Name</th>
                  <th>Category</th>
                  <th>Brand / Store</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {deletedProducts.map(p => (
                  <tr key={p.id}>
                    <td>
                      {p.image || (p.images && p.images[0]) ? (
                        <img src={p.image || p.images[0]} alt={p.name} className="adm-product-thumb" style={{ width: "32px", height: "40px", objectFit: "cover" }} />
                      ) : (
                        <div className="admp-no-thumb" style={{ width: "32px", height: "40px" }}>No img</div>
                      )}
                    </td>
                    <td><span className="adm-product-name">{p.name}</span></td>
                    <td><span className="adm-badge-pill">{p.category}</span></td>
                    <td>{p.brand}</td>
                    <td className="adm-amount">₹{Number(p.price).toLocaleString("en-IN")}</td>
                    <td>
                      <div className="adm-actions">
                        <button className="adm-action-btn" style={{ color: "#059669" }} onClick={() => restoreProduct(p.id)}>Restore</button>
                        <button className="adm-action-btn adm-delete" onClick={() => deleteProduct(p.id, true)}>Delete Permanently</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {deletedProducts.length === 0 && (
                  <tr><td colSpan={6} className="adm-empty">No deleted products</td></tr>
                )}
              </tbody>
            </table>
          )}

          {activeTab === "admins" && (
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Store Name</th>
                  <th>Owner Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {deletedAdmins.map(a => (
                  <tr key={a.id}>
                    <td><span style={{ fontWeight: 600 }}>{a.storeName || a.brandName || "—"}</span></td>
                    <td>
                      <div className="adm-customer-cell">
                        <div className="adm-customer-avatar">{(a.name || "S")[0]}</div>
                        <span className="adm-customer-name">{a.name}</span>
                      </div>
                    </td>
                    <td className="adm-customer-email">{a.email}</td>
                    <td><span className="adm-role-badge adm-role-store">Store Admin</span></td>
                    <td>
                      <div className="adm-actions">
                        <button className="adm-action-btn" style={{ color: "#059669" }} onClick={() => restoreAdmin(a.id)}>Restore</button>
                        <button className="adm-action-btn adm-delete" onClick={() => deleteAdmin(a.id, true)}>Delete Permanently</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {deletedAdmins.length === 0 && (
                  <tr><td colSpan={5} className="adm-empty">No deleted store admins</td></tr>
                )}
              </tbody>
            </table>
          )}

          {activeTab === "customers" && (
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {deletedCustomers.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div className="adm-customer-cell">
                        <div className="adm-customer-avatar">{c.name[0]}</div>
                        <span className="adm-customer-name">{c.name}</span>
                      </div>
                    </td>
                    <td className="adm-customer-email">{c.email}</td>
                    <td>{c.phone}</td>
                    <td>
                      <div className="adm-actions">
                        <button className="adm-action-btn" style={{ color: "#059669" }} onClick={() => restoreCustomer(c.id)}>Restore</button>
                        <button className="adm-action-btn adm-delete" onClick={() => deleteCustomer(c.id, true)}>Delete Permanently</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {deletedCustomers.length === 0 && (
                  <tr><td colSpan={4} className="adm-empty">No deleted customers</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
