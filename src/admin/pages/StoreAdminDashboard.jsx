import React from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import "../admin.css";

const STATUS_COLORS = {
  Delivered: "#059669", Shipped: "#0891B2", Processing: "#7C3AED",
  Confirmed: "#16A34A", Pending: "#D97706", Cancelled: "#DC2626", Refunded: "#6B7280",
};
const PIE_COLORS = ["#e8d6d9", "#d4b8be", "#c9a8b0", "#b89aa0"];

export default function StoreAdminDashboard() {
  const { orders, customers, analytics, products, adminSession } = useAdmin();
  const navigate = useNavigate();

  const stats = [
    { label: "Total Products", value: products.length, icon: "👗", bg: "#fdf0f2", color: "#b8929a" },
    { label: "Total Orders", value: orders.length, icon: "📦", bg: "#f0f7ff", color: "#0891B2" },
    { label: "Total Customers", value: customers.length, icon: "👥", bg: "#f0fdf4", color: "#059669" },
    { label: "Revenue", value: `₹${analytics.totalRevenue.toLocaleString("en-IN")}`, icon: "₹", bg: "#fffbeb", color: "#D97706" },
  ];

  const lowStock = products.filter(p => (p.stock || 0) <= 10).slice(0, 5);
  const recentOrders = orders.slice(0, 6);
  const recentCustomers = customers.slice(0, 4);

  const chartData = analytics.monthlySales.map((val, i) => ({ month: analytics.monthLabels[i], revenue: val }));
  const pieData = Object.entries(analytics.categoryData).map(([name, value]) => ({ name, value }));

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Dashboard</h1>
          <p className="adm-page-sub">Welcome back, {adminSession?.name} 👋</p>
        </div>
        <span className="adm-date">{new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
      </div>

      {/* Stats */}
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

      {/* Charts */}
      <div className="adm-dash-grid">
        <div className="adm-card">
          <h3 className="adm-card-title">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0e8e8" />
              <XAxis dataKey="month" stroke="#aaa" tick={{ fontSize: 12 }} />
              <YAxis stroke="#aaa" tick={{ fontSize: 12 }} tickFormatter={v => `₹${v / 1000}k`} />
              <Tooltip formatter={v => `₹${v.toLocaleString("en-IN")}`}
                contentStyle={{ background: "#fff", border: "1px solid #eadede", borderRadius: 8 }} />
              <Bar dataKey="revenue" fill="#e8d6d9" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="adm-card">
          <h3 className="adm-card-title">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={75} dataKey="value"
                label={({ name, value }) => `${name} ${value}%`} labelLine={false}>
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#fff", border: "1px solid #eadede", borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="adm-category-list" style={{ marginTop: 8 }}>
            {pieData.map((d, i) => (
              <div key={d.name} className="adm-category-row">
                <span className="adm-cat-name">{d.name}</span>
                <div className="adm-cat-bar-wrap"><div className="adm-cat-bar" style={{ width: `${d.value}%`, background: PIE_COLORS[i] }} /></div>
                <span className="adm-cat-pct">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="adm-card" style={{ marginBottom: 24 }}>
        <h3 className="adm-card-title">Quick Actions</h3>
        <div className="adm-quick-actions">
          {[
            { label: "Add Product", icon: "+", to: "/store-admin/products" },
            { label: "View Orders", icon: "📦", to: "/store-admin/orders" },
            { label: "Customers", icon: "👥", to: "/store-admin/customers" },
            { label: "Analytics", icon: "📊", to: "/store-admin/analytics" },
            { label: "Settings", icon: "⚙", to: "/store-admin/settings" },
          ].map(a => (
            <button key={a.label} className="adm-quick-btn" onClick={() => navigate(a.to)}>
              <span className="adm-quick-icon">{a.icon}</span>
              <span>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom 3-col grid */}
      <div className="sa-bottom-grid">
        {/* Recent Orders */}
        <div className="adm-card sa-col-2">
          <div className="adm-card-head">
            <h3 className="adm-card-title">Recent Orders</h3>
            <button className="adm-link-btn" onClick={() => navigate("/store-admin/orders")}>View All →</button>
          </div>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead><tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.id}>
                    <td><span className="adm-order-id">{o.id}</span></td>
                    <td>{o.customer}</td>
                    <td className="adm-amount">₹{o.amount.toLocaleString("en-IN")}</td>
                    <td><span className="adm-status-badge" style={{ background: `${STATUS_COLORS[o.status] || "#aaa"}20`, color: STATUS_COLORS[o.status] || "#aaa" }}>{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock + Recent Customers stacked */}
        <div className="sa-col-1">
          <div className="adm-card" style={{ marginBottom: 20 }}>
            <h3 className="adm-card-title">Low Stock</h3>
            {lowStock.length === 0
              ? <p className="adm-empty">All products well stocked</p>
              : lowStock.map(p => (
                <div key={p.id} className="sa-stock-row">
                  <span className="sa-stock-name">{p.name}</span>
                  <span className={`sa-stock-badge ${(p.stock || 0) === 0 ? "sa-out" : "sa-low"}`}>
                    {p.stock || 0} left
                  </span>
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
              <div key={c.id} className="sa-customer-row">
                <div className="adm-customer-avatar" style={{ width: 32, height: 32, fontSize: 13 }}>{c.name[0]}</div>
                <div>
                  <div className="adm-customer-name" style={{ fontSize: 13 }}>{c.name}</div>
                  <div className="adm-customer-email">{c.email}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
