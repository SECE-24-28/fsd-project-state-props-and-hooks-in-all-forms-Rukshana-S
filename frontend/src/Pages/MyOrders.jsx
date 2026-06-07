import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useStore } from "../context/StoreContext";
import OrderStatusBadge from "../Components/OrderStatusBadge";
import "../Assets/Css/cart.css";

export default function MyOrders() {
  const navigate = useNavigate();
  const { addToCart } = useStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    api.get("/orders")
      .then(res => setOrders(res.data.data || []))
      .catch(err => console.error("Error loading customer orders:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await api.put(`/orders/${orderId}`, { orderStatus: "Cancelled" });
      alert("Order cancelled successfully.");
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel order.");
    }
  };

  const handleReorder = async (order) => {
    try {
      for (const item of order.products) {
        // Find product details
        const prodRes = await api.get(`/products/${item.productId}`);
        const product = prodRes.data.data;
        await addToCart(product, item.quantity, item.size, item.color);
      }
      alert("Items added to cart. Redirecting to Cart...");
      navigate("/cart");
    } catch (err) {
      alert("Failed to add all items to cart for reordering.");
    }
  };

  if (loading) {
    return (
      <main id="app-viewport">
        <div className="container" style={{ padding: "80px 0", textAlign: "center" }}>
          <p>Loading your orders...</p>
        </div>
      </main>
    );
  }

  return (
    <main id="app-viewport">
      <div className="view-container">
        <div className="container" style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 16px" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "24px" }}>My Orders</h1>

          {orders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", background: "#fff", borderRadius: "16px", border: "1px dashed #ccc" }}>
              <p style={{ color: "#666", marginBottom: "16px" }}>You haven't placed any orders yet.</p>
              <button className="btn-primary" onClick={() => navigate("/products")}>Start Shopping</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {orders.map((order) => (
                <div key={order._id} className="co-card" style={{ padding: "24px", border: "1px solid #eee", borderRadius: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", borderBottom: "1px solid #f5f5f5", paddingBottom: "12px", marginBottom: "16px" }}>
                    <div>
                      <span style={{ fontSize: "0.8rem", color: "#666" }}>ORDER PLACED</span>
                      <p style={{ margin: "2px 0 0 0", fontWeight: 600, fontSize: "0.9rem" }}>
                        {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.8rem", color: "#666" }}>TOTAL</span>
                      <p style={{ margin: "2px 0 0 0", fontWeight: 600, fontSize: "0.9rem" }}>₹{order.amount?.toLocaleString()}</p>
                    </div>
                    <div>
                      <span style={{ fontSize: "0.8rem", color: "#666" }}>ORDER ID</span>
                      <p style={{ margin: "2px 0 0 0", fontWeight: 600, fontSize: "0.9rem", color: "#111" }}>{order._id}</p>
                    </div>
                    <div>
                      <OrderStatusBadge status={order.orderStatus} />
                    </div>
                  </div>

                  {/* Products list inside order */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {order.products?.map((item, idx) => (
                      <div key={idx} style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                        <img src={item.image || "/placeholder-product.png"} alt={item.name} style={{ width: "70px", height: "90px", objectFit: "cover", borderRadius: "8px", border: "1px solid #eee" }} />
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: "0.95rem" }}>{item.name}</p>
                          <p style={{ margin: "4px 0 0 0", color: "#666", fontSize: "0.85rem" }}>
                            Size: {item.size || "Free Size"} {item.color && ` · Color: ${item.color}`} {` · Qty: ${item.quantity}`}
                          </p>
                          <p style={{ margin: "4px 0 0 0", fontWeight: 500, fontSize: "0.9rem" }}>₹{(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "20px", borderTop: "1px solid #f5f5f5", paddingTop: "16px" }}>
                    <button className="btn-primary" style={{ padding: "8px 16px", fontSize: "0.85rem" }} onClick={() => navigate(`/orders/${order._id}`)}>
                      Track Order
                    </button>
                    <button className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.85rem" }} onClick={() => handleReorder(order)}>
                      Reorder
                    </button>
                    {["Pending", "Confirmed", "Processing"].includes(order.orderStatus) && (
                      <button className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.85rem", color: "#DC2626", borderColor: "#FCA5A5" }} onClick={() => handleCancelOrder(order._id)}>
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
