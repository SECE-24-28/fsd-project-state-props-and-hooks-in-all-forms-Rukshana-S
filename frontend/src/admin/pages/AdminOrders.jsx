import React, { useState, useMemo, useEffect } from "react";
import "../styles/AdminOrders.css";
import { useAdmin } from "../context/AdminContext";

const ALL_STATUSES = ["Pending", "Confirmed", "Processing", "Packed", "Shipped", "Out For Delivery", "Delivered", "Cancelled"];

const STATUS_COLORS = {
  Pending: "#D97706",
  Confirmed: "#2563EB",
  Processing: "#0284C7",
  Packed: "#7C3AED",
  Shipped: "#4F46E5",
  "Out For Delivery": "#059669",
  Delivered: "#059669",
  Cancelled: "#DC2626",
};

const STORE_COLORS = ["#e9d5d6", "#d4b6b7", "#c9a8b0", "#b89aa0", "#a88090"];

export default function AdminOrders() {
  const { orders, updateOrderStatus, isSuperAdmin } = useAdmin();
  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterStore, setFilterStore]   = useState("All");
  const [sort, setSort]                 = useState("newest");
  const [editOrder, setEditOrder]       = useState(null);
  const [newStatus, setNewStatus]       = useState("");
  const [saving, setSaving]             = useState(false);
  const [tab, setTab]                   = useState("orders"); // "orders" | "stores"
  const [currentPage, setCurrentPage]   = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Collect unique store names from orders via products.sellerId (populated)
  const storeNames = useMemo(() => {
    const names = [...new Set(orders.map(o => o.sellerName || o.storeName || ""))].filter(Boolean);
    return names;
  }, [orders]);

  // Revenue / order stats by store — read seller info from product items
  const storeStats = useMemo(() => {
    const map = {};
    orders.forEach(o => {
      const firstItem = (o.products || [])[0];
      const storeName = firstItem?.storeName || o.sellerName || o.storeName || "";
      if (!storeName) return;
      if (!map[storeName]) map[storeName] = { store: storeName, orders: 0, revenue: 0 };
      map[storeName].orders += 1;
      if ((o.orderStatus || o.status) !== "Cancelled") map[storeName].revenue += Number(o.amount) || 0;
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [orders]);

  const topSellingStore = useMemo(() => {
    if (storeStats.length === 0) return null;
    return [...storeStats].sort((a, b) => b.orders - a.orders)[0];
  }, [storeStats]);

  const highestRevenueStore = useMemo(() => {
    if (storeStats.length === 0) return null;
    return [...storeStats].sort((a, b) => b.revenue - a.revenue)[0];
  }, [storeStats]);

  const maxRevenue = Math.max(...storeStats.map(s => s.revenue), 1);

  const filtered = useMemo(() => {
    let list = [...orders];
    if (filterStatus !== "All") list = list.filter(o => (o.orderStatus || o.status) === filterStatus);
    if (filterStore !== "All")  list = list.filter(o => (o.sellerName || o.storeName || "") === filterStore);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(o => {
        const id = String(o._id || "").toLowerCase();
        const customer = (o.userId?.name || "").toLowerCase();
        return id.includes(q) || customer.includes(q);
      });
    }
    if (sort === "newest") list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === "oldest") list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sort === "high")   list.sort((a, b) => Number(b.amount) - Number(a.amount));
    if (sort === "low")    list.sort((a, b) => Number(a.amount) - Number(b.amount));
    return list;
  }, [orders, filterStatus, filterStore, search, sort]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus, filterStore, sort]);

  const openEdit = (o) => {
    const status = o.orderStatus || o.status || "Pending";
    if (status === "Cancelled") return; // Lock cancelled orders
    setEditOrder(o);
    setNewStatus(status);
  };

  const saveStatus = async () => {
    setSaving(true);
    await updateOrderStatus(editOrder._id, newStatus);
    setSaving(false);
    setEditOrder(null);
  };

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Orders</h1>
          <p className="adm-page-sub">{orders.length} total orders</p>
        </div>
      </div>

      {isSuperAdmin && (
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          <button className={`adm-btn ${tab === "orders" ? "adm-btn-primary" : "adm-btn-secondary"}`} onClick={() => setTab("orders")}>All Orders</button>
          <button className={`adm-btn ${tab === "stores" ? "adm-btn-primary" : "adm-btn-secondary"}`} onClick={() => setTab("stores")}>By Store</button>
        </div>
      )}

      {tab === "stores" && isSuperAdmin && (
        <>
          <div className="adm-stats-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
            <div className="adm-stat-card" style={{ display: "flex", flexDirection: "column", justifyContent: "center", background: "#ffffff", padding: "20px", borderRadius: "16px", border: "1px solid #efe3e6" }}>
              <div style={{ fontSize: "0.85rem", color: "#6c6c6c", fontWeight: 500 }}>Top Selling Store (Orders)</div>
              <div style={{ fontSize: "1.6rem", fontWeight: 700, margin: "8px 0 2px", color: "#2f2f2f" }}>{topSellingStore?.store || "—"}</div>
              <div style={{ fontSize: "0.82rem", color: "#b89aa0", fontWeight: 600 }}>{topSellingStore?.orders || 0} order(s) placed</div>
            </div>
            <div className="adm-stat-card" style={{ display: "flex", flexDirection: "column", justifyContent: "center", background: "#ffffff", padding: "20px", borderRadius: "16px", border: "1px solid #efe3e6" }}>
              <div style={{ fontSize: "0.85rem", color: "#6c6c6c", fontWeight: 500 }}>Highest Revenue Store</div>
              <div style={{ fontSize: "1.6rem", fontWeight: 700, margin: "8px 0 2px", color: "#2f2f2f" }}>{highestRevenueStore?.store || "—"}</div>
              <div style={{ fontSize: "0.82rem", color: "#b89aa0", fontWeight: 600 }}>₹{highestRevenueStore?.revenue.toLocaleString("en-IN") || 0} revenue</div>
            </div>
          </div>

          <div className="adm-dash-grid" style={{ marginBottom: "24px" }}>
            <div className="adm-card">
              <h3 className="adm-card-title">Revenue by Store</h3>
              <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {storeStats.length === 0 ? (
                  <p className="adm-empty">No store revenue data</p>
                ) : storeStats.map((s, i) => (
                  <div key={s.store}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "#2f2f2f" }}>{s.store}</span>
                      <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#2f2f2f" }}>₹{s.revenue.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="adm-cat-bar-wrap">
                      <div className="adm-cat-bar" style={{ width: `${(s.revenue / maxRevenue) * 100}%`, background: STORE_COLORS[i % STORE_COLORS.length] }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="adm-card">
              <h3 className="adm-card-title">Top Selling Stores</h3>
              <div className="adm-table-wrap" style={{ marginTop: "16px" }}>
                <table className="adm-table">
                  <thead><tr><th>#</th><th>Store</th><th>Orders</th><th>Revenue</th></tr></thead>
                  <tbody>
                    {storeStats.length === 0 ? (
                      <tr><td colSpan={4} className="adm-empty">No data</td></tr>
                    ) : storeStats.map((s, i) => (
                      <tr key={s.store}>
                        <td>
                          <span style={{ width: "24px", height: "24px", borderRadius: "50%", background: STORE_COLORS[i % STORE_COLORS.length], display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.75rem" }}>
                            {i + 1}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{s.store}</td>
                        <td><span className="adm-badge-pill">{s.orders}</span></td>
                        <td className="adm-amount">₹{s.revenue.toLocaleString("en-IN")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {tab === "orders" && (
        <div className="adm-card">
          <div className="adm-toolbar adm-toolbar-wrap" style={{ flexWrap: "wrap", gap: "10px" }}>
            <input className="adm-search" placeholder="Search by order ID or customer..." value={search} onChange={e => setSearch(e.target.value)} />
            <select className="adm-input adm-select-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="All">All Status</option>
              {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {isSuperAdmin && storeNames.length > 0 && (
              <select className="adm-input adm-select-sm" value={filterStore} onChange={e => setFilterStore(e.target.value)}>
                <option value="All">All Stores</option>
                {storeNames.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            )}
            <select className="adm-input adm-select-sm" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="high">Amount: High to Low</option>
              <option value="low">Amount: Low to High</option>
            </select>
          </div>

          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Order ID</th><th>Customer</th><th>Date</th><th>Items</th><th>Amount</th><th>Payment</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map(o => {
                  const status = o.orderStatus || o.status;
                  return (
                    <tr key={o._id}>
                      <td><span className="adm-order-id">{String(o._id).slice(-8).toUpperCase()}</span></td>
                      <td>
                        <div className="adm-customer-cell">
                          <span className="adm-customer-name">{o.userId?.name || "—"}</span>
                          <span className="adm-customer-email">{o.userId?.email || ""}</span>
                        </div>
                      </td>
                      <td>{o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN") : "—"}</td>
                      <td>{(o.products || []).length} item(s)</td>
                      <td className="adm-amount">₹{Number(o.amount).toLocaleString("en-IN")}</td>
                      <td><span className="adm-badge-pill">{o.paymentMethod || "—"}</span></td>
                      <td>
                        <span className="adm-status-badge" style={{ background: `${STATUS_COLORS[status] || "#ccc"}20`, color: STATUS_COLORS[status] || "#ccc" }}>
                          {status}
                        </span>
                      </td>
                      <td>
                        {status === "Cancelled" ? (
                          <span style={{
                            display: "inline-block",
                            padding: "4px 10px",
                            borderRadius: "20px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            background: "#FEE2E2",
                            color: "#DC2626",
                          }}>
                            {o.cancelledBy === "customer" ? "Cancelled By Customer" : "Cancelled"}
                          </span>
                        ) : (
                          <button className="adm-action-btn adm-edit" onClick={() => openEdit(o)}>Update</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {paginatedOrders.length === 0 && <tr><td colSpan={8} className="adm-empty">No orders found</td></tr>}
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
      )}

      {editOrder && (
        <div className="adm-modal-overlay" onClick={() => setEditOrder(null)}>
          <div className="adm-modal adm-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-header">
              <h2 className="adm-modal-title">Update Order Status</h2>
              <button className="adm-modal-close" onClick={() => setEditOrder(null)}>✕</button>
            </div>
            <div className="adm-modal-form">
              <p className="adm-confirm-text" style={{ marginBottom: 16 }}>
                Order: <strong>{String(editOrder._id).slice(-8).toUpperCase()}</strong>
              </p>
              <div className="adm-form-group">
                <label className="adm-label">New Status</label>
                <select className="adm-input" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                  {ALL_STATUSES.filter(s => s !== "Cancelled").map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="adm-modal-footer">
              <button className="adm-btn adm-btn-secondary" onClick={() => setEditOrder(null)}>Cancel</button>
              <button className="adm-btn adm-btn-primary" onClick={saveStatus} disabled={saving}>
                {saving ? "Saving..." : "Update Status"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
