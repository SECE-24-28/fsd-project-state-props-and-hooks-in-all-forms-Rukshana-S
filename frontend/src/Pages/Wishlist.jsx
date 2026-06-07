import React from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { useAuth } from "../context/AuthContext";
import { ShoppingBag } from "lucide-react";
import "../Assets/Css/wishlist.css";

export default function Wishlist() {
  const { wishlistItems, removeFromWishlist, addToCart, wishlistLoading } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return (
    <main id="app-viewport"><div className="view-container"><div className="container">
      <div className="wishlist-empty" style={{ textAlign: "center", padding: "60px 0" }}>
        <h3>Please log in to view your wishlist</h3>
        <button className="btn-primary" style={{ marginTop: "16px" }} onClick={() => navigate("/login")}>Login</button>
      </div>
    </div></div></main>
  );

  if (wishlistLoading) return (
    <main id="app-viewport"><div className="view-container"><div className="container">
      <div className="wishlist-empty" style={{ textAlign: "center", padding: "60px 0" }}><p>Loading wishlist...</p></div>
    </div></div></main>
  );

  if (wishlistItems.length === 0) return (
    <main id="app-viewport">
      <div className="view-container"><div className="container"><div className="wishlist-layout">
        <div className="wishlist-empty">
          <div className="wishlist-empty-icon">♥</div>
          <h3>Your wishlist is empty</h3>
          <p>Save your favourite pieces here and come back to them anytime.</p>
          <button className="btn-primary" onClick={() => navigate("/products")}>Explore Collection</button>
        </div>
      </div></div></div>
    </main>
  );

  return (
    <main id="app-viewport">
      <div className="view-container"><div className="container"><div className="wishlist-layout">
        <h2 className="wishlist-title">My Wishlist ({wishlistItems.length})</h2>
        <div className="wishlist-grid">
          {wishlistItems.map(item => {
            const pid   = item.productId?._id || item.productId;
            const image = item.image || (item.productId?.images || [])[0] || "";
            const price = Number(item.price) || 0;
            return (
              <div key={item._id} className="wishlist-card premium-card">
                <div className="product-card-image-wrap" onClick={() => navigate(`/product/${pid}`)}>
                  {image && <img src={image} alt={item.name} />}
                  <div className="product-card-quickview">Quick View</div>
                </div>
                <button className="btn-wishlist-remove" onClick={() => removeFromWishlist(item._id)}>✕</button>
                <div className="product-card-info">
                  <p className="product-card-brand">{item.brand}</p>
                  <h3 className="product-card-title">{item.name}</h3>
                  <div className="product-card-pricing">
                    <span className="product-card-price">₹{price.toLocaleString()}</span>
                  </div>
                  <button className="product-card-btn" onClick={async () => {
                    await addToCart({ _id: pid, name: item.name, price: item.price, image }, 1, "");
                    await removeFromWishlist(item._id);
                    navigate("/cart");
                  }} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                    <ShoppingBag size={16} /> Move to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div></div></div>
    </main>
  );
}
