import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import OrderTimeline from "../Components/OrderTimeline";
import OrderStatusBadge from "../Components/OrderStatusBadge";
import "../Assets/Css/checkout.css";

export default function OrderTracking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/orders/${id}`)
      .then(res => setOrder(res.data.data))
      .catch(err => console.error("Error loading order for tracking:", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main id="app-viewport">
        <div className="container" style={{ padding: "80px 0", textAlign: "center" }}>
          <p>Loading tracking information...</p>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main id="app-viewport">
        <div className="container" style={{ padding: "80px 0", textAlign: "center" }}>
          <h2>Order Not Found</h2>
          <button className="btn-primary" onClick={() => navigate("/")}>Go Home</button>
        </div>
      </main>
    );
  }

  return (
    <main id="app-viewport">
      <div className="view-container">
        <div className="container" style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 700, margin: 0 }}>Track Order</h1>
            <OrderStatusBadge status={order.orderStatus} />
          </div>

          <div className="co-card" style={{ marginBottom: "24px", padding: "24px" }}>
            <p style={{ margin: "0 0 12px 0", color: "#666", fontSize: "0.9rem" }}>
              Order ID: <strong style={{ color: "#111" }}>{order._id}</strong>
            </p>
            <p style={{ margin: "0 0 12px 0", color: "#666", fontSize: "0.9rem" }}>
              Placed On: <strong style={{ color: "#111" }}>{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</strong>
            </p>
            <p style={{ margin: "0 0 24px 0", color: "#666", fontSize: "0.9rem" }}>
              Payment Mode: <strong style={{ color: "#111" }}>{order.paymentMethod ? order.paymentMethod.toUpperCase() : "COD"}</strong>
            </p>

            <div style={{ borderTop: "1px solid #eee", paddingTop: "24px" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 600, margin: "0 0 16px 0" }}>Shipment Progress</h3>
              <OrderTimeline statusHistory={order.statusHistory} currentStatus={order.orderStatus} />
            </div>
          </div>

          {/* Delivery Details */}
          <div className="co-card" style={{ marginBottom: "24px", padding: "24px" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 600, margin: "0 0 12px 0" }}>Delivery Address</h3>
            <p style={{ margin: 0, fontWeight: 500, fontSize: "0.95rem" }}>{order.address?.fullName || order.address?.name}</p>
            <p style={{ margin: "4px 0", color: "#555", fontSize: "0.9rem" }}>
              {order.address?.addressLine || order.address?.street}, {order.address?.city}, {order.address?.state} — {order.address?.pincode}
            </p>
            <p style={{ margin: 0, color: "#555", fontSize: "0.9rem" }}>Phone: {order.address?.phone}</p>
          </div>

          {/* Items Ordered */}
          <div className="co-card" style={{ padding: "24px" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 600, margin: "0 0 16px 0" }}>Items Ordered</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {order.products?.map((item, idx) => (
                <div key={idx} style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                  <img src={item.image || "/placeholder-product.png"} alt={item.name} style={{ width: "60px", height: "75px", objectFit: "cover", borderRadius: "8px", border: "1px solid #eee" }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: "0.95rem" }}>{item.name}</p>
                    <p style={{ margin: "4px 0 0 0", color: "#666", fontSize: "0.85rem" }}>
                      Size: {item.size || "Free Size"} {item.color && ` · Color: ${item.color}`} {` · Qty: ${item.quantity}`}
                    </p>
                  </div>
                  <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid #eee", marginTop: "24px", paddingTop: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 600 }}>Grand Total</span>
              <span style={{ fontWeight: 700, fontSize: "1.2rem" }}>₹{order.amount?.toLocaleString()}</span>
            </div>
          </div>

          <div style={{ marginTop: "32px", display: "flex", gap: "16px" }}>
            <button className="btn-secondary" style={{ flex: 1 }} onClick={() => navigate("/orders")}>
              View All Orders
            </button>
            <button className="btn-primary" style={{ flex: 1 }} onClick={() => navigate("/")}>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
