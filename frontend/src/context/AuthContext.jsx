import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(() => localStorage.getItem("wearly_token") || null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Restore session on mount
  useEffect(() => {
    const stored = localStorage.getItem("wearly_token");
    if (!stored) { setLoading(false); return; }
    api.get("/users/profile")
      .then((res) => { setUser(res.data.data); setToken(stored); })
      .catch(() => clearSession())
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  const saveSession = (tkn, userData) => {
    localStorage.setItem("wearly_token", tkn);
    setToken(tkn);
    setUser(userData);
    window.dispatchEvent(new Event("wearly_auth_change"));
  };

  const clearSession = () => {
    localStorage.removeItem("wearly_token");
    setToken(null);
    setUser(null);
    window.dispatchEvent(new Event("wearly_auth_change"));
  };

  const register = async (formData) => {
    const res = await api.post("/users/register", formData);
    const { token: tkn, data } = res.data;
    saveSession(tkn, data);
    const profile = await api.get("/users/profile");
    const fullUser = profile.data.data;
    setUser(fullUser);
    const role   = (fullUser.role   || "").toLowerCase();
    const status = (fullUser.status || "").toLowerCase();
    if (role === "store-admin") {
      if (status === "pending")  navigate("/store-admin/pending");
      else if (status === "rejected") navigate("/store-admin/rejected");
      else navigate("/store-admin/dashboard");
    } else {
      navigate("/");
    }
    return res.data;
  };

  const login = async (email, password) => {
    const res = await api.post("/users/login", { email, password });
    const { token: tkn, data } = res.data;
    saveSession(tkn, data);
    const profile = await api.get("/users/profile");
    const fullUser = profile.data.data;
    setUser(fullUser);
    const role   = (fullUser.role   || "").toLowerCase();
    const status = (fullUser.status || "").toLowerCase();
    if (role === "super-admin") {
      navigate("/admin/dashboard");
    } else if (role === "store-admin") {
      if (status === "pending")  navigate("/store-admin/pending");
      else if (status === "rejected") navigate("/store-admin/rejected");
      else navigate("/store-admin/dashboard");
    } else {
      navigate("/");
    }
    return res.data;
  };

  const getProfile = async () => {
    const res = await api.get("/users/profile");
    setUser(res.data.data);
    return res.data.data;
  };

  const updateProfile = async (updates) => {
    const res = await api.put("/users/profile", updates);
    setUser(res.data.data);
    return res.data.data;
  };

  const logout = () => {
    clearSession();
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, register, login, logout, getProfile, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
