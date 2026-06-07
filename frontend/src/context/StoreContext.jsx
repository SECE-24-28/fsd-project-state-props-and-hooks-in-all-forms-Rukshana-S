import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { toast } from "react-toastify";

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const [products, setProducts]       = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const [cartItems, setCartItems]     = useState([]);   // local shape: { _id, productId, name, price, image, size, color, quantity }
  const [cartLoading, setCartLoading] = useState(false);

  const [wishlistItems, setWishlistItems]     = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const isLoggedIn = () => !!localStorage.getItem("wearly_token");

  // ── Products ──────────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async (params = {}) => {
    setProductsLoading(true);
    try {
      const res = await api.get("/products", { params: { ...params, status: "active" } });
      setProducts(res.data.data || []);
    } catch (err) {
      console.error("[StoreContext] fetchProducts:", err?.response?.data?.message || err.message);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ── Cart ──────────────────────────────────────────────────────────────────
  const fetchCart = useCallback(async () => {
    if (!isLoggedIn()) { setCartItems([]); return; }
    setCartLoading(true);
    try {
      const res = await api.get("/cart");
      setCartItems(res.data.data?.products || []);
    } catch {
      setCartItems([]);
    } finally {
      setCartLoading(false);
    }
  }, []);

  // ── Wishlist ──────────────────────────────────────────────────────────────
  const fetchWishlist = useCallback(async () => {
    if (!isLoggedIn()) { setWishlistItems([]); return; }
    setWishlistLoading(true);
    try {
      const res = await api.get("/wishlist");
      setWishlistItems(res.data.data?.products || []);
    } catch {
      setWishlistItems([]);
    } finally {
      setWishlistLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
    fetchWishlist();
  }, [fetchCart, fetchWishlist]);

  // ── Cart actions ──────────────────────────────────────────────────────────
  const addToCart = async (product, qty = 1, size = "", colorLabel = "") => {
    if (!isLoggedIn()) return;
    try {
      let chosenImage = "";
      if (colorLabel && product.variants) {
        const matchingVariant = product.variants.find(v => v.color === colorLabel);
        if (matchingVariant && matchingVariant.images && matchingVariant.images.length > 0) {
          const imgObj = matchingVariant.images[0];
          chosenImage = typeof imgObj === "object" ? (imgObj.url || "") : imgObj;
        }
      }
      if (!chosenImage) {
        const mainImg = product.image || (product.variants?.[0]?.images?.[0]) || (product.images || [])[0] || "";
        chosenImage = typeof mainImg === "object" ? (mainImg.url || "") : mainImg;
      }

      await api.post("/cart", {
        productId: product._id || product.id,
        name:      product.name,
        price:     product.price,
        image:     chosenImage,
        size:      size || "",
        color:     colorLabel || "",
        quantity:  qty,
      });
      await fetchCart();
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      console.error("[StoreContext] addToCart:", err?.response?.data?.message || err.message);
      toast.error(err?.response?.data?.message || "Failed to add to cart");
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await api.delete(`/cart/${itemId}`);
      setCartItems(prev => prev.filter(i => i._id !== itemId));
      toast.info("Item removed from cart");
    } catch (err) {
      console.error("[StoreContext] removeFromCart:", err?.response?.data?.message || err.message);
      toast.error("Failed to remove item from cart");
    }
  };

  const updateQty = async (itemId, qty) => {
    if (qty < 1) { removeFromCart(itemId); return; }
    try {
      await api.put(`/cart/${itemId}`, { quantity: qty });
      setCartItems(prev => prev.map(i => i._id === itemId ? { ...i, quantity: qty } : i));
    } catch (err) {
      console.error("[StoreContext] updateQty:", err?.response?.data?.message || err.message);
    }
  };

  const clearCart = async () => {
    if (!isLoggedIn()) return;
    try {
      await api.delete("/cart/clear");
      setCartItems([]);
    } catch (err) {
      console.error("[StoreContext] clearCart error:", err.message);
    }
  };

  // ── Wishlist actions ──────────────────────────────────────────────────────
  const addToWishlist = async (product) => {
    if (!isLoggedIn()) return;
    try {
      const mainImg = product.image || (product.variants?.[0]?.images?.[0]) || (product.images || [])[0] || "";
      const chosenImage = typeof mainImg === "object" ? (mainImg.url || "") : mainImg;
      await api.post("/wishlist", {
        productId: product._id || product.id,
        name:      product.name,
        price:     product.price,
        image:     chosenImage,
        brand:     product.brand || "",
      });
      await fetchWishlist();
      toast.success(`${product.name} added to wishlist!`);
    } catch (err) {
      if (err?.response?.status !== 409) {
        console.error("[StoreContext] addToWishlist:", err?.response?.data?.message || err.message);
        toast.error(err?.response?.data?.message || "Failed to add to wishlist");
      } else {
        toast.info("Item already in wishlist");
      }
    }
  };

  const removeFromWishlist = async (itemId) => {
    try {
      await api.delete(`/wishlist/${itemId}`);
      setWishlistItems(prev => prev.filter(i => i._id !== itemId));
      toast.info("Item removed from wishlist");
    } catch (err) {
      console.error("[StoreContext] removeFromWishlist:", err?.response?.data?.message || err.message);
      toast.error("Failed to remove from wishlist");
    }
  };

  // ── Order ─────────────────────────────────────────────────────────────────
  const placeOrder = async (address, paymentMethod, orderItems, totals) => {
    const products = orderItems.map(i => ({
      productId: i._id || i.id || i.productId,
      name:      i.name,
      price:     i.price,
      quantity:  i.quantity || i.qty || 1,
      image:     i.image || "",
      size:      i.size || "",
      color:     i.color || i.colorLabel || "",
    }));
    const res = await api.post("/orders", {
      products,
      amount: totals.total || totals.grandTotal || totals,
      address,
      paymentMethod: paymentMethod || "cod",
    });
    await clearCart();
    return res.data.data._id;
  };

  // ── Reload on auth change (called by AuthContext after login/logout) ──────
  const reloadUserData = useCallback(() => {
    fetchCart();
    fetchWishlist();
  }, [fetchCart, fetchWishlist]);

  const cartCount    = cartItems.reduce((s, i) => s + (i.quantity || 1), 0);
  const wishlistCount = wishlistItems.length;

  return (
    <StoreContext.Provider value={{
      products, productsLoading, fetchProducts,
      cartItems, cartLoading, addToCart, removeFromCart, updateQty, clearCart,
      wishlistItems, wishlistLoading, addToWishlist, removeFromWishlist,
      placeOrder, reloadUserData,
      cartCount, wishlistCount,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
