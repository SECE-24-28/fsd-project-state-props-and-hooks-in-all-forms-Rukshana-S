import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { useAuth } from "../context/AuthContext";
import { Package } from "lucide-react";
import api from "../services/api";
import "../Assets/Css/navbar.css";

const getNavLinks = (user) => {
  const links = [
    ["/", "Home"],
    ["/about", "About"],
    ["/contact", "Contact"],
    ["/products", "Products"],
    ["/products?filter=top", "Top Trends"],
    ["/brands", "Brands"],
  ];
  if (user) {
    links.push(["/orders", "Track Order", true]);
  }
  links.push(["/products?category=ethnic", "Ethnic Wear"]);
  links.push(["/faq", "FAQ"]);
  return links;
};

const WishIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
);

const CartIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2zM5.21 4H1v2h2l3.6 7.59L5.25 14c-.16.28-.25.61-.25.96C5 16.1 6.1 17 7.25 17H19v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63H17c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0021.46 4H5.21z" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
);

export default function Navbar() {
  const { cartCount, wishlistCount } = useStore();
  const { user: authUser, logout: authLogout } = useAuth();
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate    = useNavigate();
  const profileRef  = useRef(null);

  const displayUser = authUser;
  const handleLogout = () => { authLogout(); setProfileOpen(false); setDrawerOpen(false); };

  const userRole    = (displayUser?.role || "").toLowerCase().replace(/_/g, "-");
  const ROLE_LABELS = { "super-admin": "Super Admin", "store-admin": "Store Admin", "customer": "Customer", "user": "Customer" };
  const ROLE_COLORS = { "super-admin": "#7C3AED", "store-admin": "#0891B2", "customer": "#059669", "user": "#059669" };

  const wishCount = wishlistCount;

  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = useCallback(async () => {
    if (!displayUser) return;
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  }, [displayUser]);

  useEffect(() => {
    if (displayUser) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [displayUser, fetchNotifications]);

  const handleMarkRead = async (id) => {
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    try {
      await api.put(`/notifications/${id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await api.put("/notifications/mark-all");
    } catch (err) {
      console.error(err);
    }
  };

  const goTo = (path) => {
    navigate(path);
    window.scrollTo(0, 0);
    setDrawerOpen(false);
    setProfileOpen(false);
    setNotifOpen(false);
  };

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  return (
    <>
      <header className="nb-header">
        <div className="nb-container">
          <nav className="nb-nav">

            {/* ── Logo ── */}
            <button className="nb-logo" onClick={() => goTo("/")}>WEARLY</button>

            {/* ── Desktop / Tablet center links ── */}
            <ul className="nb-links">
              {getNavLinks(displayUser).slice(0, displayUser ? 8 : 7).map(([to, label, hasIcon]) => (
                <li key={to}>
                  <button className="nb-link" onClick={() => goTo(to)} style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    {hasIcon && <Package size={15} style={{ verticalAlign: "middle" }} />}
                    {label}
                  </button>
                </li>
              ))}
            </ul>

            {/* ── Right actions ── */}
            <div className="nb-actions">

              {/* Wishlist — hidden on mobile */}
              <button className="nb-icon-btn nb-wishlist" onClick={() => goTo("/wishlist")} aria-label="Wishlist">
                <WishIcon />
                {wishCount > 0 && <span className="nb-badge">{wishCount}</span>}
              </button>

              {/* Cart — always visible */}
              <button className="nb-icon-btn" onClick={() => goTo("/cart")} aria-label="Cart">
                <CartIcon />
                {cartCount > 0 && <span className="nb-badge">{cartCount}</span>}
              </button>

              {/* Notifications */}
              {displayUser && (
                <div className="nb-profile-wrap" ref={notifRef} style={{ position: "relative" }}>
                  <button className="nb-icon-btn" onClick={() => setNotifOpen(!notifOpen)} aria-label="Notifications" style={{ position: "relative" }}>
                    <span style={{ fontSize: "1.2rem", display: "inline-block", verticalAlign: "middle" }}>🔔</span>
                    {unreadCount > 0 && (
                      <span className="nb-badge" style={{ position: "absolute", top: "-4px", right: "-4px", background: "#DC2626", color: "#fff", fontSize: "0.65rem", padding: "2px 5px", borderRadius: "50%", minWidth: "12px", textAlign: "center", lineHeight: 1 }}>
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  {notifOpen && (
                    <div className="nb-profile-dropdown" style={{ width: "300px", padding: "12px", right: 0, top: "100%", position: "absolute", background: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", borderRadius: "8px", zIndex: 1000, border: "1px solid #eee" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                        <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "#111" }}>Notifications</span>
                        {unreadCount > 0 && (
                          <button onClick={handleMarkAllRead} style={{ background: "none", border: "none", color: "#b8929a", fontSize: "0.75rem", cursor: "pointer", fontWeight: 600 }}>
                            Mark all read
                          </button>
                        )}
                      </div>
                      <hr className="nb-dropdown-hr" style={{ margin: "4px 0 8px", border: 0, borderTop: "1px solid #eee" }} />
                      <div style={{ maxHeight: "240px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
                        {notifications.length === 0 ? (
                          <div style={{ textAlign: "center", padding: "16px", color: "#888", fontSize: "0.8rem" }}>No notifications</div>
                        ) : (
                          notifications.map(n => (
                            <div key={n._id} onClick={() => handleMarkRead(n._id)} style={{ padding: "8px", borderRadius: "8px", background: n.read ? "#f9f9f9" : "#fff0f2", border: "1px solid #eee", cursor: "pointer", display: "flex", flexDirection: "column", gap: "2px" }}>
                              <div style={{ fontWeight: 600, fontSize: "0.82rem", color: "#333", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span>{n.title}</span>
                                {!n.read && <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#DC2626", display: "inline-block" }} />}
                              </div>
                              <div style={{ fontSize: "0.75rem", color: "#666", lineHeight: 1.3 }}>{n.message}</div>
                              <div style={{ fontSize: "0.65rem", color: "#999", textAlign: "right", marginTop: "2px" }}>
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Desktop auth */}
              <div className="nb-auth nb-desktop-auth">
                {displayUser ? (
                  <>
                    <span className="nb-welcome">Welcome, {displayUser.name.split(" ")[0]}</span>
                    {userRole && ROLE_LABELS[userRole] && (
                      <span style={{ fontSize: "0.75rem", fontWeight: 600, padding: "3px 10px", borderRadius: "20px", background: `${ROLE_COLORS[userRole]}18`, color: ROLE_COLORS[userRole] }}>
                        {ROLE_LABELS[userRole]}
                      </span>
                    )}
                    <button className="nb-logout" onClick={handleLogout}>Logout</button>
                  </>
                ) : (
                  <button className="nb-login-btn" onClick={() => goTo("/login")}>Login</button>
                )}
              </div>

              {/* Tablet profile icon with dropdown */}
              <div className="nb-profile-wrap nb-tablet-auth" ref={profileRef}>
                <button className="nb-icon-btn" onClick={() => setProfileOpen(!profileOpen)} aria-label="Account">
                  <UserIcon />
                </button>
                {profileOpen && (
                  <div className="nb-profile-dropdown">
                    {displayUser ? (
                      <>
                        <span className="nb-dropdown-user">Hi, {displayUser.name.split(" ")[0]}</span>
                        {userRole && ROLE_LABELS[userRole] && (
                          <span style={{ display: "block", fontSize: "0.72rem", fontWeight: 600, color: ROLE_COLORS[userRole], padding: "0 0 6px" }}>{ROLE_LABELS[userRole]}</span>
                        )}
                        <hr className="nb-dropdown-hr" />
                        <button className="nb-dropdown-item" onClick={() => goTo("/wishlist")}>Wishlist</button>
                        <button className="nb-dropdown-item" onClick={() => goTo("/orders")}>My Orders</button>
                        <button className="nb-dropdown-item" onClick={() => goTo("/cart")}>Cart</button>
                        <hr className="nb-dropdown-hr" />
                        <button className="nb-dropdown-item nb-dropdown-logout" onClick={handleLogout}>Logout</button>
                      </>
                    ) : (
                      <button className="nb-dropdown-item" onClick={() => goTo("/login")}>Login / Sign Up</button>
                    )}
                  </div>
                )}
              </div>

              {/* Hamburger — mobile only */}
              <button
                className={`nb-hamburger${drawerOpen ? " nb-ham-open" : ""}`}
                onClick={() => setDrawerOpen(true)}
                aria-label="Open menu"
              >
                <span />
                <span />
                <span />
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* ── Side Drawer Overlay ── */}
      <div
        className={`nb-overlay${drawerOpen ? " nb-overlay-visible" : ""}`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* ── Side Drawer ── */}
      <aside className={`nb-drawer${drawerOpen ? " nb-drawer-open" : ""}`} aria-hidden={!drawerOpen}>

        <div className="nb-drawer-header">
          <span className="nb-drawer-logo">WEARLY</span>
          <button className="nb-drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
            <CloseIcon />
          </button>
        </div>

        <nav className="nb-drawer-nav">
          {getNavLinks(displayUser).map(([to, label, hasIcon]) => (
            <button key={to} className="nb-drawer-link" onClick={() => goTo(to)} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {hasIcon && <Package size={16} />}
              {label}
            </button>
          ))}
        </nav>

        <hr className="nb-drawer-divider" />

        <div className="nb-drawer-account">
          <button className="nb-drawer-link" onClick={() => goTo("/wishlist")}>
            <span className="nb-drawer-link-icon"><WishIcon /></span>
            Wishlist {wishCount > 0 && <span className="nb-drawer-badge">{wishCount}</span>}
          </button>
          <button className="nb-drawer-link" onClick={() => goTo("/orders")}>
            <span className="nb-drawer-link-icon"><CartIcon /></span>
            My Orders
          </button>
          <button className="nb-drawer-link" onClick={() => goTo("/cart")}>
            <span className="nb-drawer-link-icon"><CartIcon /></span>
            Cart {cartCount > 0 && <span className="nb-drawer-badge">{cartCount}</span>}
          </button>
          {displayUser ? (
            <>
              <div style={{ padding: "8px 0", fontSize: "0.85rem", fontWeight: 600, color: "#2f2f2f" }}>
                {displayUser.name}
                {userRole && ROLE_LABELS[userRole] && (
                  <span style={{ marginLeft: "8px", fontSize: "0.72rem", fontWeight: 600, padding: "2px 8px", borderRadius: "20px", background: `${ROLE_COLORS[userRole]}18`, color: ROLE_COLORS[userRole] }}>{ROLE_LABELS[userRole]}</span>
                )}
              </div>
              <button className="nb-drawer-logout" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <button className="nb-drawer-login" onClick={() => goTo("/login")}>Login / Sign Up</button>
          )}
        </div>

        <hr className="nb-drawer-divider" />

        <div className="nb-drawer-contact">
          <p className="nb-drawer-contact-title">Contact Us</p>
          <a href="mailto:hello@wearly.com" className="nb-drawer-contact-item">hello@wearly.com</a>
          <span className="nb-drawer-contact-item">+91 11-4567-8900</span>
          <span className="nb-drawer-contact-item">126 D/10 A, Gandhipuram,<br />Coimbatore - 641001</span>
        </div>
      </aside>
    </>
  );
}
