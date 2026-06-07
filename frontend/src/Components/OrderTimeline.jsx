import React from "react";

const STAGES = ["Pending", "Confirmed", "Processing", "Packed", "Shipped", "Out For Delivery", "Delivered"];

const STAGE_LABELS = {
  Pending: "Order Placed",
  Confirmed: "Confirmed",
  Processing: "Processing",
  Packed: "Packed",
  Shipped: "Shipped",
  "Out For Delivery": "Out for Delivery",
  Delivered: "Delivered",
};

export default function OrderTimeline({ statusHistory, currentStatus }) {
  if (currentStatus === "Cancelled") {
    return (
      <div style={{ padding: "16px", background: "#FEF2F2", color: "#DC2626", borderRadius: "12px", border: "1px solid #FCA5A5", textAlign: "center", fontWeight: 600 }}>
        This order has been Cancelled.
      </div>
    );
  }

  const historyMap = {};
  (statusHistory || []).forEach(h => {
    historyMap[h.status] = h.updatedAt;
  });

  const getStageIndex = (status) => STAGES.indexOf(status);
  const currentIdx = getStageIndex(currentStatus);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", padding: "16px 0" }}>
      {STAGES.map((stage, idx) => {
        const isCompleted = getStageIndex(stage) <= currentIdx;
        const updatedAt = historyMap[stage];
        const dateStr = updatedAt ? new Date(updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : null;

        return (
          <div key={stage} style={{ display: "flex", gap: "16px", alignItems: "flex-start", position: "relative" }}>
            {/* Connector Line */}
            {idx < STAGES.length - 1 && (
              <div
                style={{
                  position: "absolute",
                  left: "11px",
                  top: "24px",
                  width: "2px",
                  height: "calc(100% - 10px)",
                  background: getStageIndex(STAGES[idx + 1]) <= currentIdx ? "#059669" : "#E5E7EB",
                  zIndex: 1,
                }}
              />
            )}

            {/* Checkmark or Circle */}
            <div
              style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                background: isCompleted ? "#059669" : "#FFF",
                border: isCompleted ? "2px solid #059669" : "2px solid #D1D5DB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: isCompleted ? "#FFF" : "#D1D5DB",
                fontSize: "0.75rem",
                fontWeight: "bold",
                zIndex: 2,
                boxShadow: isCompleted && stage === currentStatus ? "0 0 0 4px rgba(5, 150, 105, 0.2)" : "none",
              }}
            >
              {isCompleted ? "✔" : ""}
            </div>

            {/* Stage Info */}
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "0.95rem", fontWeight: isCompleted ? 600 : 500, color: isCompleted ? "#111" : "#6B7280" }}>
                {STAGE_LABELS[stage]}
              </span>
              {dateStr && (
                <span style={{ fontSize: "0.78rem", color: "#6B7280", marginTop: "2px" }}>
                  {dateStr}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
