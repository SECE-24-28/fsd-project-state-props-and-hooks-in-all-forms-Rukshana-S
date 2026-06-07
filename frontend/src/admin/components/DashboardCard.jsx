import React from "react";
import "../admin.css";

export default function DashboardCard({icon, label, value, bg}){
  return (
    <div className="adm-stat-card">
      <div className="adm-stat-icon" style={{background:bg}}>{icon}</div>
      <div>
        <p className="adm-stat-value">{value}</p>
        <p className="adm-stat-label">{label}</p>
      </div>
    </div>
  );
}
