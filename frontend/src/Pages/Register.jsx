import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import "../Assets/Css/auth.css";

const EyeOpen = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeClosed = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

function Toast({ message, onClose }) {
  React.useEffect(() => { const t = setTimeout(onClose, 2500); return () => clearTimeout(t); }, [onClose]);
  return <div className="auth-toast auth-toast-success"><span>✓</span>{message}</div>;
}

function readFile(file) {
  return new Promise(res => { const r = new FileReader(); r.onload = e => res(e.target.result); r.readAsDataURL(file); });
}

function FileUpload({ label, value, onChange }) {
  const ref = useRef();
  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div className="reg-upload-zone" onClick={() => ref.current.click()}>
        {value ? <img src={value} alt={label} className="reg-upload-preview" /> : (
          <><span style={{ fontSize: "1.4rem" }}>⬆</span><span style={{ fontSize: "0.82rem", color: "#b0a8a8" }}>Click to upload</span></>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={onChange} />
    </div>
  );
}

function validateCustomer(f) {
  const e = {};
  if (!f.name.trim() || f.name.trim().length < 3) e.name = "Full name must be at least 3 characters.";
  if (!f.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = "Enter a valid email address.";
  if (!f.phone.trim() || !/^\d{10}$/.test(f.phone.replace(/\s/g, ""))) e.phone = "Enter a valid 10-digit phone number.";
  if (!f.password || f.password.length < 6) e.password = "Password must be at least 6 characters.";
  else if (!/[A-Z]/.test(f.password)) e.password = "Password must contain at least 1 uppercase letter.";
  else if (!/[0-9]/.test(f.password)) e.password = "Password must contain at least 1 number.";
  if (f.confirm !== f.password) e.confirm = "Passwords do not match.";
  return e;
}

function validateStore(f) {
  const e = {};
  if (!f.ownerName.trim() || f.ownerName.trim().length < 3) e.ownerName = "Owner name must be at least 3 characters.";
  if (!f.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = "Enter a valid email address.";
  if (!f.phone.trim() || !/^\d{10}$/.test(f.phone.replace(/\s/g, ""))) e.phone = "Enter a valid 10-digit phone number.";
  if (!f.storeName.trim()) e.storeName = "Store name is required.";
  if (!f.brandName.trim()) e.brandName = "Brand name is required.";
  if (!f.password || f.password.length < 6) e.password = "Password must be at least 6 characters.";
  else if (!/[A-Z]/.test(f.password)) e.password = "Password must contain at least 1 uppercase letter.";
  else if (!/[0-9]/.test(f.password)) e.password = "Password must contain at least 1 number.";
  if (f.confirm !== f.password) e.confirm = "Passwords do not match.";
  if (!f.gstNumber.trim()) e.gstNumber = "GST Number is required.";
  if (!f.panNumber || !f.panNumber.trim()) e.panNumber = "PAN Number is required.";
  else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(f.panNumber.trim())) e.panNumber = "Enter a valid PAN (e.g. ABCDE1234F).";
  if (!f.address.trim()) e.address = "Business address is required.";
  if (!f.city.trim()) e.city = "City is required.";
  if (!f.state.trim()) e.state = "State is required.";
  if (!f.country.trim()) e.country = "Country is required.";
  if (!f.pincode.trim() || !/^\d{6}$/.test(f.pincode.trim())) e.pincode = "Enter a valid 6-digit pincode.";
  if (!f.brandDescription.trim()) e.brandDescription = "Brand description is required.";
  if (!f.privacyPolicy.trim()) e.privacyPolicy = "Privacy policy is required.";
  if (!f.terms.trim()) e.terms = "Terms and conditions are required.";
  if (!f.acceptPrivacy) e.acceptPrivacy = "You must accept the Wearly Store Privacy Policy.";
  if (!f.acceptTerms) e.acceptTerms = "You must accept the Wearly Store Terms and Conditions.";
  return e;
}

const CUSTOMER_FIELDS = [
  { key: "name",     label: "Full Name",        type: "text",     placeholder: "Your full name" },
  { key: "email",    label: "Email Address",    type: "email",    placeholder: "you@example.com" },
  { key: "phone",    label: "Phone Number",     type: "tel",      placeholder: "10-digit mobile number" },
  { key: "password", label: "Password",         type: "password", placeholder: "Min. 6 chars, 1 uppercase, 1 number", eye: true },
  { key: "confirm",  label: "Confirm Password", type: "password", placeholder: "Repeat your password", eye: true },
];

const EMPTY_CUSTOMER = { name: "", email: "", phone: "", password: "", confirm: "" };
const EMPTY_STORE = {
  ownerName: "", email: "", phone: "", storeName: "", brandName: "",
  password: "", confirm: "", gstNumber: "", panNumber: "", address: "", city: "", state: "",
  country: "India", pincode: "", brandDescription: "", privacyPolicy: "", terms: "",
  acceptPrivacy: false, acceptTerms: false,
};

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [role, setRole] = useState("customer");
  const [form, setForm] = useState(EMPTY_CUSTOMER);
  const [storeForm, setStoreForm] = useState(EMPTY_STORE);
  const [errs, setErrs] = useState({});
  const [show, setShow] = useState({ password: false, confirm: false });
  const [media, setMedia] = useState({ logo: "", banner: "", coverImage: "" });
  const [toast, setToast] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (key, val) => { setForm(f => ({ ...f, [key]: val })); setErrs(e => ({ ...e, [key]: "" })); };
  const setS = (key, val) => { setStoreForm(f => ({ ...f, [key]: val })); setErrs(e => ({ ...e, [key]: "" })); };

  const handleMedia = async (key, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const data = await readFile(file);
    setMedia(m => ({ ...m, [key]: data }));
  };

  const handleRoleChange = (r) => {
    setRole(r); setErrs({}); setForm(EMPTY_CUSTOMER); setStoreForm(EMPTY_STORE);
  };

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    const errors = validateCustomer(form);
    if (Object.keys(errors).length) { setErrs(errors); return; }
    try {
      await register({
        name: form.name.trim(),
        email: form.email.toLowerCase().trim(),
        password: form.password,
        phone: form.phone.trim(),
      });
      setToast(true);
    } catch (err) {
      const msg = err?.response?.data?.message || "Registration failed.";
      if (msg.toLowerCase().includes("email")) setErrs({ email: "An account with this email already exists." });
      else setErrs({ general: msg });
    }
  };

  const handleStoreSubmit = async (e) => {
    e.preventDefault();
    const errors = validateStore(storeForm);
    if (Object.keys(errors).length) { setErrs(errors); return; }
    try {
      await api.post("/users/register", {
        name: storeForm.ownerName.trim(),
        email: storeForm.email.toLowerCase().trim(),
        password: storeForm.password,
        phone: storeForm.phone.trim(),
        role: "store-admin",
        storeName: storeForm.storeName.trim(),
        brandName: storeForm.brandName.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      const msg = err?.response?.data?.message || "Application submission failed.";
      if (msg.toLowerCase().includes("email")) setErrs({ email: "An application with this email already exists." });
      else setErrs({ general: msg });
    }
  };

  if (submitted) {
    return (
      <div className="auth-bg-page">
        <div className="auth-page-brand" onClick={() => navigate("/")}>WEARLY</div>
        <div className="auth-card premium-card">
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🎉</div>
            <h2 className="auth-title">Application Submitted!</h2>
            <p className="auth-subtitle" style={{ marginBottom: "24px" }}>Your seller application is under review by our team.</p>
            <div style={{ background: "#faf7f7", border: "1px solid #e9d5d6", borderRadius: "16px", padding: "20px", marginBottom: "24px", textAlign: "left" }}>
              <p style={{ fontSize: "0.88rem", color: "#6c6c6c", marginBottom: "8px" }}><strong style={{ color: "#2f2f2f" }}>What happens next?</strong></p>
              <p style={{ fontSize: "0.84rem", color: "#6c6c6c", lineHeight: "1.7" }}>
                ✓ Your application has been saved<br />
                ⏳ Super Admin will review your KYC documents<br />
                📧 You'll be notified once approved<br />
                🚀 Then you can access your Seller Dashboard
              </p>
            </div>
            <button className="btn-primary auth-btn" onClick={() => navigate("/login")}>Go to Login</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-bg-page">
      {toast && <Toast message="Account created successfully!" onClose={() => setToast(false)} />}
      <div className="auth-page-brand" onClick={() => navigate("/")}>WEARLY</div>

      <div className="auth-card premium-card" style={{ maxWidth: role === "store-admin" ? "640px" : "480px" }}>
        <div className="auth-header">
          <h2 className="auth-title">{role === "store-admin" ? "Seller Registration" : "Create Account"}</h2>
          <p className="auth-subtitle">{role === "store-admin" ? "Apply to sell on WEARLY marketplace" : "Join the WEARLY family today"}</p>
        </div>

        {/* Role Selector */}
        <div className="reg-role-selector">
          {[
            { val: "customer", label: "Customer", icon: "🛍️" },
            { val: "store-admin", label: "Store Admin", icon: "🏪" },
          ].map(({ val, label, icon }) => (
            <button key={val} type="button"
              className={`reg-role-btn${role === val ? " reg-role-active" : ""}`}
              onClick={() => handleRoleChange(val)}>
              <span>{icon}</span><span>{label}</span>
            </button>
          ))}
        </div>

        {role === "customer" ? (
          <form onSubmit={handleCustomerSubmit} noValidate>
            {CUSTOMER_FIELDS.map(({ key, label, type, placeholder, eye }) => (
              <div className="form-group" key={key}>
                <label className="form-label">{label}</label>
                <div className={`input-wrapper${eye ? " input-with-eye" : ""}${errs[key] ? " input-error" : ""}`}>
                  <input
                    type={eye ? (show[key] ? "text" : "password") : type}
                    placeholder={placeholder} value={form[key]}
                    onChange={e => set(key, e.target.value)}
                  />
                  {eye && (
                    <button type="button" className="eye-btn" onClick={() => setShow(s => ({ ...s, [key]: !s[key] }))} tabIndex={-1}>
                      {show[key] ? <EyeClosed /> : <EyeOpen />}
                    </button>
                  )}
                </div>
                {errs[key] && <p className="field-error">{errs[key]}</p>}
              </div>
            ))}
            {errs.general && <div className="auth-error">{errs.general}</div>}
            <button type="submit" className="btn-primary auth-btn">Create Account</button>
          </form>
        ) : (
          <form onSubmit={handleStoreSubmit} noValidate>
            {/* Basic Information */}
            <div className="reg-section-title">Basic Information</div>
            <div className="reg-two-col">
              {[
                { key: "ownerName", label: "Owner Name",     type: "text",  placeholder: "Full name" },
                { key: "email",     label: "Business Email", type: "email", placeholder: "store@example.com" },
                { key: "phone",     label: "Phone Number",   type: "tel",   placeholder: "10-digit number" },
                { key: "storeName", label: "Store Name",     type: "text",  placeholder: "e.g. Rukshana Boutique" },
                { key: "brandName", label: "Brand Name",     type: "text",  placeholder: "e.g. Rukshana" },
              ].map(({ key, label, type, placeholder }) => (
                <div className="form-group" key={key}>
                  <label className="form-label">{label}</label>
                  <div className={`input-wrapper${errs[key] ? " input-error" : ""}`}>
                    <input type={type} placeholder={placeholder} value={storeForm[key]} onChange={e => setS(key, e.target.value)} />
                  </div>
                  {errs[key] && <p className="field-error">{errs[key]}</p>}
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className={`input-wrapper input-with-eye${errs.password ? " input-error" : ""}`}>
                  <input type={show.password ? "text" : "password"} placeholder="Min. 6 chars, 1 uppercase, 1 number"
                    value={storeForm.password} onChange={e => setS("password", e.target.value)} />
                  <button type="button" className="eye-btn" onClick={() => setShow(s => ({ ...s, password: !s.password }))} tabIndex={-1}>
                    {show.password ? <EyeClosed /> : <EyeOpen />}
                  </button>
                </div>
                {errs.password && <p className="field-error">{errs.password}</p>}
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className={`input-wrapper input-with-eye${errs.confirm ? " input-error" : ""}`}>
                  <input type={show.confirm ? "text" : "password"} placeholder="Repeat your password"
                    value={storeForm.confirm} onChange={e => setS("confirm", e.target.value)} />
                  <button type="button" className="eye-btn" onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))} tabIndex={-1}>
                    {show.confirm ? <EyeClosed /> : <EyeOpen />}
                  </button>
                </div>
                {errs.confirm && <p className="field-error">{errs.confirm}</p>}
              </div>
            </div>

            {/* Business Details */}
            <div className="reg-section-title">Business Details</div>
            <div className="reg-two-col">
              {[
                { key: "gstNumber", label: "GST Number",       placeholder: "29ABCDE1234F1Z5" },
                { key: "panNumber", label: "PAN Number",       placeholder: "ABCDE1234F" },
                { key: "address",   label: "Business Address", placeholder: "Street / Building" },
                { key: "city",      label: "City",             placeholder: "City" },
                { key: "state",     label: "State",            placeholder: "State" },
                { key: "country",   label: "Country",          placeholder: "Country" },
                { key: "pincode",   label: "Pincode",          placeholder: "6-digit pincode" },
              ].map(({ key, label, placeholder }) => (
                <div className="form-group" key={key}>
                  <label className="form-label">{label}</label>
                  <div className={`input-wrapper${errs[key] ? " input-error" : ""}`}>
                    <input type="text" placeholder={placeholder} value={storeForm[key]} onChange={e => setS(key, e.target.value)} />
                  </div>
                  {errs[key] && <p className="field-error">{errs[key]}</p>}
                </div>
              ))}
              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label className="form-label">Brand Description</label>
                <div className={`input-wrapper${errs.brandDescription ? " input-error" : ""}`}>
                  <textarea rows={3} placeholder="Describe your brand..." value={storeForm.brandDescription}
                    onChange={e => setS("brandDescription", e.target.value)}
                    style={{ width: "100%", padding: "12px 18px", background: "transparent", border: "none", outline: "none", fontFamily: "Poppins, sans-serif", fontSize: "0.9rem", resize: "vertical" }} />
                </div>
                {errs.brandDescription && <p className="field-error">{errs.brandDescription}</p>}
              </div>
            </div>

            {/* Media Uploads */}
            <div className="reg-section-title">Media Uploads</div>
            <div className="reg-three-col">
              <FileUpload label="Brand Logo"         value={media.logo}       onChange={e => handleMedia("logo", e)} />
              <FileUpload label="Store Banner"        value={media.banner}     onChange={e => handleMedia("banner", e)} />
              <FileUpload label="Brand Cover Image"   value={media.coverImage} onChange={e => handleMedia("coverImage", e)} />
            </div>

            {/* Legal Documents */}
            <div className="reg-section-title">Legal Documents</div>
            <div className="form-group">
              <label className="form-label">Privacy Policy</label>
              <div className={`input-wrapper${errs.privacyPolicy ? " input-error" : ""}`}>
                <textarea rows={4} placeholder="Enter your store's privacy policy..." value={storeForm.privacyPolicy}
                  onChange={e => setS("privacyPolicy", e.target.value)}
                  style={{ width: "100%", padding: "12px 18px", background: "transparent", border: "none", outline: "none", fontFamily: "Poppins, sans-serif", fontSize: "0.9rem", resize: "vertical" }} />
              </div>
              {errs.privacyPolicy && <p className="field-error">{errs.privacyPolicy}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Terms and Conditions</label>
              <div className={`input-wrapper${errs.terms ? " input-error" : ""}`}>
                <textarea rows={4} placeholder="Enter your store's terms and conditions..." value={storeForm.terms}
                  onChange={e => setS("terms", e.target.value)}
                  style={{ width: "100%", padding: "12px 18px", background: "transparent", border: "none", outline: "none", fontFamily: "Poppins, sans-serif", fontSize: "0.9rem", resize: "vertical" }} />
              </div>
              {errs.terms && <p className="field-error">{errs.terms}</p>}
            </div>

            <div className="form-group" style={{ marginTop: "20px" }}>
              <label className="terms-checkbox-label">
                <input type="checkbox" checked={storeForm.acceptPrivacy} onChange={e => setS("acceptPrivacy", e.target.checked)} />
                I accept the <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="terms-link">Store Privacy Policy</a>
              </label>
              {errs.acceptPrivacy && <p className="field-error">{errs.acceptPrivacy}</p>}
            </div>
            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label className="terms-checkbox-label">
                <input type="checkbox" checked={storeForm.acceptTerms} onChange={e => setS("acceptTerms", e.target.checked)} />
                I accept the <a href="/terms" target="_blank" rel="noopener noreferrer" className="terms-link">Store Terms and Conditions</a>
              </label>
              {errs.acceptTerms && <p className="field-error">{errs.acceptTerms}</p>}
            </div>

            {errs.general && <div className="auth-error">{errs.general}</div>}
            <button type="submit" className="btn-primary auth-btn">Submit Application</button>
          </form>
        )}

        <p className="auth-footer">Already have an account? <Link to="/login">Login here</Link></p>
      </div>
    </div>
  );
}
