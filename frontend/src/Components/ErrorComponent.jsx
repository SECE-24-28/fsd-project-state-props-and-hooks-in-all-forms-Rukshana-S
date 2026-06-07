import React from "react";

export default function ErrorComponent({ message = "An error occurred while fetching data.", onRetry }) {
  return (
    <div style={{ padding: "40px 20px", textAlign: "center", fontFamily: "sans-serif" }}>
      <p style={{ color: "#e53e3e", fontSize: "1.1rem", marginBottom: "16px" }}>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: "8px 20px",
            backgroundColor: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "0.95rem",
            fontWeight: "500",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            transition: "background-color 0.2s"
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = "#1d4ed8"}
          onMouseOut={(e) => e.target.style.backgroundColor = "#2563eb"}
        >
          Retry
        </button>
      )}
    </div>
  );
}
