import React, { createContext, useContext, useState, useEffect } from "react";

import wt1 from "../Assets/images/women_tshirt_1.webp";
import wt2 from "../Assets/images/women_tshirt_2.webp";
import wt3 from "../Assets/images/women_tshirt_3.webp";
import wtR from "../Assets/images/women_tshirt_red.webp";
import wtY from "../Assets/images/women_tshirt_yellow.webp";
import wh1 from "../Assets/images/women_hoodie_1.webp";
import wh2 from "../Assets/images/women_hoodie_2.webp";
import wh3 from "../Assets/images/women_hoodie_3.webp";
import whL from "../Assets/images/women_hoodie_lavender.webp";
import whP from "../Assets/images/women_hoodie_pink.webp";
import mh1 from "../Assets/images/men_hoodie_1.webp";
import mh2 from "../Assets/images/men_hoodie_2.webp";
import mh3 from "../Assets/images/men_hoodie_3.webp";
import mhB from "../Assets/images/men_hoodie_brown.webp";
import mhG from "../Assets/images/men_hoodie_green.webp";
import kf1 from "../Assets/images/kids_frock_1.webp";
import kf2 from "../Assets/images/kids_frock_2.webp";
import kf3 from "../Assets/images/kids_frock_3.webp";
import kfL from "../Assets/images/kids_frock_lavender.webp";
import kfW from "../Assets/images/kids_frock_white.webp";
import s1 from "../Assets/images/saree_1.webp";
import s2 from "../Assets/images/saree_2.webp";
import s3 from "../Assets/images/saree_3.webp";
import sB from "../Assets/images/saree_black.webp";
import sV from "../Assets/images/saree_violet.webp";
import k1 from "../Assets/images/kurta_1.webp";
import k2 from "../Assets/images/kurta_2.webp";
import k3 from "../Assets/images/kurta_3.webp";
import kG from "../Assets/images/kurta_green.webp";
import kP from "../Assets/images/kurta_pink.webp";
import kR from "../Assets/images/kurta_red.webp";
import ks1 from "../Assets/images/kids_set_1.webp";
import ks2 from "../Assets/images/kids_set_2.webp";
import ks3 from "../Assets/images/kids_set_3.webp";
import ksP from "../Assets/images/kids_set_pink.webp";
import ksR from "../Assets/images/kids_set_red.webp";

export const PRODUCTS = [
  { id: 5, brand: "Manyavar", name: "Silk Embroidered Saree", price: 4999, oldPrice: 8999, rating: 4.8, category: "ethnic", image: s1, images: [s1, s2, s3], colorVariants: [{ label: "Black", img: sB }, { label: "Violet", img: sV }], description: "Luxurious silk saree with intricate embroidery. A timeless piece for festive occasions and celebrations.", sizes: ["Free Size"], isNew: true },
  { id: 2, brand: "Yousta", name: "Pastel Oversized Hoodie", price: 1899, oldPrice: 3799, rating: 4.7, category: "women", image: wh1, images: [wh1, wh2, wh3], colorVariants: [{ label: "Lavender", img: whL }, { label: "Pink", img: whP }], description: "Cozy oversized hoodie in dreamy pastel shades. Ideal for lounging or casual outings with a luxe feel.", sizes: ["S","M","L","XL","XXL"], isNew: true },
  { id: 4, brand: "Fusion", name: "Party Frill Kids Frock", price: 1499, oldPrice: 2999, rating: 4.6, category: "kids", image: kf1, images: [kf1, kf2, kf3], colorVariants: [{ label: "Lavender", img: kfL }, { label: "White", img: kfW }], description: "Adorable frill frock for little ones. Perfect for parties and special occasions with delicate detailing.", sizes: ["2Y","4Y","6Y","8Y","10Y"], isNew: false },
  { id: 6, brand: "Biba", name: "Floral Cotton Kurta", price: 1599, oldPrice: 2999, rating: 4.4, category: "ethnic", image: k1, images: [k1, k2, k3], colorVariants: [{ label: "Green", img: kG }, { label: "Pink", img: kP }, { label: "Red", img: kR }], description: "Elegant floral cotton kurta with delicate prints. Comfortable for daily ethnic wear and festive gatherings.", sizes: ["XS","S","M","L","XL"], isNew: false },
  { id: 3, brand: "Azorte", name: "Relaxed Cotton Hoodie", price: 1999, oldPrice: 3999, rating: 4.5, category: "men", image: mh1, images: [mh1, mh2, mh3], colorVariants: [{ label: "Brown", img: mhB }, { label: "Green", img: mhG }], description: "Premium relaxed-fit cotton hoodie for men. Crafted for comfort and style with a modern silhouette.", sizes: ["S","M","L","XL","XXL"], isNew: false },
  { id: 7, brand: "Fusion", name: "Kids Ethnic Set", price: 1299, oldPrice: 2499, rating: 4.5, category: "kids", image: ks1, images: [ks1, ks2, ks3], colorVariants: [{ label: "Pink", img: ksP }, { label: "Red", img: ksR }], description: "Charming ethnic set for kids. Perfect for festivals and family gatherings with vibrant colors.", sizes: ["2Y","4Y","6Y","8Y"], isNew: false },
  { id: 1, brand: "Yousta", name: "Soft Cotton Pastel Tee", price: 1299, oldPrice: 2599, rating: 4.6, category: "women", image: wt1, images: [wt1, wt2, wt3], colorVariants: [{ label: "Red", img: wtR }, { label: "Yellow", img: wtY }], description: "A soft, breathable cotton tee in pastel hues. Perfect for everyday wear with a relaxed silhouette and premium finish.", sizes: ["XS","S","M","L","XL"], isNew: true },
];

const StoreContext = createContext();

export function StoreProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("wearly_cart")) || []; } catch { return []; }
  });
  const [wishlistItems, setWishlistItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("wearly_wishlist")) || []; } catch { return []; }
  });
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("wearly_user")) || null; } catch { return null; }
  });

  // Seed demo customer into localStorage.users on first load
  useEffect(() => {
    try {
      const users = JSON.parse(localStorage.getItem("users")) || [];
      const demoExists = users.find(u => u.email === "customer@wearly.com");
      if (!demoExists) {
        users.push({ id: 100, name: "Demo Customer", email: "customer@wearly.com", password: "customer123", phone: "", role: "customer", status: "active" });
        localStorage.setItem("users", JSON.stringify(users));
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { localStorage.setItem("wearly_cart", JSON.stringify(cartItems)); }, [cartItems]);
  useEffect(() => { localStorage.setItem("wearly_wishlist", JSON.stringify(wishlistItems)); }, [wishlistItems]);
  useEffect(() => { localStorage.setItem("wearly_user", JSON.stringify(user)); }, [user]);

  const addToCart = (product, qty = 1, size = "") => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === product.id && i.size === size && i.image === product.image);
      if (existing) return prev.map(i => i.id === product.id && i.size === size && i.image === product.image ? { ...i, qty: i.qty + qty } : i);
      return [...prev, { ...product, qty, size }];
    });
  };

  const removeFromCart = (id, size, image) => setCartItems(prev => prev.filter(i => !(i.id === id && i.size === size && i.image === image)));

  const updateQty = (id, size, image, qty) => {
    if (qty < 1) return removeFromCart(id, size, image);
    setCartItems(prev => prev.map(i => i.id === id && i.size === size && i.image === image ? { ...i, qty } : i));
  };

  const clearCart = () => setCartItems([]);

  const addToWishlist = (product) => {
    setWishlistItems(prev => prev.find(i => i.id === product.id) ? prev : [...prev, product]);
  };

  const removeFromWishlist = (id) => setWishlistItems(prev => prev.filter(i => i.id !== id));

  const login = (userData) => { setUser(userData); localStorage.setItem("wearly_user", JSON.stringify(userData)); };
  const logout = () => { setUser(null); localStorage.removeItem("wearly_user"); };

  const placeOrder = (shippingAddress, paymentMethod, orderItems, totals) => {
    const now = new Date();
    const datePart = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,"0")}${String(now.getDate()).padStart(2,"0")}`;
    const randPart = String(Math.floor(Math.random() * 9000) + 1000);
    const orderId = `WRLY${datePart}${randPart}`;
    const order = { orderId, shippingAddress, paymentMethod, items: orderItems, totals, date: now.toISOString(), status: "Confirmed" };
    const history = JSON.parse(localStorage.getItem("wearly_orderHistory") || "[]");
    history.unshift(order);
    localStorage.setItem("wearly_orderHistory", JSON.stringify(history));
    localStorage.setItem("wearly_lastOrder", JSON.stringify(order));
    localStorage.setItem("wearly_shippingAddress", JSON.stringify(shippingAddress));
    localStorage.setItem("wearly_selectedPayment", paymentMethod);
    clearCart();
    return orderId;
  };

  return (
    <StoreContext.Provider value={{ cartItems, wishlistItems, user, addToCart, removeFromCart, updateQty, clearCart, addToWishlist, removeFromWishlist, login, logout, placeOrder, products: PRODUCTS }}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => useContext(StoreContext);
