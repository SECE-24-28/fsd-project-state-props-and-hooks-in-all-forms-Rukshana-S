import React from "react";
import { Navigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";

export default function AdminRoute({ children, superOnly = false }) {
  const { adminSession, isSuperAdmin, isStoreAdmin } = useAdmin();

  if (!adminSession) return <Navigate to="/login" replace />;
  if (isStoreAdmin) return <Navigate to="/store-admin/dashboard" replace />;
  if (superOnly && !isSuperAdmin) return <Navigate to="/admin/dashboard" replace />;

  return children;
}
