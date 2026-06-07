const mongoose = require("mongoose");
const Cart = require("../Models/CartModel");

// POST /api/cart — add or update item
const addToCart = async (req, res) => {
  try {
    const { productId, name, price, image, selectedImage, size, color, selectedColor, quantity } = req.body;
    if (!productId) return res.status(400).json({ success: false, message: "productId is required" });
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }

    const finalColor = selectedColor || color || "";
    const finalImage = selectedImage || image || "";

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = await Cart.create({
        userId: req.user.id,
        products: [{ 
          productId, 
          name, 
          price, 
          image: finalImage, 
          selectedImage: finalImage,
          size: size || "", 
          color: finalColor, 
          selectedColor: finalColor,
          quantity: quantity || 1 
        }],
      });
      return res.status(201).json({ success: true, message: "Cart created", data: cart });
    }

    const idx = cart.products.findIndex(
      p => p.productId && p.productId.toString() === productId && p.size === (size || "") && (p.selectedColor || p.color || "") === finalColor
    );
    if (idx > -1) {
      cart.products[idx].quantity += (quantity || 1);
    } else {
      cart.products.push({ 
        productId, 
        name, 
        price, 
        image: finalImage, 
        selectedImage: finalImage,
        size: size || "", 
        color: finalColor, 
        selectedColor: finalColor,
        quantity: quantity || 1 
      });
    }
    await cart.save();
    res.status(200).json({ success: true, message: "Cart updated", data: cart });
  } catch (err) {
    console.error("[CartController] addToCart:", err.message);
    res.status(500).json({ success: false, message: "Error updating cart", error: err.message });
  }
};

// GET /api/cart
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id })
      .populate("products.productId", "name price variants status");
    if (!cart) return res.status(200).json({ success: true, data: { products: [] } });

    // Filter out products that no longer exist in db to prevent frontend crashes
    const initialLen = cart.products.length;
    cart.products = cart.products.filter(p => p.productId !== null);
    if (cart.products.length !== initialLen) {
      await cart.save();
    }

    res.status(200).json({ success: true, data: cart });
  } catch (err) {
    console.error("[CartController] getCart:", err.message);
    res.status(500).json({ success: false, message: "Error fetching cart", error: err.message });
  }
};

// PUT /api/cart/:id — update quantity by item _id
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    if (quantity === undefined || quantity < 1) return res.status(400).json({ success: false, message: "quantity must be >= 1" });
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid cart item ID format" });
    }

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });
    const item = cart.products.id(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Item not found in cart" });
    item.quantity = quantity;
    await cart.save();
    res.status(200).json({ success: true, message: "Cart item updated", data: cart });
  } catch (err) {
    console.error("[CartController] updateCartItem:", err.message);
    res.status(500).json({ success: false, message: "Error updating cart item", error: err.message });
  }
};

// DELETE /api/cart/:id — remove item by item _id
const removeFromCart = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid cart item ID format" });
    }

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });
    cart.products = cart.products.filter(p => p._id.toString() !== req.params.id);
    await cart.save();
    res.status(200).json({ success: true, message: "Item removed from cart", data: cart });
  } catch (err) {
    console.error("[CartController] removeFromCart:", err.message);
    res.status(500).json({ success: false, message: "Error removing item", error: err.message });
  }
};

const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (cart) {
      cart.products = [];
      await cart.save();
    }
    res.status(200).json({ success: true, message: "Cart cleared" });
  } catch (err) {
    console.error("[CartController] clearCart:", err.message);
    res.status(500).json({ success: false, message: "Error clearing cart", error: err.message });
  }
};

module.exports = { addToCart, getCart, updateCartItem, removeFromCart, clearCart };
