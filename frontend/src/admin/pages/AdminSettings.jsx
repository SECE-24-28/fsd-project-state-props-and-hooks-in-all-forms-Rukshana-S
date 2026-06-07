import React, { useState } from "react";
import "../styles/AdminSettings.css";
import { useAdmin } from "../context/AdminContext";

export default function AdminSettings() {
  const { settings, saveSettings } = useAdmin();
  const [form, setForm] = useState({ ...settings });
  const [saved, setSaved] = useState(false);

  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    saveSettings(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Settings</h1>
          <p className="adm-page-sub">Manage store configuration</p>
        </div>
      </div>

      {saved && <div className="adm-alert adm-alert-success">Settings saved successfully!</div>}

      <form onSubmit={submit}>
        <div className="adm-settings-grid">
          {/* Store Info */}
          <div className="adm-card">
            <h3 className="adm-card-title">Store Information</h3>
            <div className="adm-form-grid">
              <div className="adm-form-group">
                <label className="adm-label">Store Name</label>
                <input className="adm-input" name="storeName" value={form.storeName} onChange={handle} />
              </div>
              <div className="adm-form-group">
                <label className="adm-label">Store Email</label>
                <input className="adm-input" type="email" name="storeEmail" value={form.storeEmail} onChange={handle} />
              </div>
              <div className="adm-form-group">
                <label className="adm-label">Store Phone</label>
                <input className="adm-input" name="storePhone" value={form.storePhone} onChange={handle} />
              </div>
              <div className="adm-form-group adm-span-2">
                <label className="adm-label">Store Address</label>
                <textarea className="adm-input adm-textarea" name="storeAddress" value={form.storeAddress} onChange={handle} rows={3} />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="adm-card">
            <h3 className="adm-card-title">Social Media Links</h3>
            <div className="adm-form-grid">
              {[["instagram", "📸 Instagram"], ["facebook", "📘 Facebook"], ["pinterest", "📌 Pinterest"], ["youtube", "▶️ YouTube"]].map(([key, label]) => (
                <div key={key} className="adm-form-group">
                  <label className="adm-label">{label}</label>
                  <input className="adm-input" name={key} value={form[key] || ""} onChange={handle} placeholder={`https://${key}.com/wearly`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="adm-card" style={{ marginTop: 24 }}>
          <h3 className="adm-card-title">Media Uploads</h3>
          <div className="adm-upload-grid">
            {["Store Logo", "Hero Banner", "Homepage Banner", "Favicon"].map(label => (
              <div key={label} className="adm-upload-zone">
                <span className="adm-upload-icon">⬆</span>
                <span className="adm-upload-label">{label}</span>
                <span className="adm-upload-hint">Click to upload</span>
                <input type="file" accept="image/*" className="adm-upload-input" />
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <button type="submit" className="adm-btn adm-btn-primary">Save Settings</button>
        </div>
      </form>
    </div>
  );
}
