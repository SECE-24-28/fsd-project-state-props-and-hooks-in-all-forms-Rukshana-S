import React from "react";
import { Navigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";

export default function StoreAdminRoute({ children }) {
  const { adminSession, isSuperAdmin } = useAdmin();
  if (!adminSession) return <Navigate to="/login" replace />;
  if (isSuperAdmin) return <Navigate to="/admin/dashboard" replace />;
  return children;
}
