import React, { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

function readFile(file) {
  return new Promise(res => {
    const r = new FileReader();
    r.onload = e => res(e.target.result);
    r.readAsDataURL(file);
  });
}

function ImageField({ label, value, onChange }) {
  const ref = useRef();
  return (
    <div className="adm-form-group">
      <label className="adm-label">{label}</label>
      <div
        onClick={() => ref.current.click()}
        style={{
          border: "2px dashed rgba(233,213,214,0.7)", borderRadius: "14px",
          background: "#faf7f7", cursor: "pointer", overflow: "hidden",
          height: value ? "auto" : "80px", display: "flex",
          alignItems: "center", justifyContent: "center",
          transition: "border-color 0.2s",
        }}
      >
        {value
          ? <img src={value} alt={label} style={{ width: "100%", maxHeight: "160px", objectFit: "cover", display: "block" }} />
          : <span style={{ fontSize: "0.82rem", color: "#aaa" }}>Click to upload</span>
        }
      </div>
      <input ref={ref} type="file" accept="image/*" style={{ display: "none" }} onChange={onChange} />
    </div>
  );
}

export default function StoreAdminSettingsPage() {
  const { user, getProfile } = useAuth();

  const [form, setForm] = useState({
    name:             user?.name             || "",
    phone:            user?.phone            || "",
    storeName:        user?.storeName        || "",
    brandName:        user?.brandName        || "",
    brandDescription: user?.brandDescription || "",
  });
  const [profileImage, setProfileImage] = useState(user?.profileImage || "");
  const [brandLogo, setBrandLogo]       = useState(user?.brandLogo || "");
  const [saved,  setSaved]  = useState(false);
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImage = async e => {
    const f = e.target.files[0];
    if (f) setProfileImage(await readFile(f));
  };

  const handleLogo = async e => {
    const f = e.target.files[0];
    if (f) setBrandLogo(await readFile(f));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setErr("Name is required."); return; }
    setErr("");
    setSaving(true);
    try {
      await api.put("/users/profile", { ...form, profileImage, brandLogo });
      await getProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setErr(err?.response?.data?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Store Settings</h1>
          <p className="adm-page-sub">Manage your store profile</p>
        </div>
      </div>

      {saved && <div className="adm-alert adm-alert-success">Settings saved successfully!</div>}
      {err   && <div className="adm-alert adm-alert-error">{err}</div>}

      <form onSubmit={handleSave}>
        <div className="adm-card" style={{ marginBottom: 24 }}>
          <h3 className="adm-card-title" style={{ marginBottom: 20 }}>Profile Information</h3>
          <div className="adm-form-grid">
            <div className="adm-form-group">
              <label className="adm-label">Owner Name *</label>
              <input className="adm-input" value={form.name} onChange={e => set("name", e.target.value)} placeholder="Your full name" />
            </div>
            <div className="adm-form-group">
              <label className="adm-label">Email (read-only)</label>
              <input className="adm-input" type="email" value={user?.email || ""} readOnly style={{ opacity: 0.6 }} />
            </div>
            <div className="adm-form-group">
              <label className="adm-label">Phone</label>
              <input className="adm-input" type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+91 00000 00000" />
            </div>
            <div className="adm-form-group">
              <label className="adm-label">Store Name</label>
              <input className="adm-input" value={form.storeName} onChange={e => set("storeName", e.target.value)} placeholder="Your store name" />
            </div>
            <div className="adm-form-group">
              <label className="adm-label">Brand Name</label>
              <input className="adm-input" value={form.brandName} onChange={e => set("brandName", e.target.value)} placeholder="Your brand name" />
            </div>
            <div className="adm-form-group adm-span-2">
              <label className="adm-label">Brand Description</label>
              <textarea className="adm-input" rows={3} value={form.brandDescription} onChange={e => set("brandDescription", e.target.value)} placeholder="Short description of your brand..." style={{ padding: "10px", borderRadius: "8px", border: "1px solid #eadede" }} />
            </div>
          </div>
        </div>

        <div className="adm-card" style={{ marginBottom: 24 }}>
          <h3 className="adm-card-title" style={{ marginBottom: 20 }}>Brand Media</h3>
          <div className="adm-form-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <ImageField label="Profile Image" value={profileImage} onChange={handleImage} />
            <ImageField label="Brand Logo (for Showcase)" value={brandLogo} onChange={handleLogo} />
          </div>
        </div>

        <button type="submit" className="adm-btn adm-btn-primary" disabled={saving}>
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
