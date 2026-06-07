import React, { useState } from "react";
import { useAdmin } from "../context/AdminContext";

export default function AdminPrivacy() {
  const { privacyPolicy, savePrivacyPolicy } = useAdmin();
  const [text, setText] = useState(privacyPolicy);
  const [preview, setPreview] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = () => { savePrivacyPolicy(text); setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Privacy Policy</h1>
          <p className="adm-page-sub">Super Admin Only — Manage your store's privacy policy</p>
        </div>
        <div className="adm-btn-group">
          <button className="adm-btn adm-btn-secondary" onClick={() => setPreview(p => !p)}>{preview ? "Edit" : "Preview"}</button>
          <button className="adm-btn adm-btn-primary" onClick={save}>Publish</button>
        </div>
      </div>

      {saved && <div className="adm-alert adm-alert-success">Privacy Policy published successfully!</div>}

      <div className="adm-card">
        {preview ? (
          <div className="adm-rich-preview">
            {text.split("\n").map((line, i) => <p key={i} style={{ marginBottom: "12px" }}>{line}</p>)}
          </div>
        ) : (
          <>
            <label className="adm-label">Privacy Policy Content</label>
            <textarea
              className="adm-input adm-textarea adm-rich-editor"
              value={text}
              onChange={e => setText(e.target.value)}
              rows={20}
              placeholder="Write your privacy policy here..."
            />
          </>
        )}
      </div>
    </div>
  );
}
