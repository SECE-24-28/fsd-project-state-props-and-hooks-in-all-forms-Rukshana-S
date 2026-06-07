import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import { useAuth } from "../../context/AuthContext";
import "../admin.css";
import "../styles/AdminNavbar.css";

export default function AdminNavbar({ navLinks, logoSub, drawerTitle }) {
  const { isSuperAdmin, notifications, unreadCount, markNotificationRead, markAllRead } = useAdmin();
  const { user: authUser, logout: authLogout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [bellOpen, setBellOpen]       = useState(false);
  const profileRef = useRef(null);
  const bellRef    = useRef(null);

  const displayUser = authUser;

  const handleLogout = () => {
    authLogout?.();
    navigate("/login");
  };

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (bellRef.current    && !bellRef.current.contains(e.target))    setBellOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const initials = (displayUser?.name || "A")[0].toUpperCase();
  const roleName = isSuperAdmin ? "Super Admin" : "Store Admin";

  const NOTIF_ICONS = { approved: "✅", rejected: "❌", order: "📦", stock: "⚠️", default: "🔔" };

  return (
    <>
      <header className="anb-header">
        <div className="anb-outer">
          <nav className="anb-pill">

            <div className="anb-logo">
              WEARLY<span className="anb-logo-sub">{logoSub}</span>
            </div>

            <ul className="anb-links">
              {navLinks.map(({ to, label }) => (
                <li key={to}>
                  <NavLink to={to} className={({ isActive }) => `anb-link${isActive ? " anb-link-active" : ""}`}>
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="anb-actions">

              {/* Bell with dropdown */}
              <div className="anb-bell-wrap" ref={bellRef}>
                <button className="anb-bell" title="Notifications" onClick={() => setBellOpen(p => !p)}>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                    <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 002 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                  </svg>
                  {unreadCount > 0 && (
                    <span className="anb-bell-count">{unreadCount > 9 ? "9+" : unreadCount}</span>
                  )}
                </button>

                {bellOpen && (
                  <div className="anb-notif-dropdown">
                    <div className="anb-notif-header">
                      <span className="anb-notif-title">Notifications</span>
                      {unreadCount > 0 && (
                        <button className="anb-notif-markall" onClick={markAllRead}>Mark all read</button>
                      )}
                    </div>
                    <div className="anb-notif-list">
                      {notifications.length === 0 ? (
                        <div className="anb-notif-empty">No notifications</div>
                      ) : notifications.slice(0, 8).map(n => (
                        <div
                          key={n._id || n.id}
                          className={`anb-notif-item${n.read ? " anb-notif-read" : ""}`}
                          onClick={() => markNotificationRead(n._id || n.id)}
                        >
                          <span className="anb-notif-icon">{NOTIF_ICONS[n.type] || NOTIF_ICONS.default}</span>
                          <div className="anb-notif-body">
                            <p className="anb-notif-item-title">{n.title}</p>
                            <p className="anb-notif-msg">{n.message}</p>
                            {n.createdAt && (
                              <p className="anb-notif-date">
                                {new Date(n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                              </p>
                            )}
                          </div>
                          {!n.read && <span className="anb-notif-dot" />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div className="anb-profile-wrap" ref={profileRef}>
                <button className="anb-profile-btn" onClick={() => setProfileOpen(p => !p)}>
                  <span className="anb-avatar">{initials}</span>
                  <span className="anb-profile-name">{displayUser?.name}</span>
                  <svg className="anb-chevron" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                    <path d="M7 10l5 5 5-5z"/>
                  </svg>
                </button>
                {profileOpen && (
                  <div className="anb-dropdown">
                    <div className="anb-dropdown-header">
                      <span className="anb-dropdown-name">{displayUser?.name}</span>
                      <span className="anb-dropdown-role">{roleName}</span>
                    </div>
                    <hr className="anb-dropdown-hr"/>
                    <button className="anb-dropdown-item anb-dropdown-logout" onClick={handleLogout}>
                      <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
                        <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>

              <button className="anb-hamburger" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
                <span/><span/><span/>
              </button>
            </div>
          </nav>
        </div>
      </header>

      <div className={`anb-overlay${drawerOpen ? " anb-overlay-show" : ""}`} onClick={() => setDrawerOpen(false)}/>

      <aside className={`anb-drawer${drawerOpen ? " anb-drawer-open" : ""}`}>
        <div className="anb-drawer-header">
          <span className="anb-drawer-logo">{drawerTitle}</span>
          <button className="anb-drawer-close" onClick={() => setDrawerOpen(false)}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
        <nav className="anb-drawer-nav">
          {navLinks.map(({ to, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) => `anb-drawer-link${isActive ? " anb-drawer-active" : ""}`}
              onClick={() => setDrawerOpen(false)}>
              {label}
            </NavLink>
          ))}
        </nav>
        <hr className="anb-drawer-divider"/>
        <div className="anb-drawer-footer">
          <div className="anb-drawer-user">
            <span className="anb-drawer-avatar">{initials}</span>
            <div>
              <span className="anb-drawer-uname">{displayUser?.name}</span>
              <span className="anb-drawer-urole">{roleName}</span>
            </div>
          </div>
          <button className="anb-drawer-logout" onClick={() => { setDrawerOpen(false); handleLogout(); }}>Logout</button>
        </div>
      </aside>
    </>
  );
}
