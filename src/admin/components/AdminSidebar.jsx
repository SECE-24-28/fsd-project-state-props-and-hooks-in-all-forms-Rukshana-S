import React from "react";
import { NavLink } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import "../admin.css";

export default function AdminSidebar() {
  const { isSuperAdmin } = useAdmin();
  const NAV = [
    { to: "/admin/dashboard", label: "Dashboard" },
    { to: "/admin/products", label: "Products" },
    { to: "/admin/orders", label: "Orders" },
    { to: "/admin/users", label: "Users" },
    { to: "/admin/analytics", label: "Analytics" },
    { to: "/admin/settings", label: "Settings" },
  ];
  const SUPER_NAV = [
    { to: "/admin/admins", label: "Admin Management" },
  ];

  return (
    <aside className="adm-sidebar">
      <div className="adm-sidebar-brand">
        <span className="adm-brand-logo">WEARLY</span>
        <span className="adm-brand-sub">Admin</span>
      </div>
      <div className="adm-sidebar-role">
        <span className={`adm-role-badge ${isSuperAdmin ? "adm-role-super" : "adm-role-store"}`}>
          {isSuperAdmin ? "Super Admin" : "Store Admin"}
        </span>
      </div>
      <nav className="adm-sidebar-nav">
        {NAV.map(({ to, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `adm-nav-item${isActive ? " adm-nav-active" : ""}`}>
            <span className="adm-nav-icon">•</span>
            <span className="adm-nav-label">{label}</span>
          </NavLink>
        ))}
        {isSuperAdmin && SUPER_NAV.map(({ to, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `adm-nav-item${isActive ? " adm-nav-active" : ""}`}>
            <span className="adm-nav-icon">•</span>
            <span className="adm-nav-label">{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
