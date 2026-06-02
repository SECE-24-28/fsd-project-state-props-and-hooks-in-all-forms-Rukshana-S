import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../Assets/Css/checkout.css";

const PAYMENT_LABELS = {
  cod: "Cash on Delivery", upi: "UPI",
  card: "Credit / Debit Card", netbank: "Net Banking", wallet: "Wallet",
};

export default function OrderSuccess() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    try {
      const last = JSON.parse(localStorage.getItem("wearly_lastOrder"));
      if (last) setOrder(last);
    } catch { /* ignore */ }
  }, []);

  const orderId = params.get("id") || order?.orderId || "WRLY000000000000";

  const deliveryDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  })();

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

              {/* Order Details */}
              <div className="os-details">
                <div className="os-detail-row">
                  <span className="os-detail-label">Order ID</span>
                  <span className="os-order-id">{orderId}</span>
                </div>
                <div className="os-detail-row">
                  <span className="os-detail-label">Estimated Delivery</span>
                  <span className="os-detail-value">3–7 Business Days</span>
                </div>
                <div className="os-detail-row">
                  <span className="os-detail-label">Expected By</span>
                  <span className="os-detail-value">{deliveryDate}</span>
                </div>
                {order?.totals?.grand && (
                  <div className="os-detail-row">
                    <span className="os-detail-label">Amount Paid</span>
                    <span className="os-detail-value os-amount">₹{order.totals.grand.toLocaleString()}</span>
                  </div>
                )}
                {order?.paymentMethod && (
                  <div className="os-detail-row">
                    <span className="os-detail-label">Payment Method</span>
                    <span className="os-detail-value">{PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}</span>
                  </div>
                )}
                {order?.shippingAddress && (
                  <div className="os-detail-row">
                    <span className="os-detail-label">Deliver To</span>
                    <span className="os-detail-value">
                      {order.shippingAddress.fullName}, {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}
                    </span>
                  </div>
                )}
              </div>

              {/* Items */}
              {order?.items?.length > 0 && (
                <div className="os-items">
                  <p className="os-items-label">Items Ordered ({order.items.reduce((s,i)=>s+i.qty,0)})</p>
                  {order.items.map((item, i) => (
                    <div key={i} className="os-item-row">
                      <img src={item.image} alt={item.name} className="os-item-img" />
                      <div className="os-item-info">
                        <p className="os-item-name">{item.name}</p>
                        <p className="os-item-meta">
                          {item.size && `Size: ${item.size}`}
                          {item.colorLabel && ` · ${item.colorLabel}`}
                          {` · Qty: ${item.qty}`}
                        </p>
                      </div>
                      <span className="os-item-price">₹{(item.price * item.qty).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="os-actions">
                <button className="btn-primary" onClick={() => { navigate("/products"); window.scrollTo(0,0); }}>
                  Continue Shopping
                </button>
                <button className="btn-secondary" onClick={() => { navigate("/"); window.scrollTo(0,0); }}>
                  Back to Home
                </button>
              </div>

              {order?.shippingAddress?.email && (
                <p className="os-email-note">
                  Confirmation sent to {order.shippingAddress.email}
                </p>
              )}
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
