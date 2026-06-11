import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../services/api";
import "../Assets/Css/checkout.css";

const PAYMENT_LABELS = {
  cod: "Cash on Delivery", upi: "UPI",
  card: "Credit / Debit Card", netbank: "Net Banking", wallet: "Wallet",
};

export default function OrderSuccess() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [order, setOrder] = useState(null);

  const orderId = params.get("id");

  useEffect(() => {
    window.scrollTo(0, 0);
    if (orderId) {
      api.get(`/orders/${orderId}`)
        .then((res) => {
          setOrder(res.data.data);
        })
        .catch((err) => {
          console.error("Error fetching order:", err);
        });
    }
  }, [orderId]);

  const deliveryDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  })();

  const amountPaid = order?.amount || 0;
  const paymentMethod = order?.paymentMethod || "";
  const address = order?.address || null;
  const products = order?.products || [];

  return (
    <main id="app-viewport">
      <div className="view-container">
        <div className="container">
          <div className="os-page">

            {/* Success Card */}
            <div className="os-card">

              {/* Icon */}
              <div className="os-icon-ring">
                <span className="os-checkmark">✓</span>
              </div>

              <h1 className="os-title">Order Placed Successfully!</h1>
              <p className="os-subtitle">
                Thank you for shopping with <strong>WEARLY</strong>.<br />
                Your order has been confirmed.
              </p>

              {order?.appliedCoupon && order.appliedCoupon.code && (
                <div style={{ margin: "20px 0", padding: "12px", borderRadius: "8px", background: "#d1fae5", color: "#059669", fontWeight: 600, border: "1px solid #a7f3d0", textAlign: "center" }}>
                  Reward Applied Successfully ✓ <br/>
                  <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>
                    {order.appliedCoupon.type === "15_OFF" ? "15% OFF" : order.appliedCoupon.type === "25_OFF" ? "25% OFF" : "FREE SHIPPING"} Coupon Used
                  </span>
                </div>
              )}

              {/* Order Details */}
              <div className="os-details">
                <div className="os-detail-row">
                  <span className="os-detail-label">Order ID</span>
                  <span className="os-order-id">{orderId || "—"}</span>
                </div>
                <div className="os-detail-row">
                  <span className="os-detail-label">Estimated Delivery</span>
                  <span className="os-detail-value">3–7 Business Days</span>
                </div>
                <div className="os-detail-row">
                  <span className="os-detail-label">Expected By</span>
                  <span className="os-detail-value">{deliveryDate}</span>
                </div>
                <div className="os-detail-row">
                  <span className="os-detail-label">Order Date</span>
                  <span className="os-detail-value">
                    {order?.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>
                {amountPaid > 0 && (
                  <div className="os-detail-row">
                    <span className="os-detail-label">Amount Paid</span>
                    <span className="os-detail-value os-amount">₹{amountPaid.toLocaleString()}</span>
                  </div>
                )}
                {paymentMethod && (
                  <div className="os-detail-row">
                    <span className="os-detail-label">Payment Method</span>
                    <span className="os-detail-value">{PAYMENT_LABELS[paymentMethod] || paymentMethod}</span>
                  </div>
                )}
                {address && (
                  <div className="os-detail-row">
                    <span className="os-detail-label">Deliver To</span>
                    <span className="os-detail-value">
                      {address.name}, {address.city}, {address.state} — {address.pincode}
                    </span>
                  </div>
                )}
              </div>

              {/* Order Status Tracking Timeline */}
              {order?.orderStatus === "Cancelled" ? (
                <div className="os-cancelled-banner" style={{ margin: "24px 0", padding: "15px", borderRadius: "8px", background: "#fee2e2", color: "#dc2626", border: "1px solid #fca5a5", textAlign: "center", fontWeight: 600, fontSize: "0.9rem" }}>
                  This order has been Cancelled.
                </div>
              ) : (
                <div className="os-timeline-container" style={{ margin: "32px 0", padding: "0 10px" }}>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 600, color: "#111", marginBottom: "20px", textAlign: "left" }}>Order Status Tracking</h3>
                  <div style={{ display: "flex", justifyContent: "space-between", position: "relative", alignItems: "center" }}>
                    <div style={{ position: "absolute", left: "10%", right: "10%", top: "16px", height: "4px", background: "#eee", zIndex: 1 }} />
                    <div style={{
                      position: "absolute",
                      left: "10%",
                      width: `${(Math.max(0, ["Pending", "Processing", "Shipped", "Delivered"].indexOf(order?.orderStatus || "Pending")) / 3) * 80}%`,
                      top: "16px",
                      height: "4px",
                      background: "#059669",
                      zIndex: 1,
                      transition: "width 0.3s ease"
                    }} />

                    {[
                      { label: "Ordered", status: "Pending" },
                      { label: "Processing", status: "Processing" },
                      { label: "Shipped", status: "Shipped" },
                      { label: "Delivered", status: "Delivered" }
                    ].map((stage, idx) => {
                      const stagesList = ["Pending", "Processing", "Shipped", "Delivered"];
                      const currentIdx = stagesList.indexOf(order?.orderStatus || "Pending");
                      const isCompleted = idx <= currentIdx;
                      const isActive = idx === currentIdx;
                      return (
                        <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative", zIndex: 2, flex: 1 }}>
                          <div style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            background: isCompleted ? "#059669" : "#fff",
                            border: isCompleted ? "none" : "2px solid #ccc",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: isCompleted ? "#fff" : "#999",
                            fontWeight: 700,
                            fontSize: "0.8rem",
                            boxShadow: isActive ? "0 0 0 4px rgba(5,150,105,0.2)" : "none",
                            transition: "all 0.3s ease"
                          }}>
                            {isCompleted ? "✓" : idx + 1}
                          </div>
                          <span style={{
                            marginTop: "8px",
                            fontSize: "0.78rem",
                            fontWeight: isActive ? 600 : 500,
                            color: isActive ? "#000" : isCompleted ? "#059669" : "#666",
                            textAlign: "center"
                          }}>
                            {stage.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Items */}
              {products.length > 0 && (
                <div className="os-items">
                  <p className="os-items-label">Items Ordered ({products.reduce((s,i)=>s+(i.quantity || 1),0)})</p>
                  {products.map((item, i) => (
                    <div key={i} className="os-item-row">
                      <img src={item.image} alt={item.name} className="os-item-img" />
                      <div className="os-item-info">
                        <p className="os-item-name">{item.name}</p>
                        <p className="os-item-meta">
                          {item.size && `Size: ${item.size}`}
                          {item.color && ` · Color: ${item.color}`}
                          {` · Qty: ${item.quantity || 1}`}
                        </p>
                      </div>
                      <span className="os-item-price">₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="os-actions" style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "24px" }}>
                <button className="btn-primary" onClick={() => { navigate(`/orders/${orderId}`); window.scrollTo(0,0); }}>
                  Track Order
                </button>
                <button className="btn-secondary" onClick={() => { navigate("/orders"); window.scrollTo(0,0); }}>
                  View Orders
                </button>
                <button className="btn-secondary" onClick={() => { navigate("/products"); window.scrollTo(0,0); }}>
                  Continue Shopping
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
