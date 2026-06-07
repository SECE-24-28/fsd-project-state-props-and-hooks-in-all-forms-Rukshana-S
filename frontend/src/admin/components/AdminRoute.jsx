import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AdminRoute({ children, superOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) return <Navigate to="/login" replace />;

  const role = (user.role || "").toLowerCase().replace(/_/g, "-");
  const status = (user.status || "").toLowerCase();

  if (role === "super-admin") {
    return children;
  }

  if (role === "store-admin") {
    if (status === "pending") return <Navigate to="/store-admin/pending" replace />;
    if (status === "rejected") return <Navigate to="/store-admin/rejected" replace />;
    return <Navigate to="/store-admin/dashboard" replace />;
  }

  return <Navigate to="/" replace />;
}
