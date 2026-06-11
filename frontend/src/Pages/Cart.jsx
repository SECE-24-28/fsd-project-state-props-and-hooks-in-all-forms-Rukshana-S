import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { useAuth } from "../context/AuthContext";
import { ShoppingBag, Tag, ArrowRight } from "lucide-react";
import "../Assets/Css/cart.css";

const COUPONS = {
  SELLER70: { pct: 70, label: "SELLER70 — 70% OFF" },
  WELCOME10: { pct: 10, label: "WELCOME10 — 10% OFF" },
};
const GST_RATE = 0.05;

export default function Cart() {
  const { cartItems, removeFromCart, updateQty, clearCart, cartLoading } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [couponInput, setCouponInput]   = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMsg, setCouponMsg]       = useState({ text: "", ok: false });

  if (!user) return (
    <main id="app-viewport"><div className="view-container"><div className="container">
      <div className="cart-empty" style={{ textAlign: "center", padding: "60px 0" }}>
        <h3>Please log in to view your cart</h3>
        <button className="btn-primary" style={{ marginTop: "16px" }} onClick={() => navigate("/login")}>Login</button>
      </div>
    </div></div></main>
  );

  const subtotal    = cartItems.reduce((s, i) => s + (i.price * (i.quantity || 1)), 0);
  const gst         = Math.round(subtotal * GST_RATE);
  const shipping    = subtotal > 999 ? 0 : 99;
  const discountAmt = appliedCoupon ? Math.round((subtotal + gst) * (appliedCoupon.pct / 100)) : 0;
  const grand       = subtotal + gst + shipping - discountAmt;

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (COUPONS[code]) {
      setAppliedCoupon(COUPONS[code]);
      setCouponMsg({ text: `${COUPONS[code].label} applied!`, ok: true });
    } else {
      setAppliedCoupon(null);
      setCouponMsg({ text: "Invalid coupon code.", ok: false });
    }
  };

  const removeCoupon = () => { setAppliedCoupon(null); setCouponInput(""); setCouponMsg({ text: "", ok: false }); };

  if (cartLoading) return (
    <main id="app-viewport"><div className="view-container"><div className="container">
      <div className="cart-empty" style={{ textAlign: "center", padding: "60px 0" }}><p>Loading cart...</p></div>
    </div></div></main>
  );

  if (cartItems.length === 0) return (
    <main id="app-viewport">
      <div className="view-container"><div className="container"><div className="cart-layout">
        <div className="cart-empty">
          <div className="cart-empty-icon" style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
            <ShoppingBag size={48} color="#222" />
          </div>
          <h3>Your cart is empty</h3>
          <p>Looks like you haven't added anything yet. Start exploring!</p>
          <button className="btn-primary" onClick={() => { navigate("/products"); window.scrollTo(0, 0); }}>Shop Now</button>
        </div>
      </div></div></div>
    </main>
  );

  return (
    <main id="app-viewport">
      <div className="view-container"><div className="container">
        <div className="checkout-breadcrumb">
          <span className="crumb active">Cart</span>
          <span className="crumb-sep">›</span>
          <span className="crumb">Checkout</span>
          <span className="crumb-sep">›</span>
          <span className="crumb">Order Placed</span>
        </div>

        <div className="cart-layout">
          <div className="cart-table-card">
            <div className="cart-header-row">
              <h2 className="cart-table-title">Shopping Cart <span className="cart-count-badge">{cartItems.reduce((s, i) => s + (i.quantity || 1), 0)}</span></h2>
              <button className="btn-cart-clear" onClick={clearCart}>Clear All</button>
            </div>
            <div className="cart-items-list">
              {cartItems.map((item) => (
                <div key={item._id} className="cart-item">
                  <div className="cart-item-img">
                    {item.image && <img src={item.image} alt={item.name} />}
                  </div>
                  <div className="cart-item-details">
                    <span className="cart-item-title">{item.name}</span>
                    <div className="cart-item-meta">
                      {item.size  && <span className="cart-meta-pill">Size: {item.size}</span>}
                      {item.color && <span className="cart-meta-pill">Color: {item.color}</span>}
                    </div>
                    <span className="cart-item-unit-price">₹{Number(item.price).toLocaleString()} / piece</span>
                  </div>
                  <div className="cart-item-qty-adjuster" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <button className="cart-item-adjust-btn" onClick={() => { if ((item.quantity || 1) <= 1) { removeFromCart(item._id); } else { updateQty(item._id, (item.quantity || 1) - 1); } }}>−</button>
                    <span className="cart-item-qty-val" style={{ margin: "0 8px", fontWeight: "600" }}>{item.quantity || 1}</span>
                    <button className="cart-item-adjust-btn" onClick={() => updateQty(item._id, (item.quantity || 1) + 1)}>+</button>
                  </div>
                  <div className="cart-item-price-actions">
                    <span className="cart-item-price">₹{(item.price * (item.quantity || 1)).toLocaleString()}</span>
                    <button className="btn-cart-remove" onClick={() => removeFromCart(item._id)}>✕ Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="cart-summary-col">
            <div className="summary-card">
              <h3 className="summary-title">Order Summary</h3>
              <div className="coupon-section">
                <p className="coupon-label">Have a coupon?</p>
                {appliedCoupon ? (
                  <div className="coupon-applied-row">
                    <span className="coupon-applied-tag" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                      <Tag size={14} /> {appliedCoupon.label}
                    </span>
                    <button className="coupon-remove-btn" onClick={removeCoupon}>Remove</button>
                  </div>
                ) : (
                  <div className="coupon-input-row">
                    <input className="coupon-input" placeholder="Enter code (e.g. WELCOME10)" value={couponInput}
                      onChange={e => setCouponInput(e.target.value)} onKeyDown={e => e.key === "Enter" && applyCoupon()} />
                    <button className="coupon-apply-btn" onClick={applyCoupon}>Apply</button>
                  </div>
                )}
                {couponMsg.text && <p className={`coupon-msg ${couponMsg.ok ? "ok" : "err"}`}>{couponMsg.text}</p>}
              </div>
              <div className="summary-divider" />
              <div className="summary-row"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
              <div className="summary-row"><span>GST (5%)</span><span>₹{gst.toLocaleString()}</span></div>
              <div className="summary-row"><span>Shipping</span><span className={shipping === 0 ? "free-tag" : ""}>{shipping === 0 ? "FREE" : `₹${shipping}`}</span></div>
              {appliedCoupon && (
                <div className="summary-row discount-row"><span>Coupon Discount</span><span>− ₹{discountAmt.toLocaleString()}</span></div>
              )}
              <div className="summary-row total-row"><span>Grand Total</span><span>₹{grand.toLocaleString()}</span></div>
              <button className="btn-primary summary-btn" onClick={() => { navigate("/checkout"); window.scrollTo(0, 0); }} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                Proceed to Checkout <ArrowRight size={16} />
              </button>
              <button className="btn-secondary summary-btn" onClick={() => { navigate("/products"); window.scrollTo(0, 0); }}>
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div></div>
    </main>
  );
}
