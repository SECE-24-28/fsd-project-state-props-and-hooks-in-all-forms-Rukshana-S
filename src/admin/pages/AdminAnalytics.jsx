import React from "react";
import "../styles/AdminAnalytics.css";
import { useAdmin } from "../context/AdminContext";
import { PRODUCTS } from "../../context/StoreContext";

export default function AdminAnalytics() {
  const { analytics, orders } = useAdmin();

  const maxSale = Math.max(...analytics.monthlySales);

  const topProducts = PRODUCTS.slice(0, 5).map((p, i) => ({
    ...p,
    sold: [42, 38, 35, 30, 28][i],
    revenue: p.price * [42, 38, 35, 30, 28][i],
  }));

  const STATUS_COLORS = {
    Delivered: "#059669", Shipped: "#0891B2", Processing: "#7C3AED",
    Confirmed: "#16A34A", Pending: "#D97706", Cancelled: "#DC2626", Refunded: "#6B7280"
  };

  const analyticsStats = [
    { label: "Total Revenue", value: `₹${analytics.totalRevenue.toLocaleString("en-IN")}`, icon: "₹", color: "#b8929a", bg: "#f5e8e9" },
    { label: "Orders This Month", value: orders.filter(o => o.status !== "Cancelled").length, icon: "🗒", color: "#5a8fa8", bg: "#eaf3f8" },
    { label: "New Customers", value: analytics.totalCustomers, icon: "👥", color: "#5a8a68", bg: "#eaf5ee" },
    { label: "Products in Store", value: PRODUCTS.length, icon: "◫", color: "#9a7ab8", bg: "#f2eef8" },
  ];

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Analytics</h1>
          <p className="adm-page-sub">Store performance overview</p>
        </div>
      </div>

      <div className="adm-stats-grid">
        {analyticsStats.map(s => (
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
        {/* Monthly Sales Bar Chart */}
        <div className="adm-card adm-chart-card">
          <h3 className="adm-card-title">Monthly Revenue</h3>
          <div className="adm-bar-chart">
            {analytics.monthlySales.map((val, i) => (
              <div key={i} className="adm-bar-col">
                <span className="adm-bar-val">₹{(val / 1000).toFixed(0)}k</span>
                <div className="adm-bar" style={{ height: `${(val / maxSale) * 100}%` }} />
                <span className="adm-bar-label">{analytics.monthLabels[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Order status breakdown */}
        <div className="adm-card">
          <h3 className="adm-card-title">Order Status Breakdown</h3>
          <div className="adm-category-list" style={{ gap: "12px" }}>
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
          </div>
        </div>
      </div>

      {/* Category performance */}
      <div className="adm-dash-grid" style={{ marginTop: "24px" }}>
        <div className="adm-card">
          <h3 className="adm-card-title">Sales by Category</h3>
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

        {/* Top Products */}
        <div className="adm-card">
          <h3 className="adm-card-title">Top Selling Products</h3>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr><th>Product</th><th>Category</th><th>Sold</th><th>Revenue</th></tr>
              </thead>
              <tbody>
                {topProducts.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <img src={p.image} alt={p.name} className="adm-product-thumb" style={{ width: "36px", height: "44px" }} />
                        <span className="adm-product-name" style={{ fontSize: "0.82rem" }}>{p.name}</span>
                      </div>
                    </td>
                    <td><span className="adm-badge-pill">{p.category}</span></td>
                    <td>{p.sold}</td>
                    <td className="adm-amount">₹{p.revenue.toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
