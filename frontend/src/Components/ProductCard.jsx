import React from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { ShoppingBag } from "lucide-react";

export default function ProductCard({ product, isHomepage }) {
  const { addToCart, addToWishlist, removeFromWishlist, wishlistItems, cartItems, updateQty, removeFromCart } = useStore();
  const navigate = useNavigate();

  const pid       = product._id || product.id;
  const v0img     = product.variants?.[0]?.images?.[0];
  const image     = (typeof v0img === "object" ? v0img?.url : v0img) || "/placeholder-product.png";
  const price     = Number(product.price) || 0;
  const isWishlisted = wishlistItems.some(i => (i.productId?._id || i.productId) === pid);

  const cartItem = cartItems?.find(
    item => (item.productId?._id || item.productId || item._id || item.id) === pid
  );

  const goToProduct = () => { navigate(`/product/${pid}`); window.scrollTo(0, 0); };

  return (
    <div className="product-card">
      <div className="product-card-image-wrap" onClick={goToProduct}>
        {image && <img src={image} alt={product.name} />}
        <div className="product-card-quickview">Quick View</div>
      </div>
      <button
        className={`product-card-wishlist${isWishlisted ? " active" : ""}`}
        onClick={() => isWishlisted
          ? removeFromWishlist(wishlistItems.find(i => (i.productId?._id || i.productId) === pid)?._id)
          : addToWishlist(product)
        }
        aria-label="Wishlist"
      >
        <span className="icon-svg">
          <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        </span>
      </button>
      <div className="product-card-info">
        <p className="product-card-brand">{product.brand}</p>
        <h3 className="product-card-title" onClick={goToProduct} style={{ cursor: "pointer" }}>{product.name}</h3>
        <div className="product-card-pricing">
          <span className="product-card-price">₹{price.toLocaleString()}</span>
        </div>
        {cartItem ? (
          <div className="qty-controls">
            <button
              onClick={(e) => {
                e.stopPropagation();

                if (cartItem.quantity > 1) {
                  updateQty(
                    cartItem._id || cartItem.id,
                    cartItem.quantity - 1
                  );
                } else {
                  removeFromCart(
                    cartItem._id || cartItem.id
                  );
                }
              }}
            >
              −
            </button>

            <span>{cartItem.quantity}</span>

            <button
              onClick={(e) => {
                e.stopPropagation();

                updateQty(
                  cartItem._id || cartItem.id,
                  cartItem.quantity + 1
                );
              }}
            >
              +
            </button>
          </div>
        ) : (
          <button
            className="product-card-btn"
            onClick={(e) => {
              e.stopPropagation();

              addToCart(
                product,
                1,
                (product.sizes || [])[0] || ""
              );
            }}
          >
            <ShoppingBag size={16} /> Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}
