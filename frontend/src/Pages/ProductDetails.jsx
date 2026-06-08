import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { useAuth } from "../context/AuthContext";
import ProductCard from "../Components/ProductCard";
import api from "../services/api";
import { ShoppingBag, CreditCard, Heart, Truck, Star, Package } from "lucide-react";
import "../Assets/Css/products.css";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, addToCart, addToWishlist, removeFromWishlist, wishlistItems } = useStore();
  const { user } = useAuth();
  const reviewsRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState("details");
  const [zoomed, setZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [myRating, setMyRating] = useState(5);
  const [myComment, setMyComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchReviews = () => {
    setReviewsLoading(true);
    api.get(`/reviews/${id}`)
      .then(res => setReviews(res.data.data || []))
      .catch(err => console.error("Error fetching reviews:", err))
      .finally(() => setReviewsLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    setSelectedVariant(0);
    setSelectedImage(0);
    api.get(`/products/${id}`)
      .then(res => {
        setProduct(res.data.data);
        fetchReviews();
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]); // eslint-disable-line

  // Reset image index when variant changes
  useEffect(() => { setSelectedImage(0); }, [selectedVariant]);

  if (loading) return (
    <main id="app-viewport">
      <div className="pd-loading-state">
        <div className="pd-skeleton-gallery" />
        <div className="pd-skeleton-info">
          {[80, 50, 40, 60, 30].map((w, i) => <div key={i} className="pd-skeleton-line" style={{ width: `${w}%` }} />)}
        </div>
      </div>
    </main>
  );

  if (!product) return (
    <main id="app-viewport">
      <div className="container" style={{ padding: "80px 0", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", marginBottom: 16 }}>Product not found</h2>
        <button className="btn-primary" onClick={() => navigate("/products")}>Back to Products</button>
      </div>
    </main>
  );

  // ── Derived state ─────────────────────────────────────────────────────────
  const pid = product._id;
  const variants = (product.variants || []).filter(v => v.images && v.images.length > 0);
  const hasVariants = variants.length > 0;

  const currentVariant = hasVariants ? variants[selectedVariant] : null;
  const images = currentVariant?.images || product.images || [];
  const mainImage = images[selectedImage] || "";

  const isWishlisted = wishlistItems.some(i => (i.productId?._id || i.productId) === pid);
  const wishlistItem = wishlistItems.find(i => (i.productId?._id || i.productId) === pid);
  const relatedProducts = products.filter(p => p._id !== pid && p.category === product.category).slice(0, 4);

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : "0.0";
  const ratingBars = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct: totalReviews > 0 ? Math.round((reviews.filter(r => r.rating === star).length / totalReviews) * 100) : 0,
  }));

  // ── Specifications ─────────────────────────────────────────────────────────
  const specs = product.specifications || {};
  const specRows = [
    { label: "Fabric", key: "fabric" },
    { label: "Pattern", key: "pattern" },
    { label: "Occasion", key: "occasion" },
    { label: "Material", key: "material" },
    { label: "Fit", key: "fit" },
    { label: "Work Type", key: "workType" },
    { label: "Saree Length", key: "sareeLength" },
    { label: "Blouse Piece", key: "blousePiece" },
    { label: "Care Instructions", key: "careInstructions" },
    { label: "Country of Origin", key: "countryOfOrigin" },
  ].filter(r => specs[r.key]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleAddToCart = (buyNow = false) => {
    const colorLabel = currentVariant?.color || "";
    addToCart(product, qty, selectedSize || (product.sizes || [])[0] || "", colorLabel);
    if (buyNow) navigate("/cart");
  };

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - left) / width) * 100);
    const y = Math.round(((e.clientY - top) / height) * 100);
    setZoomPos({ x, y });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) { setReviewError("Please log in to submit a review."); return; }
    if (!myComment.trim()) { setReviewError("Review comment cannot be empty."); return; }
    setSubmittingReview(true);
    setReviewError(""); setReviewSuccess("");
    try {
      await api.post("/reviews", { productId: id, rating: myRating, comment: myComment });
      setReviewSuccess("Review submitted successfully!");
      setMyComment("");
      fetchReviews();
      api.get(`/products/${id}`).then(res => setProduct(res.data.data)).catch(() => { });
    } catch (err) {
      setReviewError(err?.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <main id="app-viewport">
      <div className="view-container">
        <div className="container">

          {/* ── Breadcrumb ── */}
          <div className="pd-breadcrumb">
            <span onClick={() => navigate("/")} className="pd-bread-link">Home</span>
            <span className="pd-bread-sep">/</span>
            <span onClick={() => navigate(`/products?category=${product.category}`)} className="pd-bread-link">
              {product.category ? product.category.charAt(0).toUpperCase() + product.category.slice(1) : "Products"}
            </span>
            <span className="pd-bread-sep">/</span>
            <span className="pd-bread-current">{product.name}</span>
          </div>

          <div className="details-layout">
            {/* Column 1: Vertical Thumbnails (Left) */}
            <div className="gallery-thumbnails">
              {images.map((img, i) => (
                <div
                  key={i}
                  className={`gallery-thumb${selectedImage === i ? " active" : ""}`}
                  onClick={() => setSelectedImage(i)}
                >
                  <img src={img.url || img} alt={img.name || `View ${i + 1}`} />
                </div>
              ))}
            </div>

            {/* Column 2: Main Image (Center) */}
            <div
              className="gallery-main-container"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setZoomed(true)}
              onMouseLeave={() => setZoomed(false)}
            >
              {mainImage ? (
                <img
                  className="gallery-main-image"
                  src={mainImage.url || mainImage}
                  alt={product.name}
                  style={{
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                    transform: zoomed ? "scale(2)" : "scale(1)",
                    transition: zoomed ? "transform 0.1s ease-out" : "transform 0.3s ease-out",
                  }}
                />
              ) : (
                <div className="pd-no-image">No Image</div>
              )}
              {zoomed && (
                <div className="pd-zoom-hint" style={{ opacity: 0 }}>Zoom</div>
              )}
            </div>

            {/* ══ RIGHT: Product Info ════════════════════════════════════════ */}
            <div className="details-content">

              {/* Brand + Name */}
              <p className="details-brand">{product.brand || product.sellerName}</p>
              <h1 className="details-title">{product.name}</h1>

              {/* Rating row */}
              <div className="pd-rating-row">
                <div className="pd-rating-badge">
                  <span>{avgRating}</span>
                  <Star size={14} fill="#fff" color="#fff" />
                </div>
                <span className="pd-rating-count">{totalReviews} Ratings & {totalReviews} Reviews</span>
                <button
                  className="pd-rating-scroll"
                  onClick={() => reviewsRef.current?.scrollIntoView({ behavior: "smooth" })}
                >
                  Read Reviews
                </button>
              </div>

              {/* Price */}
              <div className="pd-price-block">
                <span className="details-price">₹{Number(product.price).toLocaleString("en-IN")}</span>
                <span className="pd-tax-note">Inclusive of all taxes</span>
              </div>
              <div className="pd-free-delivery">Free delivery above ₹999</div>

              {/* Stock */}
              <div className="pd-stock-row">
                {product.stock === 0
                  ? <span className="pd-out-of-stock">Out of Stock</span>
                  : product.stock < 5
                    ? <span className="pd-low-stock">Only {product.stock} left — order soon!</span>
                    : <span className="pd-in-stock">In Stock ({product.stock} available)</span>
                }
              </div>

              {/* ── Color Variant Selector (image cards only, Myntra style) ── */}
              {hasVariants && (
                <div className="pd-section">
                  <div className="pd-section-label">
                    Select Color
                  </div>
                  <div className="pd-variant-cards">
                    {variants.map((v, i) => (
                      <div
                        key={i}
                        className={`pd-variant-card${selectedVariant === i ? " pd-variant-active" : ""}`}
                        onClick={() => {
                          setSelectedVariant(i);
                          setSelectedImage(0);
                        }}
                        title={v.color}
                      >
                        <div className="pd-variant-img-wrap">
                          <img src={v.images[0]?.url || v.images[0]} alt={v.color} />
                        </div>
                        <span className="pd-variant-name">{v.color}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Size Selector ── */}
              {(product.sizes || []).length > 0 && (
                <div className="pd-section">
                  <div className="pd-section-label">
                    Select Size: {selectedSize && <strong>{selectedSize}</strong>}
                  </div>
                  <div className="option-sizes-row">
                    {product.sizes.map(s => (
                      <button
                        key={s}
                        className={`size-pill${selectedSize === s ? " selected" : ""}`}
                        onClick={() => setSelectedSize(s)}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── CTAs ── */}
              <div className="pd-cta-row">
                <button
                  className="pd-cta-cart"
                  disabled={product.stock === 0}
                  onClick={() => handleAddToCart(false)}
                >
                  <ShoppingBag size={18} /> Add To Cart
                </button>
                <button
                  className="pd-cta-buy"
                  disabled={product.stock === 0}
                  onClick={() => handleAddToCart(true)}
                >
                  <CreditCard size={18} /> Buy Now
                </button>
                <button
                  className={`pd-wishlist-btn-icon${isWishlisted ? " pd-wishlist-active" : ""}`}
                  onClick={() => isWishlisted ? removeFromWishlist(wishlistItem?._id) : addToWishlist(product)}
                  title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                >
                  <Heart size={20} fill={isWishlisted ? "#222" : "none"} color="#222" />
                </button>
              </div>

              {/* ── Delivery / Returns ── */}
              <div className="pd-delivery-box">
                <div className="pd-delivery-row">
                  <span className="pd-delivery-icon"><Truck size={20} /></span>
                  <div>
                    <strong>Free Delivery</strong>
                    <p>On orders above ₹999. Delivered in 3–7 business days.</p>
                  </div>
                </div>
                <div className="pd-delivery-row">
                  <span className="pd-delivery-icon"><Package size={20} /></span>
                  <div>
                    <strong>7-Day Easy Returns</strong>
                    <p>Hassle-free return and exchange policy.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Product Images Grid (Horizontal, responsive) ── */}
          {images && images.length > 0 && (
            <div className="pd-image-grid-row" style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(${images.length > 2 ? "250px" : "320px"}, 1fr))`, gap: "20px", marginBottom: "40px" }}>
              {images.map((img, i) => (
                <div key={i} className="pd-grid-image-card" style={{ borderRadius: "14px", overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.04)", border: "1px solid #eee" }}>
                  <img src={img.url || img} alt={img.name || `View ${i + 1}`} style={{ width: "100%", height: "350px", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          )}

          {/* ── Tabs ── */}
          <div className="pd-tabs-card">
            <div className="pd-tabs-nav">
              {[
                { key: "details", label: "Details" },
                { key: "specifications", label: "Specifications" },
                { key: "fabric", label: "Fabric & Care" },
                { key: "shipping", label: "Shipping" },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  className={`pd-tab-btn${activeTab === key ? " active" : ""}`}
                  onClick={() => setActiveTab(key)}
                >
                  {label}
                </button>
              ))}
              <button className="pd-tab-btn" onClick={() => reviewsRef.current?.scrollIntoView({ behavior: "smooth" })}>
                Reviews {totalReviews > 0 && <span className="pd-tab-badge">{totalReviews}</span>}
              </button>
            </div>

            <div className="pd-tab-content">
              {activeTab === "details" && (
                <div className="tab-body">
                  <p>{product.description || "A premium quality product from WEARLY."}</p>
                </div>
              )}

              {activeTab === "specifications" && (
                <div className="tab-body">
                  {specRows.length > 0 ? (
                    <table className="specs-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid #ececec", textAlign: "left" }}>
                          <th style={{ padding: "12px 16px", color: "#666", fontWeight: 600 }}>Specification</th>
                          <th style={{ padding: "12px 16px", color: "#666", fontWeight: 600 }}>Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {specRows.map(({ label, key }) => (
                          <tr key={key} style={{ borderBottom: "1px solid #f5f5f5" }}>
                            <td className="specs-label" style={{ padding: "12px 16px", fontWeight: 500, color: "#222" }}>{label}</td>
                            <td className="specs-value" style={{ padding: "12px 16px", color: "#666" }}>{specs[key]}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="pd-no-specs" style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af" }}>
                      <p>No specifications available.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "fabric" && (
                <div className="tab-body">
                  <ul className="tab-list">
                    <li>{specs.careInstructions || "Machine wash cold, gentle cycle"}</li>
                    <li>Do not bleach</li>
                    <li>Dry in shade — do not tumble dry</li>
                    <li>Iron on low heat</li>
                    <li>Dry clean recommended for embroidered or embellished pieces</li>
                  </ul>
                </div>
              )}

              {activeTab === "shipping" && (
                <div className="tab-body">
                  <ul className="tab-list">
                    <li>Free delivery on orders above ₹999</li>
                    <li>Orders are dispatched within 24 hours of placing</li>
                    <li>Delivery within 3–7 business days across India</li>
                    <li>7-day return and exchange policy from date of delivery</li>
                    <li>Original tags and packaging must be intact for returns</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* ── Related Products ── */}
          {relatedProducts.length > 0 && (
            <div className="also-purchased-section">
              <div className="section-header">
                <div className="section-title-wrap">
                  <h2 className="section-title">You May Also Like</h2>
                </div>
              </div>
              <div className="also-purchased-grid">
                {relatedProducts.map(p => <ProductCard key={p._id} product={p} />)}
              </div>
            </div>
          )}

          {/* ── Reviews Section ── */}
          <div className="reviews-section" ref={reviewsRef}>
            <h2 className="reviews-section-title">Ratings & Reviews</h2>
            <div className="reviews-layout">

              {/* Summary */}
              <div className="reviews-summary-card">
                <div className="summary-big-rating">{avgRating}</div>
                <div className="summary-big-stars" style={{ display: "flex", justifyContent: "center", gap: "2px", color: "#f59e0b", marginBottom: "10px" }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      size={16}
                      fill={star <= Math.round(Number(avgRating)) ? "#f59e0b" : "none"}
                      color={star <= Math.round(Number(avgRating)) ? "#f59e0b" : "#ddd"}
                    />
                  ))}
                </div>
                <div className="summary-rating-count">{totalReviews} Verified Reviews</div>
                <div className="rating-bars-list">
                  {ratingBars.map(({ star, count, pct }) => (
                    <div key={star} className="rating-bar-row">
                      <span className="rating-bar-lbl" style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
                        {star} <Star size={10} fill="#6C6C6C" color="#6C6C6C" />
                      </span>
                      <div className="rating-bar-progress"><div className="rating-bar-fill" style={{ width: `${pct}%` }} /></div>
                      <span style={{ fontSize: "0.75rem", color: "#6C6C6C", width: "28px", textAlign: "right" }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews list + form */}
              <div className="reviews-list-col" style={{ flex: 1 }}>
                {/* Submit Review */}
                {user ? (
                  <form onSubmit={handleReviewSubmit} className="pd-review-form">
                    <h4 style={{ margin: "0 0 14px", fontSize: "1rem", fontWeight: 700 }}>Write a Review</h4>
                    <div className="pd-star-picker">
                      <span style={{ fontSize: "0.88rem", color: "#666" }}>Your Rating:</span>
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          size={20}
                          onClick={() => setMyRating(star)}
                          fill={star <= myRating ? "#f59e0b" : "none"}
                          color={star <= myRating ? "#f59e0b" : "#ddd"}
                          style={{ cursor: "pointer" }}
                        />
                      ))}
                    </div>
                    <textarea
                      rows={3}
                      placeholder="Share your experience with this product..."
                      value={myComment}
                      onChange={e => setMyComment(e.target.value)}
                      style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid #e9d5d6", fontSize: "0.9rem", resize: "vertical", fontFamily: "inherit" }}
                    />
                    {reviewError && <p style={{ color: "#DC2626", fontSize: "0.85rem", margin: "6px 0 0" }}>{reviewError}</p>}
                    {reviewSuccess && <p style={{ color: "#059669", fontSize: "0.85rem", margin: "6px 0 0" }}>{reviewSuccess}</p>}
                    <button type="submit" className="btn-primary" disabled={submittingReview} style={{ marginTop: "12px", padding: "10px 24px" }}>
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </button>
                  </form>
                ) : (
                  <div className="pd-review-login-prompt">
                    <p>Please <span onClick={() => navigate("/login")} style={{ fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>log in</span> to write a review.</p>
                  </div>
                )}

                {/* Reviews */}
                <div className="reviews-list">
                  {reviewsLoading ? (
                    <p style={{ color: "#aaa" }}>Loading reviews...</p>
                  ) : reviews.length > 0 ? (
                    reviews.map((r, i) => (
                      <div key={i} className="review-item">
                        <div className="review-header">
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div className="pd-reviewer-avatar">{(r.userName || "?")[0].toUpperCase()}</div>
                            <div>
                              <span className="review-author">{r.userName}</span>
                              <div className="review-stars" style={{ display: "flex", gap: "2px", marginTop: "4px" }}>
                                {[1, 2, 3, 4, 5].map(star => (
                                  <Star
                                    key={star}
                                    size={14}
                                    fill={star <= r.rating ? "#f59e0b" : "none"}
                                    color={star <= r.rating ? "#f59e0b" : "#ddd"}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="review-date">{new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                        </div>
                        <p className="review-comment">{r.comment}</p>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: "#999", fontSize: "0.9rem" }}>No reviews yet. Be the first!</p>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
