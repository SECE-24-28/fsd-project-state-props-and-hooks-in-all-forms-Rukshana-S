import React from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import { useAuth } from "../../context/AuthContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import "../admin.css";

const STATUS_COLORS = {
  Delivered: "#059669", Shipped: "#0891B2", Processing: "#7C3AED",
  Pending: "#D97706", Cancelled: "#DC2626",
};

export default function StoreAdminDashboard() {
  const { orders, customers, analytics, products } = useAdmin();
  const { user } = useAuth();
  const navigate = useNavigate();

  const totalRevenue = orders
    .filter(o => (o.orderStatus || o.status) !== "Cancelled")
    .reduce((s, o) => s + (Number(o.amount) || 0), 0);

  const stats = [
    { label: "Total Products",  value: products.length,  icon: "👗", bg: "#fdf0f2", color: "#b8929a" },
    { label: "Total Orders",    value: orders.length,    icon: "📦", bg: "#f0f7ff", color: "#0891B2" },
    { label: "Total Customers", value: customers.length, icon: "👥", bg: "#f0fdf4", color: "#059669" },
    { label: "Revenue",         value: `₹${totalRevenue.toLocaleString("en-IN")}`, icon: "₹", bg: "#fffbeb", color: "#D97706" },
  ];

  const lowStock     = products.filter(p => (p.stock || 0) < 5).slice(0, 5);
  const recentOrders = orders.slice(0, 6);
  const recentCustomers = customers.slice(0, 4);
  const chartData = analytics.monthlySales.map((val, i) => ({ month: analytics.monthLabels[i], revenue: val }));

  const handleExportCSV = () => {
    const headers = ["Section", "Name / ID", "Detail / Status", "Value / Stock"];
    const rows = [];

    // Products
    products.forEach(p => {
      rows.push(["Product Inventory", p.name, p.category, `Stock: ${p.stock}`]);
    });
    // Orders
    orders.forEach(o => {
      rows.push(["Order Record", o._id, o.orderStatus, `Amount: ₹${o.amount}`]);
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${user?.storeName || "store"}_sales_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="adm-page">
      <div className="adm-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="adm-page-title">Dashboard</h1>
          <p className="adm-page-sub">Welcome back, {user?.name} 👋</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button className="adm-btn adm-btn-primary" onClick={handleExportCSV}>
            📥 Export CSV
          </button>
          <span className="adm-date">{new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
        </div>
      </div>

      <div className="adm-stats-grid">
        {stats.map(s => (
          <div key={s.label} className="adm-stat-card">
            <div className="adm-stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div>
              <p className="adm-stat-value">{s.value}</p>
              <p className="adm-stat-label">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="adm-dash-grid">
        <div className="adm-card">
          <h3 className="adm-card-title">Monthly Revenue</h3>
          {chartData.every(d => d.revenue === 0) ? (
            <p className="adm-empty" style={{ padding: "40px 0", textAlign: "center" }}>No revenue data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0e8e8" />
                <XAxis dataKey="month" stroke="#aaa" tick={{ fontSize: 12 }} />
                <YAxis stroke="#aaa" tick={{ fontSize: 12 }} tickFormatter={v => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                <Tooltip formatter={v => [`₹${Number(v).toLocaleString("en-IN")}`, "Revenue"]} contentStyle={{ background: "#fff", border: "1px solid #eadede", borderRadius: 8 }} />
                <Bar dataKey="revenue" fill="#e8d6d9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="adm-card">
          <h3 className="adm-card-title">Order Status Breakdown</h3>
          <div className="adm-category-list" style={{ marginTop: 16, gap: 12 }}>
            {Object.entries(analytics.orderStatuses).map(([st, cnt]) => {
              const total = Object.values(analytics.orderStatuses).reduce((a, b) => a + b, 0) || 1;
              return (
                <div key={st} className="adm-category-row">
                  <span className="adm-cat-name" style={{ color: STATUS_COLORS[st] }}>{st}</span>
                  <div className="adm-cat-bar-wrap">
                    <div className="adm-cat-bar" style={{ width: `${(cnt / total) * 100}%`, background: STATUS_COLORS[st] }} />
                  </div>
                  <span className="adm-cat-pct">{cnt}</span>
                </div>
              );
            })}
            {orders.length === 0 && <p className="adm-empty">No orders yet</p>}
          </div>
        </div>
      </div>

      <div className="adm-card" style={{ marginBottom: 24 }}>
        <h3 className="adm-card-title">Quick Actions</h3>
        <div className="adm-quick-actions">
          {[
            { label: "Add Product", icon: "+",  to: "/store-admin/products" },
            { label: "View Orders", icon: "📦", to: "/store-admin/orders" },
            { label: "Customers",   icon: "👥", to: "/store-admin/customers" },
            { label: "Analytics",   icon: "📊", to: "/store-admin/analytics" },
            { label: "Settings",    icon: "⚙",  to: "/store-admin/settings" },
          ].map(a => (
            <button key={a.label} className="adm-quick-btn" onClick={() => navigate(a.to)}>
              <span className="adm-quick-icon">{a.icon}</span>
              <span>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="sa-bottom-grid">
        <div className="adm-card sa-col-2">
          <div className="adm-card-head">
            <h3 className="adm-card-title">Recent Orders</h3>
            <button className="adm-link-btn" onClick={() => navigate("/store-admin/orders")}>View All →</button>
          </div>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {recentOrders.length === 0 && <tr><td colSpan={4} className="adm-empty">No orders yet</td></tr>}
                {recentOrders.map(o => {
                  const status = o.orderStatus || o.status;
                  return (
                    <tr key={o._id}>
                      <td><span className="adm-order-id">{String(o._id).slice(-8).toUpperCase()}</span></td>
                      <td>{o.userId?.name || "—"}</td>
                      <td className="adm-amount">₹{Number(o.amount).toLocaleString("en-IN")}</td>
                      <td><span className="adm-status-badge" style={{ background: `${STATUS_COLORS[status] || "#aaa"}20`, color: STATUS_COLORS[status] || "#aaa" }}>{status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="sa-col-1">
          <div className="adm-card" style={{ marginBottom: 20 }}>
            <h3 className="adm-card-title">Low Stock</h3>
            {lowStock.length === 0
              ? <p className="adm-empty">All products well stocked</p>
              : lowStock.map(p => (
                <div key={p._id} className="sa-stock-row">
                  <span className="sa-stock-name">{p.name}</span>
                  <span className={`sa-stock-badge ${(p.stock || 0) === 0 ? "sa-out" : "sa-low"}`}>{p.stock || 0} left</span>
                </div>
              ))
            }
          </div>
          <div className="adm-card">
            <div className="adm-card-head">
              <h3 className="adm-card-title">New Customers</h3>
              <button className="adm-link-btn" onClick={() => navigate("/store-admin/customers")}>All →</button>
            </div>
            {recentCustomers.map(c => (
              <div key={c._id} className="sa-customer-row">
                <div className="adm-customer-avatar" style={{ width: 32, height: 32, fontSize: 13 }}>{(c.name || "?")[0]}</div>
                <div>
                  <div className="adm-customer-name" style={{ fontSize: 13 }}>{c.name}</div>
                  <div className="adm-customer-email">{c.email}</div>
                </div>
              </div>
            ))}
            {recentCustomers.length === 0 && <p className="adm-empty">No customers yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
