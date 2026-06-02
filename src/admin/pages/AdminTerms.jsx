import React, { useState } from "react";
import { useAdmin } from "../context/AdminContext";

export default function AdminTerms() {
  const { termsConditions, saveTermsConditions } = useAdmin();
  const [text, setText] = useState(termsConditions);
  const [preview, setPreview] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = () => { saveTermsConditions(text); setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Terms & Conditions</h1>
          <p className="adm-page-sub">Super Admin Only — Manage your store's terms</p>
        </div>
        <div className="adm-btn-group">
          <button className="adm-btn adm-btn-secondary" onClick={() => setPreview(p => !p)}>{preview ? "Edit" : "Preview"}</button>
          <button className="adm-btn adm-btn-primary" onClick={save}>Publish</button>
        </div>
      </div>

      {saved && <div className="adm-alert adm-alert-success">Terms & Conditions published successfully!</div>}

      <div className="adm-card">
        {preview ? (
          <div className="adm-rich-preview">
            {text.split("\n").map((line, i) => <p key={i} style={{ marginBottom: "12px" }}>{line}</p>)}
          </div>
        ) : (
          <>
            <label className="adm-label">Terms & Conditions Content</label>
            <textarea
              className="adm-input adm-textarea adm-rich-editor"
              value={text}
              onChange={e => setText(e.target.value)}
              rows={20}
              placeholder="Write your terms and conditions here..."
            />
          </>
        )}
      </div>
    </div>
  );
}
