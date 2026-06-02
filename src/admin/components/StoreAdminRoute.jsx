import React from "react";
import { Navigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";

export default function StoreAdminRoute({ children }) {
  const { adminSession } = useAdmin();
  if (!adminSession) return <Navigate to="/admin/login" replace />;
  const role = (adminSession.role || "").toLowerCase().replace("_", "-");
  if (role === "super-admin") return <Navigate to="/admin/dashboard" replace />;
  return children;
}
