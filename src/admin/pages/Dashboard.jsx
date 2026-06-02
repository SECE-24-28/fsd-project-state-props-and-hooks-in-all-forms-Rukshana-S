import React from "react";
import "../styles/AdminDashboard.css";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function Dashboard() {
  const { orders, customers, analytics, products, adminSession, isSuperAdmin } = useAdmin();
  const navigate = useNavigate();

  const stats = [
    { label: "Total Products", value: products.length, icon: "◫", color: "#e7d4d8", bg: "#f4f0f1" },
    { label: "Total Orders", value: orders.length, icon: "🗒", color: "#d8bfc6", bg: "#f9f6f7" },
    { label: "Total Customers", value: customers.length, icon: "👥", color: "#2a2a2a", bg: "#f4f0f1" },
    { label: "Total Revenue", value: `₹${analytics.totalRevenue.toLocaleString("en-IN")}`, icon: "₹", color: "#2d2d2d", bg: "#f4f0f1" },
  ];

  const recentOrders = orders.slice(0, 5);

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

      <div className="adm-dash-grid">
        {/* Sales Chart */}
        <div className="adm-card">
          <h3 className="adm-card-title">Monthly Sales Overview</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={analytics.monthlySales.map((val, i) => ({ month: analytics.monthLabels[i], sales: val }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#efe3e6" />
              <XAxis dataKey="month" stroke="#7a7a7a" />
              <YAxis stroke="#7a7a7a" />
              <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #efe3e6", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />
              <Bar dataKey="sales" fill="#e7d4d8" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="adm-card">
          <h3 className="adm-card-title">Sales by Category</h3>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={Object.entries(analytics.categoryData).map(([name, value]) => ({ name, value }))} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                  <Cell fill="#e7d4d8" />
                  <Cell fill="#d8bfc6" />
                  <Cell fill="#f4f0f1" />
                  <Cell fill="#efe3e6" />
                </Pie>
                <Tooltip contentStyle={{ background: "#ffffff", border: "1px solid #efe3e6", borderRadius: "8px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="adm-category-list">
            {Object.entries(analytics.categoryData).map(([cat, pct]) => (
              <div key={cat} className="adm-category-row">
                <span className="adm-cat-name">{cat}</span>
                <div className="adm-cat-bar-wrap">
                  <div className="adm-cat-bar" style={{ width: `${pct}%` }} />
                </div>
                <span className="adm-cat-pct">{pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="adm-card" style={{ marginBottom: "24px" }}>
        <h3 className="adm-card-title">Quick Actions</h3>
        <div className="adm-quick-actions">
          {[
            { label: "Add Product", icon: "＋", to: "/admin/products" },
            { label: "Manage Orders", icon: "🗒", to: "/admin/orders" },
            { label: "View Users", icon: "👥", to: "/admin/users" },
            { label: "Analytics", icon: "📊", to: "/admin/analytics" },
            { label: "Settings", icon: "⚙", to: "/admin/settings" },
            ...(isSuperAdmin ? [{ label: "Manage Admins", icon: "👤", to: "/admin/admins" }] : []),
          ].map(a => (
            <button key={a.label} className="adm-quick-btn" onClick={() => navigate(a.to)}>
              <span className="adm-quick-icon">{a.icon}</span>
              <span>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="adm-card">
        <div className="adm-card-head">
          <h3 className="adm-card-title">Recent Orders</h3>
          <button className="adm-link-btn" onClick={() => navigate("/admin/orders")}>View All →</button>
        </div>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Order ID</th><th>Customer</th><th>Date</th><th>Amount</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(o => {
                const statusColorMap = {
                  Delivered: "#059669", Shipped: "#0891B2", Processing: "#7C3AED",
                  Confirmed: "#16A34A", Pending: "#D97706", Cancelled: "#DC2626", Refunded: "#6B7280"
                };
                return (
                  <tr key={o.id}>
                    <td><span className="adm-order-id">{o.id}</span></td>
                    <td>{o.customer}</td>
                    <td>{o.date}</td>
                    <td className="adm-amount">₹{o.amount.toLocaleString("en-IN")}</td>
                    <td><span className="adm-status-badge" style={{ background: `${statusColorMap[o.status] || "#ccc"}20`, color: statusColorMap[o.status] || "#ccc" }}>{o.status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
