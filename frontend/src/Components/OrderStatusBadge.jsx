import React from "react";

const BADGE_COLORS = {
  Pending: { bg: "#FEF3C7", text: "#D97706" },
  Confirmed: { bg: "#DBEAFE", text: "#2563EB" },
  Processing: { bg: "#E0F2FE", text: "#0284C7" },
  Packed: { bg: "#F3E8FF", text: "#7C3AED" },
  Shipped: { bg: "#E0E7FF", text: "#4F46E5" },
  "Out For Delivery": { bg: "#D1FAE5", text: "#059669" },
  Delivered: { bg: "#D1FAE5", text: "#059669" },
  Cancelled: { bg: "#FEE2E2", text: "#DC2626" },
};

export default function OrderStatusBadge({ status }) {
  const styles = BADGE_COLORS[status] || { bg: "#F3F4F6", text: "#374151" };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 12px",
        borderRadius: "12px",
        fontSize: "0.8rem",
        fontWeight: 600,
        backgroundColor: styles.bg,
        color: styles.text,
      }}
    >
      {status}
    </span>
  );
}
