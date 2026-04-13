import React from "react";

const colorMap = {
  primary: { bg: "#eff6ff", text: "#2563eb", shadow: "rgba(37,99,235,0.15)" },
  success: { bg: "#f0fdf4", text: "#16a34a", shadow: "rgba(22,163,74,0.15)" },
  warning: { bg: "#fffbeb", text: "#d97706", shadow: "rgba(217,119,6,0.15)" },
  info:    { bg: "#f0f9ff", text: "#0891b2", shadow: "rgba(8,145,178,0.15)" },
};

export default function StatsCard({ loading, title, value, trend, icon, colorClass }) {
  if (loading) {
    return (
      <div className="p-4 h-100" style={{ background: "white", borderRadius: "16px", border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
        <div style={{ height: 14, borderRadius: 6, background: "#f1f5f9", width: "55%", marginBottom: 16, animation: "dashPulse 1.5s infinite" }}></div>
        <div style={{ height: 32, borderRadius: 6, background: "#f1f5f9", width: "70%", marginBottom: 12, animation: "dashPulse 1.5s infinite" }}></div>
        <div style={{ height: 12, borderRadius: 6, background: "#f1f5f9", width: "40%", animation: "dashPulse 1.5s infinite" }}></div>
      </div>
    );
  }

  const isPositive = trend >= 0;
  const c = colorMap[colorClass] || colorMap.primary;

  return (
    <div className="p-4 h-100 d-flex flex-column" style={{ background: "white", borderRadius: "16px", border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", transition: "all 0.3s ease" }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = `0 12px 30px ${c.shadow}`}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.04)"}
    >
      <div className="d-flex justify-content-between align-items-start mb-3">
        <p className="text-muted fw-semibold text-uppercase mb-0" style={{ fontSize: "0.72rem", letterSpacing: "0.07em" }}>{title}</p>
        <div className="d-flex align-items-center justify-content-center" style={{ width: 42, height: 42, borderRadius: "12px", background: c.bg }}>
          <i className={`bi ${icon} fs-5`} style={{ color: c.text }}></i>
        </div>
      </div>
      <h2 className="fw-bold mb-1" style={{ fontSize: "1.85rem", color: "#0f172a", letterSpacing: "-0.02em" }}>{value}</h2>
      <div className="d-flex align-items-center gap-2 mt-auto pt-2">
        <span className="d-flex align-items-center gap-1 px-2 py-1 rounded-pill fw-semibold"
          style={{ fontSize: "0.75rem", background: isPositive ? "#f0fdf4" : "#fef2f2", color: isPositive ? "#16a34a" : "#dc2626" }}>
          <i className={`bi ${isPositive ? "bi-arrow-up-right" : "bi-arrow-down-right"}`}></i>
          {Math.abs(trend)}%
        </span>
        <span className="text-muted" style={{ fontSize: "0.78rem" }}>vs last month</span>
      </div>
    </div>
  );
}
