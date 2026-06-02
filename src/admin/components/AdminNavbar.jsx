import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";
import "../admin.css";
import "../styles/AdminNavbar.css";

export default function AdminNavbar({ navLinks, logoSub, drawerTitle }) {
  const { adminSession, adminLogout, isSuperAdmin } = useAdmin();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const handleLogout = () => {
    adminLogout();
    navigate("/admin/login");
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const initials = (adminSession?.name || "A")[0].toUpperCase();
  const roleName = isSuperAdmin ? "Super Admin" : "Store Admin";

  return (
    <>
      {/* ── Header shell ── */}
      <header className="anb-header">
        <div className="anb-outer">

          {/* ── Single pill container ── */}
          <nav className="anb-pill">

            {/* LEFT — Logo */}
            <div className="anb-logo">
              WEARLY
              <span className="anb-logo-sub">{logoSub}</span>
            </div>

            {/* CENTER — Nav links */}
            <ul className="anb-links">
              {navLinks.map(({ to, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      `anb-link${isActive ? " anb-link-active" : ""}`
                    }
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* RIGHT — Bell + Profile + Hamburger */}
            <div className="anb-actions">

              {/* Notification Bell */}
              <button className="anb-bell" title="Notifications">
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 002 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                </svg>
                <span className="anb-bell-dot" />
              </button>

              {/* Profile */}
              <div className="anb-profile-wrap" ref={profileRef}>
                <button
                  className="anb-profile-btn"
                  onClick={() => setProfileOpen(p => !p)}
                >
                  <span className="anb-avatar">{initials}</span>
                  <span className="anb-profile-name">{adminSession?.name}</span>
                  <svg className="anb-chevron" viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                    <path d="M7 10l5 5 5-5z" />
                  </svg>
                </button>

                {profileOpen && (
                  <div className="anb-dropdown">
                    <div className="anb-dropdown-header">
                      <span className="anb-dropdown-name">{adminSession?.name}</span>
                      <span className="anb-dropdown-role">{roleName}</span>
                    </div>
                    <hr className="anb-dropdown-hr" />
                    <button className="anb-dropdown-item anb-dropdown-logout" onClick={handleLogout}>
                      <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
                        <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>

              {/* Hamburger — mobile only */}
              <button
                className="anb-hamburger"
                onClick={() => setDrawerOpen(true)}
                aria-label="Open menu"
              >
                <span /><span /><span />
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* ── Overlay ── */}
      <div
        className={`anb-overlay${drawerOpen ? " anb-overlay-show" : ""}`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* ── Slide Drawer (mobile) ── */}
      <aside className={`anb-drawer${drawerOpen ? " anb-drawer-open" : ""}`}>
        <div className="anb-drawer-header">
          <span className="anb-drawer-logo">{drawerTitle}</span>
          <button className="anb-drawer-close" onClick={() => setDrawerOpen(false)}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        <nav className="anb-drawer-nav">
          {navLinks.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `anb-drawer-link${isActive ? " anb-drawer-active" : ""}`
              }
              onClick={() => setDrawerOpen(false)}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <hr className="anb-drawer-divider" />

        <div className="anb-drawer-footer">
          <div className="anb-drawer-user">
            <span className="anb-drawer-avatar">{initials}</span>
            <div>
              <span className="anb-drawer-uname">{adminSession?.name}</span>
              <span className="anb-drawer-urole">{roleName}</span>
            </div>
          </div>
          <button className="anb-drawer-logout" onClick={() => { setDrawerOpen(false); handleLogout(); }}>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
