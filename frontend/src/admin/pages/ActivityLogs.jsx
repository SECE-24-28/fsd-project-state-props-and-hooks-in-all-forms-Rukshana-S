import React, { useState } from "react";
import { useAdmin } from "../context/AdminContext";
import "../styles/AdminDashboard.css"; // Reuse card/table styling

export default function ActivityLogs() {
  const { activityLogs } = useAdmin();
  const [search, setSearch] = useState("");

  const filtered = (activityLogs || []).filter(log => {
    const q = search.toLowerCase();
    return (
      (log.action || "").toLowerCase().includes(q) ||
      (log.details || "").toLowerCase().includes(q) ||
      (log.user || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="adm-page">
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Activity Logs</h1>
          <p className="adm-page-sub">Track real-time actions performed in the Wearly Admin System</p>
        </div>
      </div>

      <div className="adm-card">
        <div className="adm-toolbar">
          <input
            className="adm-search"
            placeholder="Search action, details, user..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", maxWidth: "360px" }}
          />
          <span className="adm-count">{(filtered || []).length} logs total</span>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Details</th>
                <th>Performed By</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(log => (
                <tr key={log.id}>
                  <td style={{ fontSize: "0.82rem", color: "#6C6C6C", whiteSpace: "nowrap" }}>
                    {new Date(log.timestamp).toLocaleString("en-IN")}
                  </td>
                  <td>
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        padding: "4px 10px",
                        borderRadius: "20px",
                        background: "#f4f0f1",
                        color: "#2f2f2f",
                      }}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.86rem", color: "#2f2f2f" }}>{log.details || "—"}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          background: "#e9d5d6",
                          color: "#2f2f2f",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: "0.7rem",
                        }}
                      >
                        {(log.user || "S")[0].toUpperCase()}
                      </div>
                      <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>{log.user}</span>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="adm-empty">
                    No activity logs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
