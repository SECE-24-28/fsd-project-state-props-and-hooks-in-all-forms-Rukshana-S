import React from "react";
import { Outlet } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import AdminNavbar from "./AdminNavbar";
import "../admin.css";
import adminBg from "../../Assets/images/admin_background.png";

const shellStyle = {
  backgroundImage: `url(${adminBg})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  backgroundAttachment: "fixed",
  minHeight: "100vh",
};

const BASE_NAV = [
  { to: "/admin/dashboard",  label: "Dashboard" },
  { to: "/admin/products",   label: "Products" },
  { to: "/admin/orders",     label: "Orders" },
  { to: "/admin/users",      label: "Users" },
  { to: "/admin/analytics",  label: "Analytics" },
  { to: "/admin/settings",   label: "Settings" },
];

const SUPER_ONLY = [
  { to: "/admin/admins", label: "Admin Management" },
];

export default function AdminLayout() {
  const { isSuperAdmin } = useAdmin();
  const navLinks = isSuperAdmin ? [...BASE_NAV, ...SUPER_ONLY] : BASE_NAV;

  return (
    <div className="adm-new-shell" style={shellStyle}>
      <AdminNavbar
        navLinks={navLinks}
        logoSub="ADMIN"
        drawerTitle="WEARLY ADMIN"
      />
      <main className="adm-new-content">
        <Outlet />
      </main>
      <footer className="adm-new-footer">
        © 2024 WEARLY Admin Panel · All rights reserved
      </footer>
    </div>
  );
}
