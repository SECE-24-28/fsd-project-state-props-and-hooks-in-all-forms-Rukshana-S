import React from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";

export default function ProductCard({ product }) {
  const { addToCart, addToWishlist, removeFromWishlist, wishlistItems } = useStore();
  const navigate = useNavigate();
  const isWishlisted = wishlistItems.some(i => i.id === product.id);
  const discount = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);

  const goToProduct = () => { navigate(`/product/${product.id}`); window.scrollTo(0, 0); };

  return (
    <div className="product-card">
      <div className="product-card-image-wrap" onClick={goToProduct}>
        <img src={product.image} alt={product.name} />
        {product.isNew && <span className="product-card-badge">NEW</span>}
        <div className="product-card-quickview">Quick View</div>
      </div>
      <button
        className={`product-card-wishlist${isWishlisted ? " active" : ""}`}
        onClick={() => isWishlisted ? removeFromWishlist(product.id) : addToWishlist(product)}
        aria-label="Wishlist"
      >
        <span className="icon-svg">
          <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        </span>
      </button>
      <div className="product-card-info">
        <p className="product-card-brand">{product.brand}</p>
        <h3 className="product-card-title" onClick={goToProduct} style={{ cursor: "pointer" }}>{product.name}</h3>
        <span className="product-card-rating">⭐ {product.rating}</span>
        <div className="product-card-pricing">
          <span className="product-card-price">₹{product.price.toLocaleString()}</span>
          <span className="product-card-oldprice">₹{product.oldPrice.toLocaleString()}</span>
          <span className="product-card-off">{discount}% off</span>
        </div>
        <button className="product-card-btn" onClick={() => addToCart(product, 1, product.sizes[0])}>
          🛒 Add to Cart
        </button>
      </div>
    </div>
  );
}
