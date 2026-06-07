import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function StoreAdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) return <Navigate to="/login" replace />;

  const role   = (user.role   || "").toLowerCase().replace(/_/g, "-");
  const status = (user.status || "").toLowerCase();

  const isSuperAdmin = role.includes("super");
  const isStoreAdmin = role.includes("store") && !isSuperAdmin;

  if (isSuperAdmin)  return <Navigate to="/admin/dashboard" replace />;
  if (!isStoreAdmin) return <Navigate to="/login" replace />;

  if (status === "pending")  return <Navigate to="/store-admin/pending" replace />;
  if (status === "rejected") return <Navigate to="/store-admin/rejected" replace />;

  return children;
}
