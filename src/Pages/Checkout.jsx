import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import "../Assets/Css/checkout.css";

const STATES = ["Andhra Pradesh","Delhi","Gujarat","Karnataka","Kerala","Maharashtra","Rajasthan","Tamil Nadu","Telangana","Uttar Pradesh","West Bengal"];
const UPI_APPS = ["Google Pay", "PhonePe", "Paytm", "BHIM UPI"];

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useStore();
  const [step, setStep] = useState(1);
  const [payMethod, setPayMethod] = useState("card");
  const [placed, setPlaced] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    address: "", city: "", state: "", pincode: "",
    cardNo: "", expiry: "", cvv: "", cardName: "",
    upiApp: "Google Pay", upiId: "",
  });
  const [errors, setErrors] = useState({});

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const gst = Math.round(subtotal * 0.05);
  const shipping = subtotal > 999 ? 0 : 99;
  const grand = subtotal + gst + shipping;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validateStep1 = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required";
    if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = "Valid 10-digit mobile required";
    if (!form.address.trim()) e.address = "Address is required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.state) e.state = "Select a state";
    if (!/^\d{6}$/.test(form.pincode)) e.pincode = "Valid 6-digit pincode required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (payMethod === "card") {
      if (!/^\d{16}$/.test(form.cardNo.replace(/\s/g, ""))) e.cardNo = "Valid 16-digit card number required";
      if (!/^\d{2}\/\d{2}$/.test(form.expiry)) e.expiry = "Format MM/YY";
      if (!/^\d{3,4}$/.test(form.cvv)) e.cvv = "Valid CVV required";
      if (!form.cardName.trim()) e.cardName = "Name on card required";
    }
    if (payMethod === "upi") {
      if (!form.upiId.trim()) e.upiId = "UPI ID required";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const placeOrder = () => {
    if (!validateStep2()) return;
    clearCart();
    setPlaced(true);
  };

  if (cartItems.length === 0 && !placed) {
    return (
      <main id="app-viewport">
        <div className="view-container">
          <div className="container">
            <div className="checkout-empty">
              <h2>Your cart is empty</h2>
              <button className="btn-primary" onClick={() => { navigate("/products"); window.scrollTo(0, 0); }}>Shop Now</button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (placed) {
    return (
      <main id="app-viewport">
        <div className="view-container">
          <div className="container">
            <div className="order-success">
              <div className="success-icon">✓</div>
              <h1>Order Placed!</h1>
              <p>Thank you for shopping with WEARLY. Your order has been confirmed and will be delivered within 3–7 business days.</p>
              <p className="success-order-id">Order ID: WLY-{Date.now().toString().slice(-8)}</p>
              <button className="btn-primary" onClick={() => { navigate("/"); window.scrollTo(0, 0); }}>Back to Home</button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const Field = ({ label, id, type = "text", placeholder, err, ...props }) => (
    <div className="co-field">
      <label className="co-label">{label}</label>
      <input className={`co-input${err ? " co-input-err" : ""}`} type={type} placeholder={placeholder} {...props} />
      {err && <span className="co-err">{err}</span>}
    </div>
  );

  return (
    <main id="app-viewport">
      <div className="view-container">
        <div className="container">

          {/* Breadcrumb */}
          <div className="checkout-breadcrumb">
            <span className={`crumb${step >= 1 ? " active" : ""}`}>Delivery</span>
            <span className="crumb-sep">›</span>
            <span className={`crumb${step >= 2 ? " active" : ""}`}>Payment</span>
            <span className="crumb-sep">›</span>
            <span className={`crumb${placed ? " active" : ""}`}>Confirmation</span>
          </div>

          <div className="checkout-layout">

            {/* LEFT — Steps */}
            <div className="checkout-main">

              {/* STEP 1 — Delivery */}
              {step === 1 && (
                <div className="co-card">
                  <h2 className="co-card-title">Delivery Information</h2>
                  <div className="co-grid-2">
                    <Field label="Full Name" placeholder="Your full name" value={form.name} onChange={e => set("name", e.target.value)} err={errors.name} />
                    <Field label="Email Address" type="email" placeholder="you@example.com" value={form.email} onChange={e => set("email", e.target.value)} err={errors.email} />
                    <Field label="Mobile Number" type="tel" placeholder="10-digit mobile" value={form.phone} onChange={e => set("phone", e.target.value)} err={errors.phone} />
                  </div>
                  <div className="co-field">
                    <label className="co-label">Full Address</label>
                    <textarea className={`co-textarea${errors.address ? " co-input-err" : ""}`} placeholder="House no., Street, Locality" value={form.address} onChange={e => set("address", e.target.value)} />
                    {errors.address && <span className="co-err">{errors.address}</span>}
                  </div>
                  <div className="co-grid-3">
                    <Field label="City" placeholder="City" value={form.city} onChange={e => set("city", e.target.value)} err={errors.city} />
                    <div className="co-field">
                      <label className="co-label">State</label>
                      <select className={`co-input co-select${errors.state ? " co-input-err" : ""}`} value={form.state} onChange={e => set("state", e.target.value)}>
                        <option value="">Select State</option>
                        {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {errors.state && <span className="co-err">{errors.state}</span>}
                    </div>
                    <Field label="Pincode" placeholder="6-digit pincode" value={form.pincode} onChange={e => set("pincode", e.target.value)} err={errors.pincode} />
                  </div>
                  <button className="btn-primary co-next-btn" onClick={() => { if (validateStep1()) setStep(2); }}>Continue to Payment →</button>
                </div>
              )}

              {/* STEP 2 — Payment */}
              {step === 2 && (
                <div className="co-card">
                  <button className="co-back-btn" onClick={() => setStep(1)}>← Back to Delivery</button>
                  <h2 className="co-card-title">Payment Method</h2>

                  <div className="pay-method-tabs">
                    {[["card","Credit / Debit Card"],["upi","UPI"],["cod","Cash on Delivery"]].map(([key, label]) => (
                      <button key={key} className={`pay-tab${payMethod === key ? " active" : ""}`} onClick={() => setPayMethod(key)}>{label}</button>
                    ))}
                  </div>

                  {payMethod === "card" && (
                    <div className="co-grid-2">
                      <div className="co-field co-span-2">
                        <label className="co-label">Card Number</label>
                        <input className={`co-input${errors.cardNo ? " co-input-err" : ""}`} placeholder="1234 5678 9012 3456" maxLength={19}
                          value={form.cardNo}
                          onChange={e => {
                            const val = e.target.value.replace(/\D/g,"").slice(0,16);
                            set("cardNo", val.replace(/(.{4})/g,"$1 ").trim());
                          }}
                        />
                        {errors.cardNo && <span className="co-err">{errors.cardNo}</span>}
                      </div>
                      <Field label="Expiry (MM/YY)" placeholder="MM/YY" value={form.expiry}
                        onChange={e => {
                          let v = e.target.value.replace(/\D/g,"").slice(0,4);
                          if (v.length > 2) v = v.slice(0,2) + "/" + v.slice(2);
                          set("expiry", v);
                        }} err={errors.expiry} />
                      <Field label="CVV" type="password" placeholder="3 or 4 digits" maxLength={4} value={form.cvv} onChange={e => set("cvv", e.target.value.replace(/\D/g,"").slice(0,4))} err={errors.cvv} />
                      <div className="co-field co-span-2">
                        <Field label="Name on Card" placeholder="As printed on card" value={form.cardName} onChange={e => set("cardName", e.target.value)} err={errors.cardName} />
                      </div>
                    </div>
                  )}

                  {payMethod === "upi" && (
                    <div>
                      <div className="upi-apps-row">
                        {UPI_APPS.map(app => (
                          <button key={app} className={`upi-app-btn${form.upiApp === app ? " active" : ""}`} onClick={() => set("upiApp", app)}>{app}</button>
                        ))}
                      </div>
                      <Field label="UPI ID" placeholder="yourname@upi" value={form.upiId} onChange={e => set("upiId", e.target.value)} err={errors.upiId} />
                    </div>
                  )}

                  {payMethod === "cod" && (
                    <div className="cod-info">
                      <p>Pay ₹{grand.toLocaleString()} in cash when your order is delivered.</p>
                      <p className="cod-note">Cash on Delivery is available for orders up to ₹10,000.</p>
                    </div>
                  )}

                  <button className="btn-primary co-next-btn" onClick={placeOrder}>Place Order — ₹{grand.toLocaleString()}</button>
                </div>
              )}
            </div>

            {/* RIGHT — Order Summary */}
            <div className="checkout-summary-col">
              <div className="co-summary-card">
                <h3 className="co-summary-title">Order Summary</h3>
                <div className="co-summary-items">
                  {cartItems.map((item, i) => (
                    <div key={i} className="co-summary-item">
                      <div className="co-summary-img">
                        <img src={item.image} alt={item.name} />
                        <span className="co-item-qty-badge">{item.qty}</span>
                      </div>
                      <div className="co-summary-info">
                        <p className="co-summary-name">{item.name}</p>
                        <p className="co-summary-meta">{item.size && `Size: ${item.size}`}{item.colorLabel && ` · ${item.colorLabel}`}</p>
                      </div>
                      <span className="co-summary-price">₹{(item.price * item.qty).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="co-summary-divider" />
                <div className="co-summary-row"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
                <div className="co-summary-row"><span>GST (5%)</span><span>₹{gst.toLocaleString()}</span></div>
                <div className="co-summary-row"><span>Shipping</span><span className={shipping === 0 ? "free-tag" : ""}>{shipping === 0 ? "FREE" : `₹${shipping}`}</span></div>
                <div className="co-summary-row co-summary-total"><span>Total</span><span>₹{grand.toLocaleString()}</span></div>
              </div>

              {/* Delivery address preview on step 2 */}
              {step === 2 && form.name && (
                <div className="co-address-preview">
                  <p className="co-address-label">Delivering to</p>
                  <p className="co-address-text"><strong>{form.name}</strong></p>
                  <p className="co-address-text">{form.address}</p>
                  <p className="co-address-text">{form.city}, {form.state} - {form.pincode}</p>
                  <p className="co-address-text">{form.phone}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
