import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../Assets/Css/homepage.css";

export default function Brands() {
  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    api
      .get("/users/brands")
      .then((res) => setBrands(res.data.data || []))
      .catch(() => setBrands([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = brands.filter((b) =>
    (b.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (b.brandName || "").toLowerCase().includes(search.toLowerCase()) ||
    (b.storeName || "").toLowerCase().includes(search.toLowerCase()) ||
    (b.brandDescription || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main id="app-viewport">
      <div className="view-container">
        <div className="container">
          {/* ── Page Header ── */}
          <div className="brands-page-hero">
            <span className="hero-new-badge">Marketplace</span>
            <h1 className="brands-page-title">Our Brand Partners</h1>
            <p className="brands-page-subtitle">
              Discover India's finest fashion labels — all curated, verified and
              exclusive to WEARLY.
            </p>
            <div className="brands-search-bar">
              <svg viewBox="0 0 24 24" className="brands-search-icon">
                <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l4.25 4.25 1.49-1.49L15.5 14zM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
              <input
                type="text"
                placeholder="Search brands..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* ── Stats Bar ── */}
          <div className="brands-stats-bar">
            <div className="brands-stat">
              <span className="brands-stat-value">{brands.length}</span>
              <span className="brands-stat-label">Active Brands</span>
            </div>
            <div className="brands-stat-divider" />
            <div className="brands-stat">
              <span className="brands-stat-value">100%</span>
              <span className="brands-stat-label">Verified Sellers</span>
            </div>
            <div className="brands-stat-divider" />
            <div className="brands-stat">
              <span className="brands-stat-value">Pan India</span>
              <span className="brands-stat-label">Delivery</span>
            </div>
          </div>

          {/* ── Grid ── */}
          {loading ? (
            <div className="brands-loading">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="brand-card-skeleton" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#888" }}>
              <p style={{ fontSize: "1.1rem" }}>
                {search ? `No brands matching "${search}"` : "No brands available yet."}
              </p>
              {search && (
                <button className="btn-primary" style={{ marginTop: "16px" }} onClick={() => setSearch("")}>
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="brands-page-grid">
              {filtered.map((brand, i) => {
                const displayName = brand.brandName || brand.storeName || brand.name || (i === 0 ? "Avaasa" : i === 1 ? "Zara" : "Brand");
                const displayLogo = brand.brandLogo || "";
                const displayDesc = brand.brandDescription || "Premium clothing brand.";
                return (
                  <div
                    key={brand._id || i}
                    className="brand-showcase-card"
                    onClick={() =>
                      navigate(`/products?brand=${encodeURIComponent(displayName)}`)
                    }
                  >
                    {/* Logo area */}
                    <div className="brand-showcase-logo">
                      {displayLogo ? (
                        <img src={displayLogo} alt={displayName} />
                      ) : (
                        <div className="brand-logo-initial">
                          {displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="brand-showcase-content">
                      <h3 className="brand-showcase-name">{displayName}</h3>
                      {displayDesc && (
                        <p className="brand-showcase-desc">{displayDesc}</p>
                      )}
                      <div className="brand-showcase-footer">
                        <span className="brand-showcase-badge">✓ Verified</span>
                        <span className="brand-showcase-cta">Shop Now →</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
