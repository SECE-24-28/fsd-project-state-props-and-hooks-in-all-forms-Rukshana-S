import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import api from "../../services/api";

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const [orders,             setOrders]             = useState([]);
  const [products,           setProducts]           = useState([]);
  const [customers,          setCustomers]          = useState([]);
  const [admins,             setAdmins]             = useState([]);
  const [storeApplications,  setStoreApplications]  = useState([]);
  const [notifications,      setNotifications]      = useState([]);
  const [activityLogs,       setActivityLogs]       = useState([]);

  // Derive role from JWT token via /users/profile — we read from shared token
  const [adminUser, setAdminUser] = useState(null);

  const roleStr      = (adminUser?.role || "").toLowerCase().replace(/_/g, "-");
  const isSuperAdmin = roleStr.includes("super");
  const isStoreAdmin = roleStr.includes("store") && !roleStr.includes("super");

  // Legacy stub — AdminNavbar reads adminSession?.name; we bridge from adminUser
  const adminSession = adminUser ? {
    name: adminUser.name,
    email: adminUser.email,
    role: adminUser.role,
    status: adminUser.status,
    storeName: adminUser.storeName,
    brandName: adminUser.brandName,
  } : null;

  // ── Sync adminUser from token when token changes ──────────────────────────
  const syncUser = useCallback(async () => {
    const token = localStorage.getItem("wearly_token");
    if (!token) { setAdminUser(null); return; }
    try {
      const res = await api.get("/users/profile");
      const u = res.data.data;
      const role = (u.role || "").toLowerCase();
      if (role.includes("admin")) setAdminUser(u);
      else setAdminUser(null);
    } catch {
      setAdminUser(null);
    }
  }, []);

  useEffect(() => {
    syncUser();
    window.addEventListener("wearly_auth_change", syncUser);
    return () => window.removeEventListener("wearly_auth_change", syncUser);
  }, [syncUser]);

  // ── Fetch helpers ─────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    try {
      const endpoint = isSuperAdmin ? "/superadmin/products" : "/storeadmin/products";
      const res = await api.get(endpoint);
      setProducts(res.data.data || []);
    } catch { setProducts([]); }
  }, [isSuperAdmin]);

  const fetchOrders = useCallback(async () => {
    try {
      const endpoint = isSuperAdmin ? "/superadmin/orders" : "/storeadmin/orders";
      const res = await api.get(endpoint);
      setOrders(res.data.data || []);
    } catch { setOrders([]); }
  }, [isSuperAdmin]);

  const fetchCustomers = useCallback(async () => {
    try {
      const endpoint = isSuperAdmin ? "/superadmin/users" : "/storeadmin/customers";
      const res = await api.get(endpoint);
      setCustomers(res.data.data || []);
    } catch { setCustomers([]); }
  }, [isSuperAdmin]);

  const fetchAdmins = useCallback(async () => {
    if (!isSuperAdmin) return;
    try {
      const res = await api.get("/superadmin/storeadmins");
      setAdmins(res.data.data || []);
    } catch { setAdmins([]); }
  }, [isSuperAdmin]);

  const fetchApplications = useCallback(async () => {
    if (!isSuperAdmin) return;
    try {
      const res = await api.get("/superadmin/applications");
      setStoreApplications(res.data.data || []);
    } catch { setStoreApplications([]); }
  }, [isSuperAdmin]);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.data || []);
    } catch { setNotifications([]); }
  }, []);

  // Refresh all when adminUser/role resolves
  useEffect(() => {
    if (!adminUser) return;
    fetchProducts();
    fetchOrders();
    fetchCustomers();
    fetchAdmins();
    fetchApplications();
    fetchNotifications();
  }, [adminUser, fetchProducts, fetchOrders, fetchCustomers, fetchAdmins, fetchApplications, fetchNotifications]);

  // ── Activity Log ─────────────────────────────────────────────────────────
  const logActivity = useCallback((action, details) => {
    setActivityLogs(prev => [{
      id: Date.now() + Math.random(), action, details,
      timestamp: new Date().toISOString(),
      user: adminUser?.name || "System",
    }, ...prev]);
  }, [adminUser]);

  // ── Notifications ─────────────────────────────────────────────────────────
  const addNotification      = (notif) => setNotifications(prev => [{ id: Date.now(), ...notif, read: false, createdAt: new Date().toISOString() }, ...prev]);
  const markNotificationRead = async (id) => {
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id || n._id === id ? { ...n, read: true } : n));
    try { await api.put(`/notifications/${id}`); } catch {}
  };
  const markAllRead = async () => {
    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try { await api.put("/notifications/mark-all"); } catch {}
  };
  const unreadCount = notifications.filter(n => !n.read).length;

  // ── Legacy auth stubs (AdminNavbar calls adminLogout on logout) ───────────
  const adminLogout = () => {
    localStorage.removeItem("wearly_token");
    setAdminUser(null);
    setOrders([]); setProducts([]); setCustomers([]); setAdmins([]);
    setStoreApplications([]); setNotifications([]);
  };
  const adminLogin           = () => false;
  const setAdminSessionDirect = () => {};

  // ── Store Applications ────────────────────────────────────────────────────
  const approveApplication = async (userId) => {
    try {
      await api.put(`/superadmin/approve/${userId}`);
      await fetchApplications();
      await fetchAdmins();
      logActivity("Store approved", `User ${userId}`);
    } catch (err) { console.error("approveApplication:", err?.response?.data?.message); }
  };

  const rejectApplication = async (userId) => {
    try {
      await api.put(`/superadmin/reject/${userId}`);
      await fetchApplications();
      logActivity("Store rejected", `User ${userId}`);
    } catch (err) { console.error("rejectApplication:", err?.response?.data?.message); }
  };

  // ── Admin CRUD ────────────────────────────────────────────────────────────
  const deactivateAdmin = async (id) => {
    try { await api.put(`/superadmin/deactivate/${id}`); await fetchAdmins(); } catch {}
  };
  const activateAdmin = async (id) => {
    try { await api.put(`/superadmin/activate/${id}`); await fetchAdmins(); } catch {}
  };
  const deleteAdmin = async (id) => {
    try { await api.delete(`/superadmin/delete/${id}`); await fetchAdmins(); } catch {}
  };
  const createAdmin      = () => {};
  const updateAdmin      = () => {};
  const toggleAdminStatus = (id) => {
    const admin = admins.find(a => (a._id || a.id) === id);
    if (!admin) return;
    if (admin.status === "approved") deactivateAdmin(id);
    else activateAdmin(id);
  };
  const restoreAdmin = activateAdmin;

  // ── Orders ────────────────────────────────────────────────────────────────
  const updateOrderStatus = async (id, orderStatus) => {
    try {
      await api.put(`/orders/${id}`, { orderStatus });
      setOrders(prev => prev.map(o => (o._id || o.id) === id ? { ...o, orderStatus } : o));
    } catch {}
  };

  // ── Customers ─────────────────────────────────────────────────────────────
  const deleteCustomer       = (id) => setCustomers(prev => prev.filter(c => (c._id || c.id) !== id));
  const restoreCustomer      = () => {};
  const toggleCustomerStatus = (id) => setCustomers(prev => prev.map(c =>
    (c._id || c.id) === id ? { ...c, status: c.status === "active" ? "inactive" : "active" } : c
  ));

  // ── Products ──────────────────────────────────────────────────────────────
  const addProduct = async (p) => {
    try {
      const res = await api.post("/products", p);
      setProducts(prev => [res.data.data, ...prev]);
      logActivity("Product added", res.data.data.name);
    } catch (err) { console.error("addProduct:", err?.response?.data?.message); throw err; }
  };

  const updateProduct = async (id, data) => {
    try {
      const res = await api.put(`/products/${id}`, data);
      setProducts(prev => prev.map(p => (p._id || p.id) === id ? res.data.data : p));
    } catch (err) { console.error("updateProduct:", err?.response?.data?.message); throw err; }
  };

  const deleteProduct = async (id) => {
    try {
      await api.delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => (p._id || p.id) !== id));
    } catch (err) { console.error("deleteProduct:", err?.response?.data?.message); throw err; }
  };
  const restoreProduct = () => {};

  // ── Analytics (computed from real data) ──────────────────────────────────
  const analytics = {
    totalRevenue:   orders.filter(o => o.orderStatus !== "Cancelled").reduce((s, o) => s + (Number(o.amount) || 0), 0),
    totalOrders:    orders.length,
    totalCustomers: customers.length,
    // Monthly sales — computed from real orders
    monthlySales: (() => {
      const months = Array(6).fill(0);
      const now = new Date();
      orders.forEach(o => {
        if (o.orderStatus === "Cancelled") return;
        const d = new Date(o.createdAt);
        const diff = (now.getFullYear() - d.getFullYear()) * 12 + now.getMonth() - d.getMonth();
        if (diff >= 0 && diff < 6) months[5 - diff] += Number(o.amount) || 0;
      });
      return months;
    })(),
    monthLabels: (() => {
      const labels = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        labels.push(d.toLocaleString("en-IN", { month: "short" }));
      }
      return labels;
    })(),
    categoryData: (() => {
      const map = {};
      products.forEach(p => { map[p.category] = (map[p.category] || 0) + 1; });
      const total = Object.values(map).reduce((a, b) => a + b, 0) || 1;
      const pct = {};
      Object.entries(map).forEach(([k, v]) => { pct[k] = Math.round((v / total) * 100); });
      return pct;
    })(),
    orderStatuses: {
      Delivered:  orders.filter(o => o.orderStatus === "Delivered").length,
      Shipped:    orders.filter(o => o.orderStatus === "Shipped").length,
      Processing: orders.filter(o => o.orderStatus === "Processing").length,
      Pending:    orders.filter(o => o.orderStatus === "Pending").length,
      Cancelled:  orders.filter(o => o.orderStatus === "Cancelled").length,
    },
  };

  // Legacy settings (super admin settings page — platform-level)
  const [settings, setSettings] = useState({
    storeName: "WEARLY", storeEmail: "hello@wearly.com",
    storePhone: "+91 422-4567-890",
    storeAddress: "126 D/10 A, Gandhipuram, Coimbatore - 641001",
    instagram: "https://instagram.com/wearly",
    facebook:  "https://facebook.com/wearly",
    pinterest: "https://pinterest.com/wearly",
    youtube:   "https://youtube.com/@wearly",
  });
  const saveSettings = (data) => setSettings(data);

  const [privacyPolicy,   setPrivacyPolicy]   = useState("WEARLY respects your privacy.");
  const [termsConditions, setTermsConditions] = useState("By using WEARLY, you agree to our terms.");
  const savePrivacyPolicy   = (t) => setPrivacyPolicy(t);
  const saveTermsConditions = (t) => setTermsConditions(t);

  return (
    <AdminContext.Provider value={{
      adminSession, adminUser, adminLogin, adminLogout, setAdminSessionDirect,
      isSuperAdmin, isStoreAdmin, syncUser,
      admins, createAdmin, updateAdmin, deleteAdmin, toggleAdminStatus, restoreAdmin, deactivateAdmin, activateAdmin,
      orders, updateOrderStatus,
      customers, deleteCustomer, toggleCustomerStatus, restoreCustomer,
      settings, saveSettings,
      privacyPolicy, savePrivacyPolicy,
      termsConditions, saveTermsConditions,
      products, addProduct, updateProduct, deleteProduct, restoreProduct,
      analytics,
      storeApplications, approveApplication, rejectApplication,
      notifications, unreadCount, markNotificationRead, markAllRead, addNotification,
      activityLogs, logActivity,
      fetchProducts, fetchOrders, fetchCustomers, fetchAdmins, fetchApplications, fetchNotifications,
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);
