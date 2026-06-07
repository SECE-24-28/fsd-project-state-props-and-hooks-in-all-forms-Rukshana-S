import React from "react";
import { useAdmin } from "../context/AdminContext";
import "../admin.css";

export default function AdminHeader() {
  const { adminSession, adminLogout, isSuperAdmin } = useAdmin();
  return (
    <header className="adm-topbar">
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <button className="adm-hamburger" aria-label="Menu"><span/><span/><span/></button>
        <div className="adm-topbar-brand">WEARLY Admin</div>
      </div>
      <div className="adm-topbar-right">
        <div className="adm-topbar-notif" title="Notifications">🔔<span className="adm-notif-dot"/></div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <div className="adm-profile-avatar">{adminSession?.name?.[0]}</div>
          <div className="adm-profile-info"><span className="adm-profile-name">{adminSession?.name}</span><span className={`adm-role-badge-sm ${isSuperAdmin? 'adm-role-super' : 'adm-role-store'}`}>{isSuperAdmin? 'Super Admin' : 'Store Admin'}</span></div>
        </div>
        <button className="adm-topbar-logout" onClick={() => adminLogout()} title="Logout">⏻</button>
      </div>
    </header>
  );
}
