import React, { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import ProductCard from "../Components/ProductCard";
import "../Assets/Css/products.css";

const REVIEWS = [
  { name: "Anjali M.", date: "May 12, 2026", stars: 5, comment: "Breathtakingly gorgeous and so soft. Absolutely love the quality!" },
  { name: "Priya S.", date: "Apr 28, 2026", stars: 5, comment: "Perfect fit and the fabric feels premium. Will definitely order again." },
  { name: "Meera R.", date: "Apr 15, 2026", stars: 4, comment: "Beautiful product, delivery was quick. Slightly different shade than the photo but still lovely." },
  { name: "Kavya T.", date: "Mar 30, 2026", stars: 5, comment: "Exceeded my expectations! The color is exactly as shown and the stitching is flawless." },
  { name: "Divya N.", date: "Mar 18, 2026", stars: 5, comment: "Wore it to a family function and got so many compliments. Highly recommend!" },
  { name: "Sneha P.", date: "Feb 22, 2026", stars: 4, comment: "Good quality for the price. Packaging was also very elegant." },
];

const RATING_BARS = [
  { star: 5, pct: 82 }, { star: 4, pct: 12 }, { star: 3, pct: 4 }, { star: 2, pct: 2 }, { star: 1, pct: 0 },
];

const TAB_CONTENT = {
  details: (
    <div className="tab-body">
      <p>A plush oversized hoodie in soft fleece with premium ribbed trims and relaxed streetwear styling.</p>
      <p style={{ marginTop: "14px" }}>Every capsule at WEARLY features elegant soft touch lines, tailored rounded silhouettes, and curated premium elements built to deliver a luxurious fashion experience.</p>
    </div>
  ),
  fabric: (
    <div className="tab-body">
      <ul className="tab-list">
        <li>Premium cotton blend fleece</li>
        <li>Ultra-soft brushed interior</li>
        <li>Machine wash cold</li>
        <li>Do not bleach</li>
        <li>Dry in shade</li>
        <li>Warm iron if needed</li>
      </ul>
    </div>
  ),
  shipping: (
    <div className="tab-body">
      <ul className="tab-list">
        <li>Free delivery above ₹999</li>
        <li>Orders shipped within 24 hours</li>
        <li>Delivery within 3–7 business days</li>
        <li>7-day return and exchange policy</li>
        <li>Easy pickup available in eligible locations</li>
      </ul>
    </div>
  ),
};

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, addToWishlist, removeFromWishlist, wishlistItems } = useStore();
  const reviewsRef = useRef(null);

  const product = products.find(p => p.id === parseInt(id));
  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState(null);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState("details");

  if (!product) return (
    <main id="app-viewport">
      <div className="container" style={{ padding: "60px 0", textAlign: "center" }}>
        <h2>Product not found</h2>
        <button className="btn-primary" style={{ marginTop: "20px" }} onClick={() => navigate("/products")}>Back to Products</button>
      </div>
    </main>
  );

  const isWishlisted = wishlistItems.some(i => i.id === product.id);
  const discount = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
  const colorVariants = product.colorVariants || [];
  const mainImage = selectedColor !== null ? colorVariants[selectedColor].img : product.images[activeImg];

  const handleThumbClick = (i) => { setActiveImg(i); setSelectedColor(null); };
  const handleColorClick = (i) => { setSelectedColor(i); };

  const handleAddToCart = (goToCart) => {
    const cartProduct = selectedColor !== null
      ? { ...product, image: colorVariants[selectedColor].img, colorLabel: colorVariants[selectedColor].label }
      : product;
    addToCart(cartProduct, qty, selectedSize || product.sizes[0]);
    if (goToCart) navigate("/cart");
  };

  const relatedProducts = products.filter(p => p.id !== product.id).slice(0, 4);

  const TABS = [
    { key: "details", label: "Boutique Details" },
    { key: "fabric", label: "Fabric & Wash Care" },
    { key: "shipping", label: "Concierge Shipping & Returns" },
    { key: "reviews", label: "Boutique Reviews (142)" },
  ];

  return (
    <main id="app-viewport">
      <div className="view-container">
        <div className="container">

          {/* Gallery + Info */}
          <div className="details-layout">
            {/* LEFT: Thumbnails + Main Image */}
            <div className="details-gallery">
              <div className="gallery-thumbnails">
                {product.images.map((img, i) => (
                  <div
                    key={i}
                    className={`gallery-thumb${selectedColor === null && activeImg === i ? " active" : ""}`}
                    onClick={() => handleThumbClick(i)}
                  >
                    <img src={img} alt={`${product.name} view ${i + 1}`} />
                  </div>
                ))}
              </div>
              <div className="gallery-main-container">
                <img className="gallery-main-image" src={mainImage} alt={product.name} />
              </div>
            </div>

            {/* RIGHT: Product Info */}
            <div className="details-content">
              <p className="details-brand">{product.brand}</p>
              <h1 className="details-title">{product.name}</h1>

              <div className="details-rating-row">
                <span className="details-rating-badge">⭐ {product.rating}</span>
                <span className="details-reviews-count">142 ratings</span>
              </div>

              <div className="details-pricing">
                <span className="details-price">₹{product.price.toLocaleString()}</span>
                <span className="details-oldprice">₹{product.oldPrice.toLocaleString()}</span>
                <span className="details-off">{discount}% off</span>
              </div>
              <p className="tax-inclusive">✓ Inclusive of all taxes. Free delivery above ₹999.</p>

              <div className="details-options-card">
                {/* Size */}
                <div className="option-group">
                  <div className="option-header">
                    <span className="option-title">Select Size</span>
                    <span className="option-link">Size Guide</span>
                  </div>
                  <div className="option-sizes-row">
                    {product.sizes.map(s => (
                      <button key={s} className={`size-pill${selectedSize === s ? " selected" : ""}`} onClick={() => setSelectedSize(s)}>{s}</button>
                    ))}
                  </div>
                </div>

                {/* Color Variants */}
                {colorVariants.length > 0 && (
                  <div className="option-group">
                    <div className="option-header">
                      <span className="option-title">Color{selectedColor !== null ? `: ${colorVariants[selectedColor].label}` : ""}</span>
                    </div>
                    <div className="color-variants-row">
                      {colorVariants.map((cv, i) => (
                        <div key={i} className={`color-variant-thumb${selectedColor === i ? " active" : ""}`} onClick={() => handleColorClick(i)} title={cv.label}>
                          <img src={cv.img} alt={cv.label} />
                          <span className="color-variant-label">{cv.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="option-group">
                  <div className="option-header"><span className="option-title">Quantity</span></div>
                  <div className="qty-selector">
                    <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                    <span className="qty-value">{qty}</span>
                    <button className="qty-btn" onClick={() => setQty(q => q + 1)}>+</button>
                  </div>
                </div>
              </div>

              <p style={{ fontSize: "0.9rem", color: "var(--text-light)", marginBottom: "20px", lineHeight: "1.7" }}>{product.description}</p>

              <div className="details-actions-grid">
                <button className="btn-primary" onClick={() => handleAddToCart(true)}>🛒 Add to Cart</button>
                <button className="btn-secondary" onClick={() => handleAddToCart(true)}>Buy Now</button>
                <button className={`btn-details-wishlist${isWishlisted ? " active" : ""}`} onClick={() => isWishlisted ? removeFromWishlist(product.id) : addToWishlist(product)}>♥</button>
              </div>
            </div>
          </div>

          {/* Product Info Tabs */}
          <div className="pd-tabs-card">
            <div className="pd-tabs-nav">
              {TABS.map(t => (
                <button
                  key={t.key}
                  className={`pd-tab-btn${activeTab === t.key ? " active" : ""}`}
                  onClick={() => {
                    if (t.key === "reviews") {
                      reviewsRef.current?.scrollIntoView({ behavior: "smooth" });
                    } else {
                      setActiveTab(t.key);
                    }
                  }}
                >{t.label}</button>
              ))}
            </div>
            <div className="pd-tab-content">
              {TAB_CONTENT[activeTab]}
            </div>
          </div>

          {/* Clients Also Purchased */}
          <div className="also-purchased-section">
            <div className="section-header">
              <div className="section-title-wrap">
                <h2 className="section-title">Clients Also Purchased</h2>
                <p className="section-desc">Handpicked by our boutique stylists just for you.</p>
              </div>
            </div>
            <div className="also-purchased-grid">
              {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>

          {/* Reviews Section */}
          <div className="reviews-section" ref={reviewsRef}>
            <h2 className="reviews-section-title">Boutique Reviews (142)</h2>
            <div className="reviews-layout">
              <div className="reviews-summary-card">
                <div className="summary-big-rating">4.8</div>
                <div className="summary-big-stars">★★★★★</div>
                <div className="summary-rating-count">Based on 142 ratings</div>
                <div className="rating-bars-list">
                  {RATING_BARS.map(({ star, pct }) => (
                    <div key={star} className="rating-bar-row">
                      <span className="rating-bar-lbl">{star}★</span>
                      <div className="rating-bar-progress">
                        <div className="rating-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "#6C6C6C", width: "32px" }}>{pct}%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="reviews-list">
                {REVIEWS.map((r, i) => (
                  <div key={i} className="review-item">
                    <div className="review-header">
                      <span className="review-author">{r.name}</span>
                      <span className="review-date">{r.date}</span>
                    </div>
                    <div className="review-stars">{"★".repeat(r.stars)}{"☆".repeat(5 - r.stars)}</div>
                    <p className="review-comment">{r.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
