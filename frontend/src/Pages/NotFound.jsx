import React from "react";
import { useNavigate } from "react-router-dom";
import "../Assets/Css/checkout.css";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <main id="app-viewport">
      <div className="view-container" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "70vh" }}>
        <div className="container" style={{ textAlign: "center", maxWidth: "480px", padding: "40px 20px" }}>
          <div style={{ fontSize: "6rem", fontWeight: 800, color: "#111", lineHeight: 1, marginBottom: "10px" }}>404</div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 700, color: "#222", marginBottom: "15px" }}>Page Not Found</h2>
          <p style={{ fontSize: "0.95rem", color: "#666", lineHeight: 1.6, marginBottom: "30px" }}>
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
            <button className="btn-primary" onClick={() => navigate("/")}>
              Back to Home
            </button>
            <button className="btn-secondary" onClick={() => navigate("/products")}>
              Explore Products
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
