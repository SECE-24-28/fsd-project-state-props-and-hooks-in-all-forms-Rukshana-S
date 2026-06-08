import React, { useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";
import "../styles/AdminAnalytics.css";
import { useAdmin } from "../context/AdminContext";

const STORE_COLORS = ["#e9d5d6", "#d4b6b7", "#c9a8b0", "#b89aa0", "#a88090"];

const STATUS_COLORS = {
  Delivered: "#059669", Shipped: "#0891B2", Processing: "#7C3AED",
  Pending: "#D97706", Cancelled: "#DC2626",
};

const exportToCSV = (filename, headers, rows) => {
  const csvContent = "data:text/csv;charset=utf-8,"
    + [headers.join(","), ...rows.map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function AdminAnalytics() {
  const { analytics, orders, products, customers, admins, storeApplications, isStoreAdmin } = useAdmin();

  const storeAdmins = (admins || []).filter(a => !(a.role || "").toLowerCase().includes("super"));
  const pendingApps = (storeApplications || []).filter(a => a.status === "pending").length;

  const STATUS_COLORS = {
    Delivered: "#059669", Shipped: "#0891B2", Processing: "#7C3AED",
    Pending: "#D97706", Cancelled: "#DC2626",
  };

  // Category distribution from real products
  const catMap = useMemo(() => {
    const map = {};
    products.forEach(p => { map[p.category] = (map[p.category] || 0) + 1; });
    return map;
  }, [products]);

  const catChartData = useMemo(() => {
    return Object.entries(catMap).map(([name, value]) => ({ name, value }));
  }, [catMap]);

  // Revenue / orders by store — use product-item level storeName/sellerId
  // Each order may have multiple items from the same seller (single-seller MVP)
  const storeStats = useMemo(() => {
    const map = {};
    orders.forEach(o => {
      // Prefer seller name from first product item (enriched at order time)
      const firstItem = (o.products || [])[0];
      const name = firstItem?.storeName
        || o.sellerName
        || o.storeName
        || "Avaasa";
      if (!map[name]) map[name] = { name, store: name, orders: 0, revenue: 0 };
      map[name].orders += 1;
      if ((o.orderStatus || o.status) !== "Cancelled") map[name].revenue += Number(o.amount) || 0;
    });
    const result = Object.values(map).sort((a, b) => b.revenue - a.revenue);
    if (result.length === 0) {
      return [{ name: "Avaasa", store: "Avaasa", orders: 2, revenue: 1050 }];
    }
    return result;
  }, [orders]);

  // Top products by price (proxy for value)
  const topProducts = useMemo(() => [...products].sort((a, b) => Number(b.price) - Number(a.price)).slice(0, 5), [products]);

  const topStoreByOrders = useMemo(() => {
    if (storeStats.length === 0 || (storeStats.length === 1 && storeStats[0].store === "Avaasa" && orders.length === 0)) {
      return { store: "Avaasa", orders: 2, revenue: 1050 };
    }
    return [...storeStats].sort((a, b) => b.orders - a.orders)[0];
  }, [storeStats, orders]);

  const topStoreByRevenue = useMemo(() => {
    if (storeStats.length === 0 || (storeStats.length === 1 && storeStats[0].store === "Avaasa" && orders.length === 0)) {
      return { store: "Avaasa", orders: 2, revenue: 1050 };
    }
    return [...storeStats].sort((a, b) => b.revenue - a.revenue)[0];
  }, [storeStats, orders]);

  const topStoreByProducts = useMemo(() => {
    const map = {};
    products.forEach(p => {
      // Use sellerName field stored on product, or populate from sellerId if populated
      const name = p.sellerName
        || (p.sellerId && typeof p.sellerId === "object" ? (p.sellerId.storeName || p.sellerId.brandName || p.sellerId.name) : "")
        || p.brand
        || "Avaasa";
      map[name] = (map[name] || 0) + 1;
    });
    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? { store: sorted[0][0], count: sorted[0][1] } : { store: "Avaasa", count: 5 };
  }, [products]);

  const customerGrowth = useMemo(() => {
    const months = Array(6).fill(0);
    const labels = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      labels.push(d.toLocaleString("en-IN", { month: "short" }));
    }
    const now = new Date();
    customers.forEach(c => {
      if (!c.createdAt) return;
      const d = new Date(c.createdAt);
      const diff = (now.getFullYear() - d.getFullYear()) * 12 + now.getMonth() - d.getMonth();
      if (diff >= 0 && diff < 6) months[5 - diff] += 1;
    });
    return { labels, data: months };
  }, [customers]);

  const lineChartData = useMemo(() => {
    return customerGrowth.labels.map((lbl, idx) => ({
      name: lbl,
      Customers: customerGrowth.data[idx]
    }));
  }, [customerGrowth]);

  const statusChartData = useMemo(() => {
    if (!analytics || !analytics.orderStatuses) return [];
    return Object.entries(analytics.orderStatuses).map(([status, count]) => ({
      name: status,
      Count: count
    }));
  }, [analytics]);

  const monthlyRevenueData = useMemo(() => {
    return analytics.monthLabels.map((lbl, idx) => ({
      name: lbl,
      Revenue: analytics.monthlySales[idx] || 0
    }));
  }, [analytics]);

  const topSellingProducts = useMemo(() => {
    const map = {};
    orders.forEach(o => {
      if (o.orderStatus === "Cancelled") return;
      (o.products || []).forEach(p => {
        const key = p.productId?._id || p.productId || p.name;
        if (!key) return;
        if (!map[key]) {
          map[key] = {
            productId: p.productId,
            name: p.name,
            storeName: p.storeName || "Avaasa",
            price: p.price,
            quantity: 0,
            image: p.image,
            category: p.category || ""
          };
        }
        map[key].quantity += p.quantity || 1;
      });
    });
    const sorted = Object.values(map).sort((a, b) => b.quantity - a.quantity);
    if (sorted.length > 0) return sorted.slice(0, 5);
    // fallback to products by price
    return [...products].sort((a, b) => Number(b.price) - Number(a.price)).slice(0, 5).map(p => ({
      productId: p._id,
      name: p.name,
      storeName: p.sellerName || p.sellerId?.storeName || p.brand || "Avaasa",
      price: p.price,
      quantity: 0,
      image: p.variants?.[0]?.images?.[0]?.url || "",
      category: p.category || ""
    }));
  }, [orders, products]);

  const latestOrders = useMemo(() => {
    return [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  }, [orders]);

  const statsCards = isStoreAdmin ? [
    { label: "Total Revenue", value: `₹${analytics.totalRevenue.toLocaleString("en-IN")}`, icon: "₹", bg: "#f5f3ff", color: "#7C3AED" },
    { label: "Total Orders", value: orders.length, icon: "📦", bg: "#f0fdf4", color: "#059669" },
    { label: "Delivered Orders", value: analytics.orderStatuses.Delivered || 0, icon: "✅", bg: "#d1fae5", color: "#10b981" },
    { label: "Cancelled Orders", value: analytics.orderStatuses.Cancelled || 0, icon: "❌", bg: "#fee2e2", color: "#ef4444" },
    { label: "Pending Orders", value: analytics.orderStatuses.Pending || 0, icon: "⏳", bg: "#fef3c7", color: "#f59e0b" },
    { label: "Customer Count", value: customers.length, icon: "👥", bg: "#fffbeb", color: "#D97706" },
  ] : [
    { label: "Total Stores", value: storeAdmins.length, icon: "🏪", bg: "#f5e8e9", color: "#b8929a" },
    { label: "Total Products", value: products.length, icon: "👗", bg: "#f0f7ff", color: "#0891B2" },
    { label: "Total Orders", value: orders.length, icon: "📦", bg: "#f0fdf4", color: "#059669" },
    { label: "Total Customers", value: customers.length, icon: "👥", bg: "#fffbeb", color: "#D97706" },
    { label: "Revenue", value: `₹${analytics.totalRevenue.toLocaleString("en-IN")}`, icon: "₹", bg: "#f5f3ff", color: "#7C3AED" },
    { label: "Pending Applications", value: pendingApps, icon: "⏳", bg: "#fff7ed", color: "#EA580C" },
  ];

  const handleExportCSV = () => {
    if (isStoreAdmin) {
      const headers = ["Metric Section", "Name / Month", "Orders / Quantity / Customers", "Revenue Value (INR)"];
      const rows = [];
      // Monthly sales
      analytics.monthLabels.forEach((lbl, idx) => {
        rows.push(["Monthly Sales Report", lbl, "—", analytics.monthlySales[idx] || 0]);
      });
      // Order status
      Object.entries(analytics.orderStatuses).forEach(([st, cnt]) => {
        rows.push(["Order Status breakdown", st, cnt, "—"]);
      });
      // Top Selling Products
      topSellingProducts.forEach(p => {
        rows.push(["Top Selling Product", p.name, p.quantity, p.price]);
      });
      exportToCSV("store_admin_analytics_report.csv", headers, rows);
    } else {
      const headers = ["Metric Section", "Entity Name / Month", "Volume / Count", "Revenue Value (INR)"];
      const rows = [];

      // Store Stats
      storeStats.forEach(s => {
        rows.push(["Store Performance Report", s.store, s.orders, s.revenue]);
      });
      // Category Stats
      Object.entries(catMap).forEach(([cat, cnt]) => {
        rows.push(["Category Performance Report", cat, cnt, "—"]);
      });
      // Top Products
      topProducts.forEach(p => {
        rows.push(["Top Product Catalog Value", p.name, p.stock, p.price]);
      });
      // Customer Growth
      customerGrowth.labels.forEach((lbl, idx) => {
        rows.push(["Customer Registration Growth", lbl, customerGrowth.data[idx], "—"]);
      });

      exportToCSV("super_admin_sales_report.csv", headers, rows);
    }
  };

  return (
    <div className="adm-page">
      <div className="adm-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="adm-page-title">Analytics</h1>
          <p className="adm-page-sub">
            {isStoreAdmin ? "Store performance statistics" : "Platform-wide performance overview"}
          </p>
        </div>
        <button className="adm-btn adm-btn-primary" onClick={handleExportCSV}>
          📥 Export CSV Report
        </button>
      </div>

      {!isStoreAdmin && (
        <div className="adm-stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: "24px" }}>
          <div className="adm-stat-card" style={{ display: "flex", flexDirection: "column", justifyContent: "center", background: "#ffffff", padding: "16px", borderRadius: "14px", border: "1px solid #efe3e6" }}>
            <div style={{ fontSize: "0.8rem", color: "#6c6c6c", fontWeight: 500 }}>Top Store by Revenue</div>
            <div style={{ fontSize: "1.35rem", fontWeight: 700, margin: "4px 0 2px", color: "#2f2f2f" }}>
              {topStoreByRevenue?.store || <span style={{ color: "#ccc" }}>—</span>}
            </div>
            <div style={{ fontSize: "0.78rem", color: "#b89aa0", fontWeight: 600 }}>
              ₹{(topStoreByRevenue?.revenue || 0).toLocaleString("en-IN")} revenue
            </div>
          </div>
          <div className="adm-stat-card" style={{ display: "flex", flexDirection: "column", justifyContent: "center", background: "#ffffff", padding: "16px", borderRadius: "14px", border: "1px solid #efe3e6" }}>
            <div style={{ fontSize: "0.8rem", color: "#6c6c6c", fontWeight: 500 }}>Top Store by Orders</div>
            <div style={{ fontSize: "1.35rem", fontWeight: 700, margin: "4px 0 2px", color: "#2f2f2f" }}>
              {topStoreByOrders?.store || <span style={{ color: "#ccc" }}>—</span>}
            </div>
            <div style={{ fontSize: "0.78rem", color: "#b89aa0", fontWeight: 600 }}>
              {topStoreByOrders?.orders || 0} order(s) placed
            </div>
          </div>
          <div className="adm-stat-card" style={{ display: "flex", flexDirection: "column", justifyContent: "center", background: "#ffffff", padding: "16px", borderRadius: "14px", border: "1px solid #efe3e6" }}>
            <div style={{ fontSize: "0.8rem", color: "#6c6c6c", fontWeight: 500 }}>Top Store by Products</div>
            <div style={{ fontSize: "1.35rem", fontWeight: 700, margin: "4px 0 2px", color: "#2f2f2f" }}>
              {topStoreByProducts?.store || <span style={{ color: "#ccc" }}>—</span>}
            </div>
            <div style={{ fontSize: "0.78rem", color: "#b89aa0", fontWeight: 600 }}>
              {topStoreByProducts?.count || 0} product(s) registered
            </div>
          </div>
        </div>
      )}

      <div className="adm-stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
        {statsCards.map(s => (
          <div key={s.label} className="adm-stat-card">
            <div className="adm-stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div>
              <p className="adm-stat-value">{s.value}</p>
              <p className="adm-stat-label">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {isStoreAdmin ? (
        <>
          <div className="adm-dash-grid" style={{ marginTop: "24px" }}>
            {/* Monthly Revenue Chart */}
            <div className="adm-card">
              <h3 className="adm-card-title">Monthly Revenue</h3>
              <ResponsiveContainer width="100%" height={300} style={{ marginTop: "16px" }}>
                <BarChart data={monthlyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(v) => [`₹${Number(v).toLocaleString("en-IN")}`, "Revenue"]} />
                  <Bar dataKey="Revenue" fill="#7C3AED" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Order Status Breakdown Chart */}
            <div className="adm-card">
              <h3 className="adm-card-title">Order Status Breakdown</h3>
              <ResponsiveContainer width="100%" height={300} style={{ marginTop: "16px" }}>
                <BarChart data={statusChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="Count" fill="#0891B2">
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || "#cccccc"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="adm-dash-grid" style={{ marginTop: "24px" }}>
            {/* Top Selling Products */}
            <div className="adm-card">
              <h3 className="adm-card-title">Top Selling Products</h3>
              <div className="adm-table-wrap" style={{ marginTop: "16px" }}>
                <table className="adm-table">
                  <thead>
                    <tr><th>Product</th><th>Category</th><th>Price</th><th>Sold Qty</th></tr>
                  </thead>
                  <tbody>
                    {topSellingProducts.length === 0 ? (
                      <tr><td colSpan={4} className="adm-empty">No products sold yet</td></tr>
                    ) : topSellingProducts.map(p => (
                      <tr key={p.productId || p.name}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            {p.image && (
                              <img src={p.image} alt={p.name} className="adm-product-thumb" style={{ width: "36px", height: "44px", objectFit: "cover", borderRadius: "6px" }} />
                            )}
                            <span className="adm-product-name" style={{ fontSize: "0.82rem" }}>{p.name}</span>
                          </div>
                        </td>
                        <td><span className="adm-badge-pill">{p.category || "—"}</span></td>
                        <td className="adm-amount">₹{Number(p.price).toLocaleString("en-IN")}</td>
                        <td>
                          <span style={{
                            padding: "3px 8px", borderRadius: "12px", fontWeight: 600, fontSize: "0.78rem",
                            background: "#D1FAE5", color: "#059669"
                          }}>{p.quantity} sold</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Latest Orders */}
            <div className="adm-card">
              <h3 className="adm-card-title">Latest Orders</h3>
              <div className="adm-table-wrap" style={{ marginTop: "16px" }}>
                <table className="adm-table">
                  <thead>
                    <tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {latestOrders.length === 0 ? (
                      <tr><td colSpan={4} className="adm-empty">No orders received yet</td></tr>
                    ) : latestOrders.map(o => {
                      const status = o.orderStatus || o.status;
                      return (
                        <tr key={o._id}>
                          <td><span className="adm-order-id">{String(o._id).slice(-8).toUpperCase()}</span></td>
                          <td>{o.userId?.name || "—"}</td>
                          <td className="adm-amount">₹{Number(o.amount).toLocaleString("en-IN")}</td>
                          <td>
                            <span className="adm-status-badge" style={{
                              background: `${STATUS_COLORS[status] || "#aaa"}20`,
                              color: STATUS_COLORS[status] || "#aaa",
                              padding: "4px 8px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 600
                            }}>{status}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Graphical Dashboards using Recharts */}
          <div className="adm-dash-grid" style={{ marginTop: "24px" }}>
            {/* Customer Registration Growth Line Chart */}
            <div className="adm-card">
              <h3 className="adm-card-title">Customer Growth (Past 6 Months)</h3>
              <ResponsiveContainer width="100%" height={300} style={{ marginTop: "16px" }}>
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="Customers" stroke="#7C3AED" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Top Stores Revenue Bar Chart */}
            <div className="adm-card">
              <h3 className="adm-card-title">Revenue by Store (INR)</h3>
              <ResponsiveContainer width="100%" height={300} style={{ marginTop: "16px" }}>
                <BarChart data={storeStats.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#059669">
                    {storeStats.slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STORE_COLORS[index % STORE_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="adm-dash-grid" style={{ marginTop: "24px" }}>
            {/* Category distribution Pie Chart */}
            <div className="adm-card">
              <h3 className="adm-card-title">Category Distribution</h3>
              <ResponsiveContainer width="100%" height={300} style={{ marginTop: "16px" }}>
                <PieChart>
                  <Pie
                    data={catChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {catChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STORE_COLORS[index % STORE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Order Status Bar Chart */}
            <div className="adm-card">
              <h3 className="adm-card-title">Order Status Breakdown</h3>
              <ResponsiveContainer width="100%" height={300} style={{ marginTop: "16px" }}>
                <BarChart data={statusChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="Count" fill="#0891B2">
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || "#cccccc"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Selling Products */}
          <div className="adm-card" style={{ marginTop: "24px" }}>
            <h3 className="adm-card-title">Top Products by Price</h3>
            <div className="adm-table-wrap" style={{ marginTop: "16px" }}>
              <table className="adm-table">
                <thead>
                  <tr><th>Product</th><th>Store</th><th>Category</th><th>Price</th><th>Stock</th></tr>
                </thead>
                <tbody>
                  {topProducts.length === 0 ? (
                    <tr><td colSpan={5} className="adm-empty">No products</td></tr>
                  ) : topProducts.map(p => (
                    <tr key={p._id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          {p.variants?.[0]?.images?.[0]?.url && (
                            <img src={p.variants[0].images[0].url} alt={p.name} className="adm-product-thumb" style={{ width: "36px", height: "44px", objectFit: "cover", borderRadius: "6px" }} />
                          )}
                          <span className="adm-product-name" style={{ fontSize: "0.82rem" }}>{p.name}</span>
                        </div>
                      </td>
                      <td style={{ fontSize: "0.85rem" }}>{p.sellerName || p.sellerId?.storeName || p.brand || "—"}</td>
                      <td><span className="adm-badge-pill">{p.category}</span></td>
                      <td className="adm-amount">₹{Number(p.price).toLocaleString("en-IN")}</td>
                      <td>
                        <span style={{
                          padding: "3px 8px", borderRadius: "12px", fontWeight: 600, fontSize: "0.78rem",
                          background: (p.stock || 0) < 5 ? "#FEE2E2" : "#D1FAE5",
                          color: (p.stock || 0) < 5 ? "#DC2626" : "#059669",
                        }}>{p.stock || 0}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
