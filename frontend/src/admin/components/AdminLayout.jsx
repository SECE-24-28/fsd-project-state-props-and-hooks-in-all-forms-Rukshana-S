import React from "react";
import { Outlet } from "react-router-dom";
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
  { to: "/admin/dashboard",          label: "Dashboard" },
  { to: "/admin/products",           label: "Products" },
  { to: "/admin/orders",             label: "Orders" },
  { to: "/admin/users",              label: "Users" },
  { to: "/admin/analytics",          label: "Analytics" },
  { to: "/admin/store-applications", label: "Seller Requests" },
  { to: "/admin/settings",           label: "Settings" },
  { to: "/admin/admins",             label: "Seller Management" },
  { to: "/admin/messages",           label: "Messages" },
];

export default function AdminLayout() {
  return (
    <div className="adm-new-shell" style={shellStyle}>
      <AdminNavbar navLinks={BASE_NAV} logoSub="ADMIN" drawerTitle="WEARLY ADMIN" />
      <main className="adm-new-content">
        <Outlet />
      </main>
      <footer className="adm-new-footer">
        © 2024 WEARLY Admin Panel · All rights reserved
      </footer>
    </div>
  );
}
