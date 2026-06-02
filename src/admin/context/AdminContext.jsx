import React, { createContext, useContext, useState, useEffect } from "react";
import { PRODUCTS as STORE_PRODUCTS } from "../../context/StoreContext";

// ─── Default accounts ───────────────────────────────────────────────────────
const DEFAULT_SUPER_ADMIN = {
  id: 1, name: "Rukshana", email: "rukshana@gmail.com",
  password: "admin", role: "super-admin", status: "active",
  createdAt: "2024-01-01T00:00:00.000Z",
};

const DEFAULT_STORE_ADMIN = {
  id: 2, name: "Store Admin", email: "storeadmin@wearly.com",
  password: "store123", role: "store-admin", status: "active",
  storeName: "WEARLY Main Store", createdAt: "2024-01-01T00:00:00.000Z",
};

// ─── Seed data ───────────────────────────────────────────────────────────────
const SEED_ORDERS = [
  { id: "WRLY-001", customer: "Priya Sharma",  email: "priya@example.com",  date: "2024-06-01", items: 3, amount: 5697, payment: "UPI",  status: "Delivered"  },
  { id: "WRLY-002", customer: "Ananya Nair",   email: "ananya@example.com", date: "2024-06-03", items: 1, amount: 1899, payment: "Card", status: "Shipped"     },
  { id: "WRLY-003", customer: "Meera Patel",   email: "meera@example.com",  date: "2024-06-05", items: 2, amount: 3398, payment: "COD",  status: "Processing"  },
  { id: "WRLY-004", customer: "Kavya Reddy",   email: "kavya@example.com",  date: "2024-06-07", items: 1, amount: 4999, payment: "UPI",  status: "Confirmed"   },
  { id: "WRLY-005", customer: "Sneha Iyer",    email: "sneha@example.com",  date: "2024-06-08", items: 4, amount: 7196, payment: "Card", status: "Pending"     },
  { id: "WRLY-006", customer: "Divya Kumar",   email: "divya@example.com",  date: "2024-06-09", items: 2, amount: 3198, payment: "UPI",  status: "Cancelled"   },
];

const SEED_CUSTOMERS = [
  { id: 1, name: "Priya Sharma",  email: "priya@example.com",  phone: "+91 9876543210", orders: 5, registeredAt: "2024-01-15", status: "active" },
  { id: 2, name: "Ananya Nair",   email: "ananya@example.com", phone: "+91 9876543211", orders: 3, registeredAt: "2024-02-20", status: "active" },
  { id: 3, name: "Meera Patel",   email: "meera@example.com",  phone: "+91 9876543212", orders: 7, registeredAt: "2024-01-05", status: "active" },
  { id: 4, name: "Kavya Reddy",   email: "kavya@example.com",  phone: "+91 9876543213", orders: 2, registeredAt: "2024-03-10", status: "active" },
  { id: 5, name: "Sneha Iyer",    email: "sneha@example.com",  phone: "+91 9876543214", orders: 8, registeredAt: "2023-12-01", status: "active" },
];

const SEED_SETTINGS = {
  storeName: "WEARLY", storeEmail: "hello@wearly.com",
  storePhone: "+91 422-4567-890",
  storeAddress: "126 D/10 A, Gandhipuram, Coimbatore - 641001",
  instagram: "https://instagram.com/wearly",
  facebook: "https://facebook.com/wearly",
  pinterest: "https://pinterest.com/wearly",
  youtube: "https://youtube.com/@wearly",
};

// ─── SYNCHRONOUS seed — runs before ANY useState initializer ─────────────────
// This guarantees both default admins are in localStorage before React reads it.
function ensureDefaultAdmins() {
  try {
    const raw = localStorage.getItem("admins");
    let list = [];
    try { list = JSON.parse(raw) || []; } catch { list = []; }
    if (!Array.isArray(list)) list = [];

    let dirty = false;
    if (!list.find(a => (a.email || "").toLowerCase() === DEFAULT_SUPER_ADMIN.email)) {
      list.unshift(DEFAULT_SUPER_ADMIN);
      dirty = true;
    }
    if (!list.find(a => (a.email || "").toLowerCase() === DEFAULT_STORE_ADMIN.email)) {
      list.push(DEFAULT_STORE_ADMIN);
      dirty = true;
    }
    if (dirty) localStorage.setItem("admins", JSON.stringify(list));
    return list;
  } catch {
    const fallback = [DEFAULT_SUPER_ADMIN, DEFAULT_STORE_ADMIN];
    localStorage.setItem("admins", JSON.stringify(fallback));
    return fallback;
  }
}

function seedOtherData() {
  if (!localStorage.getItem("orders"))         localStorage.setItem("orders",         JSON.stringify(SEED_ORDERS));
  if (!localStorage.getItem("customers"))      localStorage.setItem("customers",      JSON.stringify(SEED_CUSTOMERS));
  if (!localStorage.getItem("settings"))       localStorage.setItem("settings",       JSON.stringify(SEED_SETTINGS));
  if (!localStorage.getItem("privacyPolicy"))  localStorage.setItem("privacyPolicy",  "WEARLY respects your privacy.");
  if (!localStorage.getItem("termsConditions"))localStorage.setItem("termsConditions","By using WEARLY, you agree to our terms.");
}

// Run synchronously at module load time — before any component renders
const INITIAL_ADMINS = ensureDefaultAdmins();
seedOtherData();

// ─── Context ─────────────────────────────────────────────────────────────────
const AdminContext = createContext();

export function AdminProvider({ children }) {
  // State initializers now read from localStorage which is already seeded above
  const [adminSession, setAdminSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem("adminSession")) || null; } catch { return null; }
  });

  const [admins, setAdmins] = useState(() => {
    try {
      const raw = localStorage.getItem("admins");
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_ADMINS;
    } catch { return INITIAL_ADMINS; }
  });

  const [orders, setOrders] = useState(() => {
    try { return JSON.parse(localStorage.getItem("orders")) || SEED_ORDERS; } catch { return SEED_ORDERS; }
  });
  const [customers, setCustomers] = useState(() => {
    try { return JSON.parse(localStorage.getItem("customers")) || SEED_CUSTOMERS; } catch { return SEED_CUSTOMERS; }
  });
  const [settings, setSettings] = useState(() => {
    try { return JSON.parse(localStorage.getItem("settings")) || SEED_SETTINGS; } catch { return SEED_SETTINGS; }
  });
  const [privacyPolicy,    setPrivacyPolicy]    = useState(() => localStorage.getItem("privacyPolicy")   || "");
  const [termsConditions,  setTermsConditions]  = useState(() => localStorage.getItem("termsConditions") || "");
  const [products, setProducts] = useState(() => {
    try { return JSON.parse(localStorage.getItem("products")) || STORE_PRODUCTS || []; } catch { return STORE_PRODUCTS || []; }
  });

  // Sync state → localStorage whenever it changes
  useEffect(() => { localStorage.setItem("admins",         JSON.stringify(admins));        }, [admins]);
  useEffect(() => { localStorage.setItem("orders",         JSON.stringify(orders));        }, [orders]);
  useEffect(() => { localStorage.setItem("customers",      JSON.stringify(customers));     }, [customers]);
  useEffect(() => { localStorage.setItem("settings",       JSON.stringify(settings));      }, [settings]);
  useEffect(() => { localStorage.setItem("privacyPolicy",  privacyPolicy);                }, [privacyPolicy]);
  useEffect(() => { localStorage.setItem("termsConditions",termsConditions);              }, [termsConditions]);
  useEffect(() => { localStorage.setItem("products",       JSON.stringify(products));      }, [products]);

  // ─── Login ────────────────────────────────────────────────────────────────
  const adminLogin = (email, password) => {
    const inputEmail = (email || "").toLowerCase().trim();
    const inputPass  = (password || "").trim();

    // Debug logs (as requested)
    console.log("=== Admin Login Attempt ===");
    console.log("Entered Email:", inputEmail);
    console.log("Entered Password:", inputPass);
    console.log("Admins in state:", admins);

    // Search React state first
    let found = admins.find(a =>
      (a.email    || "").toLowerCase().trim() === inputEmail &&
      (a.password || "")                      === inputPass  &&
      (a.status   || "").toLowerCase()        === "active"
    );

    // Fallback: read fresh from localStorage in case state is stale
    if (!found) {
      try {
        const lsAdmins = JSON.parse(localStorage.getItem("admins")) || [];
        console.log("Admins in localStorage (fallback):", lsAdmins);
        found = lsAdmins.find(a =>
          (a.email    || "").toLowerCase().trim() === inputEmail &&
          (a.password || "")                      === inputPass  &&
          (a.status   || "").toLowerCase()        === "active"
        );
        // Sync state if they drifted
        if (lsAdmins.length > admins.length) setAdmins(lsAdmins);
      } catch { /* ignore */ }
    }

    console.log("Matched Admin:", found || "NONE");

    if (!found) return false;

    const session = { id: found.id, name: found.name, email: found.email, role: found.role, status: found.status };
    localStorage.setItem("adminSession", JSON.stringify(session));
    setAdminSession(session);
    return found.role; // caller navigates based on role
  };

  const adminLogout = () => {
    localStorage.removeItem("adminSession");
    setAdminSession(null);
  };

  // ─── Role helpers ─────────────────────────────────────────────────────────
  const roleStr    = (adminSession?.role || "").toLowerCase().replace(/_/g, "-");
  const isSuperAdmin = roleStr.includes("super");
  const isStoreAdmin = roleStr.includes("store");

  // ─── Admin CRUD ───────────────────────────────────────────────────────────
  const createAdmin = (data) => {
    const newAdmin = {
      ...data,
      id: Date.now(),
      role: "store-admin",
      status: "active",
      createdAt: new Date().toISOString(),
    };
    // Append safely without overwriting
    const current = (() => { try { return JSON.parse(localStorage.getItem("admins")) || []; } catch { return []; } })();
    const updated = [...current, newAdmin];
    localStorage.setItem("admins", JSON.stringify(updated));
    setAdmins(updated);
  };

  const updateAdmin = (id, data) =>
    setAdmins(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));

  const deleteAdmin = (id) =>
    setAdmins(prev => prev.filter(a => (a.role || "").toLowerCase().includes("super") || a.id !== id));

  const toggleAdminStatus = (id) =>
    setAdmins(prev => prev.map(a =>
      a.id === id ? { ...a, status: (a.status || "").toLowerCase() === "active" ? "inactive" : "active" } : a
    ));

  // ─── Orders ───────────────────────────────────────────────────────────────
  const updateOrderStatus = (id, status) =>
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));

  // ─── Customers ────────────────────────────────────────────────────────────
  const deleteCustomer       = (id) => setCustomers(prev => prev.filter(c => c.id !== id));
  const toggleCustomerStatus = (id) => setCustomers(prev => prev.map(c =>
    c.id === id ? { ...c, status: c.status === "active" ? "inactive" : "active" } : c
  ));

  // ─── Products ─────────────────────────────────────────────────────────────
  const addProduct    = (p)    => setProducts(prev => [{ ...p, id: Date.now() }, ...prev]);
  const updateProduct = (id, data) => setProducts(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  const deleteProduct = (id)   => setProducts(prev => prev.filter(p => p.id !== id));

  // ─── Settings / legal ─────────────────────────────────────────────────────
  const saveSettings        = (data) => setSettings(data);
  const savePrivacyPolicy   = (t)    => setPrivacyPolicy(t);
  const saveTermsConditions = (t)    => setTermsConditions(t);

  // ─── Analytics (derived) ──────────────────────────────────────────────────
  const analytics = {
    totalRevenue: orders
      .filter(o => o.status !== "Cancelled" && o.status !== "Refunded")
      .reduce((s, o) => s + (o.amount || 0), 0),
    totalOrders:   orders.length,
    totalCustomers: customers.length,
    monthlySales:  [38000, 42000, 35000, 48000, 52000, 45000],
    monthLabels:   ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    categoryData:  { Women: 35, Men: 25, Kids: 20, Ethnic: 20 },
    orderStatuses: {
      Delivered:  orders.filter(o => o.status === "Delivered").length,
      Shipped:    orders.filter(o => o.status === "Shipped").length,
      Processing: orders.filter(o => o.status === "Processing").length,
      Pending:    orders.filter(o => o.status === "Pending").length,
      Cancelled:  orders.filter(o => o.status === "Cancelled").length,
    },
  };

  return (
    <AdminContext.Provider value={{
      adminSession, adminLogin, adminLogout, isSuperAdmin, isStoreAdmin,
      admins,   createAdmin, updateAdmin, deleteAdmin, toggleAdminStatus,
      orders,   updateOrderStatus,
      customers, deleteCustomer, toggleCustomerStatus,
      settings, saveSettings,
      privacyPolicy, savePrivacyPolicy,
      termsConditions, saveTermsConditions,
      products, addProduct, updateProduct, deleteProduct,
      analytics,
    }}>
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);
