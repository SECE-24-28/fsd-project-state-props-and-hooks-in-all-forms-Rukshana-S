import React, { useState } from "react";
import "../styles/AdminOrders.css";
import { useAdmin } from "../context/AdminContext";

const ALL_STATUSES = ["Pending", "Confirmed", "Processing", "Packed", "Shipped", "Delivered", "Cancelled", "Refunded"];

const STATUS_COLORS = {
  Delivered: "#059669", Shipped: "#0891B2", Processing: "#7C3AED",
  Confirmed: "#16A34A", Pending: "#D97706", Packed: "#6366F1",
  Cancelled: "#DC2626", Refunded: "#6B7280"
};

export default function AdminOrders() {
  const { orders, updateOrderStatus } = useAdmin();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [editOrder, setEditOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  const filtered = orders.filter(o => {
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openEdit = (o) => { setEditOrder(o); setNewStatus(o.status); };

  const saveStatus = () => { updateOrderStatus(editOrder.id, newStatus); setEditOrder(null); };

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Orders</h1>
          <p className="adm-page-sub">{orders.length} total orders</p>
        </div>
      </div>

      <div className="adm-card">
        <div className="adm-toolbar adm-toolbar-wrap">
          <input className="adm-search" placeholder="Search orders..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="adm-input adm-select-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="All">All Status</option>
            {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr><th>Order ID</th><th>Customer</th><th>Date</th><th>Items</th><th>Amount</th><th>Payment</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id}>
                  <td><span className="adm-order-id">{o.id}</span></td>
                  <td>
                    <div className="adm-customer-cell">
                      <span className="adm-customer-name">{o.customer}</span>
                      <span className="adm-customer-email">{o.email}</span>
                    </div>
                  </td>
                  <td>{o.date}</td>
                  <td>{o.items} item{o.items > 1 ? "s" : ""}</td>
                  <td className="adm-amount">₹{o.amount.toLocaleString("en-IN")}</td>
                  <td><span className="adm-badge-pill">{o.payment}</span></td>
                  <td><span className="adm-status-badge" style={{ background: `${STATUS_COLORS[o.status]}20`, color: STATUS_COLORS[o.status] }}>{o.status}</span></td>
                  <td>
                    <button className="adm-action-btn adm-edit" onClick={() => openEdit(o)}>Update</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="adm-empty">No orders found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editOrder && (
        <div className="adm-modal-overlay" onClick={() => setEditOrder(null)}>
          <div className="adm-modal adm-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h2>Update Order Status</h2>
              <button className="adm-modal-close" onClick={() => setEditOrder(null)}>✕</button>
            </div>
            <div className="adm-modal-form">
              <p className="adm-confirm-text" style={{ marginBottom: 8 }}>Order: <strong>{editOrder.id}</strong></p>
              <p className="adm-confirm-text" style={{ marginBottom: 16 }}>Customer: <strong>{editOrder.customer}</strong></p>
              <div className="adm-form-group">
                <label className="adm-label">New Status</label>
                <select className="adm-input" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                  {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="adm-modal-footer">
              <button className="adm-btn adm-btn-secondary" onClick={() => setEditOrder(null)}>Cancel</button>
              <button className="adm-btn adm-btn-primary" onClick={saveStatus}>Update Status</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
