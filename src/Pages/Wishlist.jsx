import React from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import "../Assets/Css/wishlist.css";

export default function Wishlist() {
  const { wishlistItems, removeFromWishlist, addToCart } = useStore();
  const navigate = useNavigate();

  if (wishlistItems.length === 0) return (
    <main id="app-viewport">
      <div className="view-container">
        <div className="container">
          <div className="wishlist-layout">
            <div className="wishlist-empty">
              <div className="wishlist-empty-icon">♥</div>
              <h3>Your wishlist is empty</h3>
              <p>Save your favourite pieces here and come back to them anytime.</p>
              <button className="btn-primary" onClick={() => navigate("/products")}>Explore Collection</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );

  return (
    <main id="app-viewport">
      <div className="view-container">
        <div className="container">
          <div className="wishlist-layout">
            <h2 className="wishlist-title">My Wishlist ({wishlistItems.length})</h2>
            <div className="wishlist-grid">
              {wishlistItems.map(item => {
                const discount = Math.round(((item.oldPrice - item.price) / item.oldPrice) * 100);
                return (
                  <div key={item.id} className="wishlist-card premium-card">
                    <div className="product-card-image-wrap" onClick={() => navigate(`/product/${item.id}`)}>
                      <img src={item.image} alt={item.name} />
                      <div className="product-card-quickview">Quick View</div>
                    </div>
                    <button className="btn-wishlist-remove" onClick={() => removeFromWishlist(item.id)}>✕</button>
                    <div className="product-card-info">
                      <p className="product-card-brand">{item.brand}</p>
                      <h3 className="product-card-title">{item.name}</h3>
                      <span className="product-card-rating">⭐ {item.rating}</span>
                      <div className="product-card-pricing">
                        <span className="product-card-price">₹{item.price.toLocaleString()}</span>
                        <span className="product-card-oldprice">₹{item.oldPrice.toLocaleString()}</span>
                        <span className="product-card-off">{discount}% off</span>
                      </div>
                      <button className="product-card-btn" onClick={() => { addToCart(item, 1, item.sizes?.[0] || ""); removeFromWishlist(item.id); navigate("/cart"); }}>
                        🛒 Move to Cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
