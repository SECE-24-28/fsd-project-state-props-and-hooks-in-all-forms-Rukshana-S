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

const SA_NAV = [
  { to: "/store-admin/dashboard",  label: "Dashboard" },
  { to: "/store-admin/products",   label: "Products" },
  { to: "/store-admin/orders",     label: "Orders" },
  { to: "/store-admin/customers",  label: "Customers" },
  { to: "/store-admin/analytics",  label: "Analytics" },
  { to: "/store-admin/settings",   label: "Settings" },
];

export default function StoreAdminLayout() {
  return (
    <div className="adm-new-shell" style={shellStyle}>
      <AdminNavbar
        navLinks={SA_NAV}
        logoSub="STORE"
        drawerTitle="WEARLY STORE"
      />
      <main className="adm-new-content">
        <Outlet />
      </main>
      <footer className="adm-new-footer">
        © 2024 WEARLY Store Admin · All rights reserved
      </footer>
    </div>
  );
}
