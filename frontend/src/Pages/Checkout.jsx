import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "../Assets/Css/checkout.css";

const STATES = ["Andhra Pradesh","Delhi","Gujarat","Karnataka","Kerala","Maharashtra","Rajasthan","Tamil Nadu","Telangana","Uttar Pradesh","West Bengal"];

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Checkout() {
  const navigate = useNavigate();
  const { cartItems, placeOrder, clearCart } = useStore();
  const { user, getProfile, updateProfile } = useAuth();

  const [step, setStep]         = useState(1);
  const [payMethod, setPayMethod] = useState("cod"); // "cod" or "online"
  const [placing, setPlacing]   = useState(false);
  const [orderId, setOrderId]   = useState(null);
  const [error, setError]       = useState("");
  const [form, setForm]         = useState({
    name: user?.name || "", email: user?.email || "", phone: user?.phone || "",
    address: "", city: "", state: "", pincode: "",
  });
  const [errors, setErrors] = useState({});
  
  // Coupon states
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discountAmount }
  const [discountAmount, setDiscountAmount] = useState(0);

  // Address Profile states
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(-1);
  const [saveToProfile, setSaveToProfile] = useState(false);

  // Fetch fresh profile on mount to get addresses
  useEffect(() => {
    if (getProfile) {
      getProfile().catch(err => console.error("Error loading user profile:", err));
    }
  }, []); // eslint-disable-line

  const subtotal = cartItems.reduce((s, i) => s + (i.price * (i.quantity || 1)), 0);
  const gst      = Math.round((subtotal - discountAmount) * 0.05);
  const shipping = (subtotal - discountAmount) > 999 ? 0 : 99;
  const grand    = Math.max(0, subtotal - discountAmount + gst + shipping);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSelectAddress = (index) => {
    setSelectedAddressIndex(index);
    if (index === -1) {
      // New Address
      setForm({
        name: user?.name || "", email: user?.email || "", phone: user?.phone || "",
        address: "", city: "", state: "", pincode: "",
      });
    } else {
      const addr = user.addresses[index];
      setForm({
        name: addr.fullName || addr.name || user?.name || "",
        email: user?.email || "",
        phone: addr.phone || user?.phone || "",
        address: addr.addressLine || addr.street || "",
        city: addr.city || "",
        state: addr.state || "",
        pincode: addr.pincode || "",
      });
    }
    setErrors({});
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.name.trim())  e.name = "Full name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required";
    if (!/^[6-9]\d{9}$/.test(form.phone)) e.phone = "Valid 10-digit mobile required";
    if (!form.address.trim()) e.address = "Address is required";
    if (!form.city.trim())    e.city    = "City is required";
    if (!form.state)          e.state   = "Select a state";
    if (!/^\d{6}$/.test(form.pincode)) e.pincode = "Valid 6-digit pincode required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await api.post("/coupons/apply", { code: couponCode, amount: subtotal });
      setAppliedCoupon({
        code: res.data.data.code,
        discountAmount: res.data.data.discountAmount,
      });
      setDiscountAmount(res.data.data.discountAmount);
      setCouponError("");
    } catch (err) {
      setCouponError(err?.response?.data?.message || "Invalid coupon code");
      setAppliedCoupon(null);
      setDiscountAmount(0);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode("");
    setCouponError("");
  };

  const handlePlaceOrder = async () => {
    setPlacing(true);
    setError("");

    const address = {
      fullName: form.name,
      name: form.name,
      phone: form.phone,
      addressLine: form.address,
      street: form.address,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
    };

    // Save address if checked and not already in profile
    if (saveToProfile && updateProfile && user) {
      try {
        const savedAddresses = user.addresses || [];
        const isDuplicate = savedAddresses.some(
          a => (a.addressLine || a.street)?.toLowerCase() === address.addressLine.toLowerCase() && a.pincode === address.pincode
        );
        if (!isDuplicate) {
          await updateProfile({ addresses: [...savedAddresses, address] });
        }
      } catch (err) {
        console.error("Failed to save address to profile:", err);
      }
    }

    if (payMethod === "cod") {
      try {
        const id = await placeOrder(address, "cod", cartItems, { total: grand });
        setOrderId(id);
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to place order. Please try again.");
      } finally {
        setPlacing(false);
      }
    } else {
      // ONLINE PAYMENTS VIA RAZORPAY
      try {
        const isScriptLoaded = await loadRazorpayScript();
        if (!isScriptLoaded) {
          setError("Razorpay SDK failed to load. Please check your internet connection.");
          setPlacing(false);
          return;
        }

        // 1. Create order on backend
        const orderRes = await api.post("/payment/create-order", { amount: grand });
        const rzpOrder = orderRes.data.data;

        // 2. Open Razorpay Checkout Dialog
        const options = {
          key: "rzp_test_SyN7nvYNEU6ojM",
          amount: rzpOrder.amount,
          currency: rzpOrder.currency,
          name: "WEARLY",
          description: "Marketplace Purchase",
          order_id: rzpOrder.id,
          handler: async function (response) {
            setPlacing(true);
            try {
              // 3. Verify Payment on Backend
              const verifyRes = await api.post("/payment/verify", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderDetails: {
                  products: cartItems.map(i => ({
                    productId: i.productId?._id || i.productId || i._id,
                    name: i.name,
                    price: i.price,
                    quantity: i.quantity || 1,
                    image: i.image || "",
                    size: i.size || "",
                    color: i.color || "",
                  })),
                  amount: grand,
                  address,
                },
              });

              if (verifyRes.data.success) {
                await clearCart();
                setOrderId(verifyRes.data.data._id);
              } else {
                setError("Payment verification failed.");
              }
            } catch (err) {
              setError(err?.response?.data?.message || "Verification failed. Please contact support.");
            } finally {
              setPlacing(false);
            }
          },
          prefill: {
            name: form.name,
            email: form.email,
            contact: form.phone,
          },
          theme: { color: "#111111" },
          modal: {
            ondismiss: function () {
              setPlacing(false);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to initiate online payment.");
        setPlacing(false);
      }
    }
  };

  if (cartItems.length === 0 && !orderId) return (
    <main id="app-viewport"><div className="view-container"><div className="container">
      <div className="checkout-empty">
        <h2>Your cart is empty</h2>
        <button className="btn-primary" onClick={() => { navigate("/products"); window.scrollTo(0, 0); }}>Shop Now</button>
      </div>
    </div></div></main>
  );

  if (orderId) return (
    <main id="app-viewport"><div className="view-container"><div className="container">
      <div className="order-success">
        <div className="success-icon">✓</div>
        <h1>Order Placed!</h1>
        <p>Thank you for shopping with WEARLY. Your order will be delivered within 3–7 business days.</p>
        <p className="success-order-id">Order ID: {String(orderId).slice(-8).toUpperCase()}</p>
        <button className="btn-primary" onClick={() => { navigate("/"); window.scrollTo(0, 0); }}>Back to Home</button>
      </div>
    </div></div></main>
  );

  const Field = ({ label, id, type = "text", placeholder, err, ...props }) => (
    <div className="co-field">
      <label className="co-label">{label}</label>
      <input className={`co-input${err ? " co-input-err" : ""}`} type={type} placeholder={placeholder} {...props} />
      {err && <span className="co-err">{err}</span>}
    </div>
  );

  return (
    <main id="app-viewport">
      <div className="view-container"><div className="container">
        <div className="checkout-breadcrumb">
          <span className={`crumb${step >= 1 ? " active" : ""}`}>Delivery</span>
          <span className="crumb-sep">›</span>
          <span className={`crumb${step >= 2 ? " active" : ""}`}>Payment</span>
          <span className="crumb-sep">›</span>
          <span className="crumb">Confirmation</span>
        </div>

        <div className="checkout-layout">
          <div className="checkout-main">
            {step === 1 && (
              <div className="co-card">
                <h2 className="co-card-title">Delivery Information</h2>
                
                {/* Saved Address Profiles Selection */}
                {user?.addresses && user.addresses.length > 0 && (
                  <div className="saved-addresses-section" style={{ marginBottom: "20px" }}>
                    <label className="co-label" style={{ fontWeight: 600, display: "block", marginBottom: "8px" }}>Select a Saved Address</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "15px" }}>
                      {user.addresses.map((addr, idx) => (
                        <div 
                          key={idx}
                          className={`saved-addr-card ${selectedAddressIndex === idx ? "selected" : ""}`}
                          onClick={() => handleSelectAddress(idx)}
                          style={{
                            border: selectedAddressIndex === idx ? "2px solid #111" : "1px solid #ddd",
                            borderRadius: "8px",
                            padding: "12px",
                            cursor: "pointer",
                            transition: "all 0.2s",
                            backgroundColor: selectedAddressIndex === idx ? "#fafafa" : "#fff"
                          }}
                        >
                          <strong style={{ fontSize: "0.9rem", display: "block" }}>{addr.fullName || addr.name}</strong>
                          <span style={{ fontSize: "0.8rem", color: "#666", display: "block", marginTop: "4px" }}>
                            {addr.addressLine || addr.street}, {addr.city}, {addr.state} - {addr.pincode}
                          </span>
                          <span style={{ fontSize: "0.8rem", color: "#666", display: "block" }}>Phone: {addr.phone}</span>
                        </div>
                      ))}
                      <div 
                        className={`saved-addr-card ${selectedAddressIndex === -1 ? "selected" : ""}`}
                        onClick={() => handleSelectAddress(-1)}
                        style={{
                          border: selectedAddressIndex === -1 ? "2px solid #111" : "1px solid #ddd",
                          borderRadius: "8px",
                          padding: "12px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 500,
                          fontSize: "0.85rem",
                          backgroundColor: selectedAddressIndex === -1 ? "#fafafa" : "#fff"
                        }}
                      >
                        + Use Another Address
                      </div>
                    </div>
                  </div>
                )}

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

                {selectedAddressIndex === -1 && (
                  <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <input 
                      type="checkbox" 
                      id="save-profile-chk" 
                      checked={saveToProfile} 
                      onChange={e => setSaveToProfile(e.target.checked)} 
                    />
                    <label htmlFor="save-profile-chk" style={{ fontSize: "0.85rem", cursor: "pointer" }}>Save this address to my profile</label>
                  </div>
                )}

                <button className="btn-primary co-next-btn" onClick={() => { if (validateStep1()) setStep(2); }}>Continue to Payment →</button>
              </div>
            )}

            {step === 2 && (
              <div className="co-card">
                <button className="co-back-btn" onClick={() => setStep(1)}>← Back to Delivery</button>
                <h2 className="co-card-title">Payment Method</h2>
                <div className="pay-method-tabs">
                  {[["online","Online Payment (Razorpay)"],["cod","Cash on Delivery"]].map(([key, label]) => (
                    <button key={key} className={`pay-tab${payMethod === key ? " active" : ""}`} onClick={() => setPayMethod(key)}>{label}</button>
                  ))}
                </div>

                {payMethod === "online" && (
                  <div className="online-info" style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px", background: "#fcfcfc" }}>
                    <p style={{ margin: 0, fontSize: "0.9rem", color: "#444" }}>
                      Pay securely via Cards, UPI, Netbanking or Wallets using the Razorpay Sandbox gateway.
                    </p>
                  </div>
                )}

                {payMethod === "cod" && (
                  <div className="cod-info" style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px", background: "#fcfcfc" }}>
                    <p style={{ margin: 0, fontSize: "0.9rem", color: "#444" }}>
                      Pay ₹{grand.toLocaleString()} in cash when your order is delivered.
                    </p>
                  </div>
                )}

                {error && <p style={{ color: "#DC2626", marginTop: "12px", fontSize: "0.9rem" }}>{error}</p>}
                <button className="btn-primary co-next-btn" onClick={handlePlaceOrder} disabled={placing}>
                  {placing ? "Processing Order..." : `Confirm & Pay — ₹${grand.toLocaleString()}`}
                </button>
              </div>
            )}
          </div>

          <div className="checkout-summary-col">
            <div className="co-summary-card">
              <h3 className="co-summary-title">Order Summary</h3>
              <div className="co-summary-items">
                {cartItems.map((item) => (
                  <div key={item._id} className="co-summary-item">
                    <div className="co-summary-img">
                      {item.image && <img src={item.image} alt={item.name} />}
                      <span className="co-item-qty-badge">{item.quantity || 1}</span>
                    </div>
                    <div className="co-summary-info">
                      <p className="co-summary-name">{item.name}</p>
                      <p className="co-summary-meta">{item.size && `Size: ${item.size}`}{item.color && ` · ${item.color}`}</p>
                    </div>
                    <span className="co-summary-price">₹{(item.price * (item.quantity || 1)).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="co-summary-divider" />
              
              {/* Coupon Application UI */}
              <form onSubmit={handleApplyCoupon} style={{ display: "flex", gap: "10px", margin: "15px 0" }}>
                <input 
                  type="text" 
                  placeholder="Promo Code" 
                  value={couponCode} 
                  onChange={e => setCouponCode(e.target.value)} 
                  disabled={appliedCoupon}
                  className="co-input"
                  style={{ flex: 1, padding: "8px 12px", border: "1px solid #ccc", borderRadius: "4px" }}
                />
                {appliedCoupon ? (
                  <button 
                    type="button" 
                    onClick={handleRemoveCoupon} 
                    className="btn-secondary" 
                    style={{ padding: "8px 16px" }}
                  >
                    Remove
                  </button>
                ) : (
                  <button 
                    type="submit" 
                    disabled={couponLoading || !couponCode.trim()} 
                    className="btn-primary" 
                    style={{ padding: "8px 16px" }}
                  >
                    {couponLoading ? "..." : "Apply"}
                  </button>
                )}
              </form>
              {couponError && <p style={{ color: "#DC2626", fontSize: "0.8rem", margin: "0 0 10px" }}>{couponError}</p>}
              {appliedCoupon && <p style={{ color: "#059669", fontSize: "0.8rem", margin: "0 0 10px" }}>Coupon "{appliedCoupon.code}" applied successfully!</p>}

              <div className="co-summary-divider" />
              <div className="co-summary-row"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
              {discountAmount > 0 && (
                <div className="co-summary-row" style={{ color: "#059669" }}>
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span>-₹{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="co-summary-row"><span>GST (5%)</span><span>₹{gst.toLocaleString()}</span></div>
              <div className="co-summary-row"><span>Shipping</span><span className={shipping === 0 ? "free-tag" : ""}>{shipping === 0 ? "FREE" : `₹${shipping}`}</span></div>
              <div className="co-summary-row co-summary-total"><span>Total</span><span>₹{grand.toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      </div></div>
    </main>
  );
}
