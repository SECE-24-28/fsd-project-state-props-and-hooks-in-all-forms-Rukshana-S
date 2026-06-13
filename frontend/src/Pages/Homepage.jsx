import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Assets/Css/homepage.css";
import ProductCard from "../Components/ProductCard";
import Newsletter from "../Components/Newsletter";
import FAQ from "../Components/FAQ";
import { useStore } from "../context/StoreContext";
import api from "../services/api";
import { Link } from "react-router-dom";

import bannerImg from "../Assets/images/banner.jpg";
import c1 from "../Assets/images/collection1.jpg";
import c2 from "../Assets/images/collection2.jpg";
import c3 from "../Assets/images/collection3.jpg";
import c4 from "../Assets/images/collection4.jpg";
import c5 from "../Assets/images/collection5.jpg";
import c6 from "../Assets/images/collection6.jpg";
import c7 from "../Assets/images/collection7.jpg";
import c8 from "../Assets/images/collection8.jpg";

const topTrends = [
  { img: c1, cat: "Women", title: "Pastel Tees", discount: "50% OFF" },
  { img: c2, cat: "Men", title: "Linen Shirts", discount: "40% OFF" },
  { img: c3, cat: "Kids", title: "Frocks & Sets", discount: "45% OFF" },
  { img: c4, cat: "All", title: "Street Style", discount: "35% OFF" },
];

const ethnicWear = [
  { img: c5, cat: "Ethnic", title: "Silk Sarees", discount: "60% OFF" },
  { img: c6, cat: "Ethnic", title: "Kurta Sets", discount: "50% OFF" },
  { img: c7, cat: "Ethnic", title: "Lehenga Choli", discount: "55% OFF" },
  { img: c8, cat: "Ethnic", title: "Anarkali Suits", discount: "45% OFF" },
];

export default function Homepage() {
  const navigate = useNavigate();
  const { products } = useStore();
  const [brands, setBrands] = useState([]);

  const bestSellers = [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);

  useEffect(() => {
    // Fetch real brand profiles from MongoDB
    api.get("/users/brands")
      .then(res => setBrands((res.data.data || []).slice(0, 6)))
      .catch(() => setBrands([]));
  }, []);

  const goTo = (path) => { navigate(path); window.scrollTo(0, 0); };

  return (
    <main id="app-viewport">
      <div className="view-container">

        {/* ── HERO ── */}
        <section className="hero-section container">
          <div className="hero-banner">
            <div className="hero-content">
              <span className="hero-new-badge">New Arrivals</span>
              <span className="hero-subtitle">WEARLY Luxury Edit</span>
              <h1 className="hero-title">Change Your Wardrobe.<br />Find Exciting Styles.</h1>
              <div className="hero-search-wrapper">
                <input type="text" placeholder="Search silk sarees, linen kurtas, streetwear..." />
                <button className="icon-button" aria-label="Search">
                  <span className="icon-svg">
                    <svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l4.25 4.25 1.49-1.49L15.5 14zM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" /></svg>
                  </span>
                </button>
              </div>
              <div className="hero-ctas">
                {[["Women", "Shop Women"], ["Men", "Shop Men"], ["Kids", "Shop Kids"], ["Ethnic Wear", "Ethnic Wear"]].map(([cat, label]) => (
                  <button key={cat} className="hero-cta-btn" onClick={() => goTo(`/products?category=${encodeURIComponent(cat)}`)}>{label}</button>
                ))}
              </div>
              <div className="hero-action-row">
                <button className="btn-primary" onClick={() => goTo("/products")}>Explore Collection</button>
                <button className="btn-secondary" onClick={() => goTo("/products")}>Shop Now</button>
              </div>
            </div>

            <div className="hero-image-card">
              <div className="hero-image-inner">
                <img src={bannerImg} alt="WEARLY Luxury Fashion" />
              </div>
              <div className="hero-float-badge">Luxury Collection</div>
            </div>
          </div>
        </section>

        {/* ── TOP TRENDS ── */}
        <section className="container" style={{ marginBottom: "70px" }}>
          <div className="section-header">
            <div className="section-title-wrap">
              <h2 className="section-title">Top Trends</h2>
              <p className="section-desc">The most-loved styles of the season, curated for you.</p>
            </div>
            <button className="btn-primary" onClick={() => goTo("/products")}>View All</button>
          </div>
          <div className="trends-grid">
            {topTrends.map((t, i) => (
              <div key={i} className="trend-card" onClick={() => goTo("/products")}>
                <img src={t.img} alt={t.title} />
                <div className="trend-overlay">
                  <span className="trend-cat">{t.cat}</span>
                  <h3 className="trend-title">{t.title}</h3>
                  <span className="discount-badge">{t.discount}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── ETHNIC WEAR ── */}
        <section className="container" style={{ marginBottom: "70px" }}>
          <div className="section-header">
            <div className="section-title-wrap">
              <h2 className="section-title">Ethnic Wear Special</h2>
              <p className="section-desc">Celebrate tradition with our handpicked ethnic collection.</p>
            </div>
            <button className="btn-primary" onClick={() => goTo("/products")}>Shop Ethnic</button>
          </div>
          <div className="ethnic-grid">
            {ethnicWear.map((e, i) => (
              <div key={i} className="ethnic-card" onClick={() => goTo("/products")}>
                <img src={e.img} alt={e.title} />
                <div className="ethnic-overlay">
                  <span className="ethnic-cat">{e.cat}</span>
                  <h3 className="ethnic-title">{e.title}</h3>
                  <span className="discount-badge">{e.discount}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── BRANDS (dynamic from /api/users/brands) ── */}
        {brands.length > 0 && (
          <section className="container" style={{ marginBottom: "70px" }}>
            <div className="section-header">
              <div className="section-title-wrap">
                <h2 className="section-title">Featured Brand Partners</h2>
                <p className="section-desc">Discover India's most loved fashion labels on WEARLY.</p>
              </div>
              <button className="btn-primary" onClick={() => goTo("/brands")}>View All Brands</button>
            </div>
            <div className="brands-grid">
              {brands.map((b, i) => {
                const displayName = b.brandName || b.storeName || b.name || (i === 0 ? "Avaasa" : i === 1 ? "Zara" : "Brand");
                return (
                <div key={b._id || i} className="brand-card" onClick={() => goTo(`/products?brand=${encodeURIComponent(displayName)}`)}>
                  <div className="brand-logo-container">
                    {b.brandLogo
                      ? <img src={b.brandLogo} alt={displayName} style={{ width: "100%", height: "100%", objectFit: "contain", padding: "8px", borderRadius: "inherit" }} />
                      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", fontWeight: 700, color: "#b89aa0", background: "#fdf0f2", borderRadius: "inherit" }}>{(displayName || "?")[0]}</div>
                    }
                  </div>
                  <h3 className="brand-name">{displayName}</h3>
                  <p className="brand-desc">{b.brandDescription || "Premium fashion label on WEARLY"}</p>
                </div>
              )})}
            </div>
          </section>
        )}

        {/* ── BEST SELLERS ── */}
        <section className="container" style={{ marginBottom: "70px" }}>
          <div className="section-header">
            <div className="section-title-wrap">
              <h2 className="section-title">WEARLY Best Sellers</h2>
              <p className="section-desc">Feminine luxury drapes favored most by our boutique clientele.</p>
            </div>
            <button className="btn-primary" onClick={() => goTo("/products")}>Shop Entire Collection</button>
          </div>
          <div className="products-grid">
            {bestSellers.length === 0
              ? <p style={{ color: "#aaa", padding: "20px 0" }}>No products yet. Check back soon!</p>
              : bestSellers.map(p => <ProductCard key={p._id} product={p} isHomepage={true} />)
            }
          </div>
        </section>

        {/* ── MEGA SALE BANNER ── */}
        <section className="offer-banner-section container">
          <div className="offer-banner">
            <div className="offer-banner-content">
              <span className="hero-subtitle" style={{ color: "var(--text-light)" }}>Limited Time Boutique Sale</span>
              <h2 className="offer-banner-title">Mega Fashion Sale — Up to 70% OFF</h2>
              <p className="offer-banner-subtitle">Upgrade your luxury collection with beautiful blush tones, linen shirts, and ornate silk drapes at exclusive prices.</p>
              <button className="btn-primary" onClick={() => goTo("/spin-wheel")}>Unlock Secret Offer</button>
            </div>
            <div className="hero-image-card" style={{ maxWidth: "380px", width: "100%" }}>
              <div className="hero-image-inner" style={{ height: "260px" }}>
                <img src={c7} alt="Fashion Sale" />
              </div>
            </div>
          </div>
        </section>

        <Newsletter />
        <FAQ />
      </div>
    </main>
  );
}
