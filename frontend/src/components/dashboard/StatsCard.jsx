import React from "react";

export default function StatsCard({ loading, title, value, trend, icon, colorClass }) {
  if (loading) {
    return (
      <div className="dash-card p-3 p-md-4 h-100">
        <div className="dash-skeleton w-50 mb-3" style={{ height: "20px" }}></div>
        <div className="dash-skeleton w-75 mb-2" style={{ height: "36px" }}></div>
        <div className="dash-skeleton w-25 mt-3" style={{ height: "16px" }}></div>
      </div>
    );
  }

  const isPositive = trend >= 0;

  return (
    <div className="dash-card p-3 p-xl-4 h-100 d-flex flex-column justify-content-center">
      <div className="d-flex justify-content-between align-items-start mb-3">
        <div className="text-muted small fw-semibold text-uppercase">{title}</div>
        <div className={`bg-light rounded p-2 text-${colorClass} d-flex align-items-center justify-content-center`}>
          <i className={`bi ${icon} fs-5`}></i>
        </div>
      </div>
      <h3 className="fw-bold text-dark mb-1">{value}</h3>
      <div className="small mt-auto">
        <span className={`fw-semibold ${isPositive ? "text-success" : "text-danger"} pe-2`}>
          {isPositive ? <i className="bi bi-arrow-up-short"></i> : <i className="bi bi-arrow-down-short"></i>}
          {Math.abs(trend)}%
        </span>
        <span className="text-muted">vs last month</span>
      </div>
    </div>
  );
}
