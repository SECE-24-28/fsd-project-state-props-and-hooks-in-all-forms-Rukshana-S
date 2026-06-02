import React from "react";
import { Navigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";

export default function AdminRoute({ children, superOnly = false }) {
  const { adminSession, isSuperAdmin, isStoreAdmin } = useAdmin();

  if (!adminSession) return <Navigate to="/admin/login" replace />;

  // Store admin tried to access super-admin area — send to their dashboard
  if (isStoreAdmin) return <Navigate to="/store-admin/dashboard" replace />;

  // Super-admin-only page but not super admin
  if (superOnly && !isSuperAdmin) return <Navigate to="/admin/dashboard" replace />;

  return children;
}
