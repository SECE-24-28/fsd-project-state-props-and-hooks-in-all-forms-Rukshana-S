import React from "react";

export default function Loading({ type = "spinner", count = 3 }) {
  if (type === "skeleton") {
    return (
      <div className="skeleton-wrapper" style={{ width: "100%", padding: "20px" }}>
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="skeleton-item" style={{
            marginBottom: "20px",
            background: "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
            borderRadius: "8px",
            height: "80px"
          }} />
        ))}
        <style>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px" }}>
      <div className="spinner" style={{
        width: "40px",
        height: "40px",
        border: "4px solid #f3f4f6",
        borderTop: "4px solid #2563eb",
        borderRadius: "50%",
        animation: "spin 1s linear infinite"
      }} />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
