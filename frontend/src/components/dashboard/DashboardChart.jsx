import React from "react";

export default function DashboardChart({ loading }) {
  if (loading) {
    return (
      <div className="dash-card p-4 h-100">
        <h5 className="fw-bold mb-4">Leads Over Time</h5>
        <div className="dash-skeleton w-100 h-100" style={{ minHeight: "200px" }}></div>
      </div>
    );
  }

  const chartData = [40, 55, 30, 80, 65, 90, 75];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="dash-card p-4 h-100">
      <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
        <h5 className="fw-bold mb-0 text-dark">Leads Volume</h5>
        <select className="form-select form-select-sm w-auto border-0 bg-light rounded-pill shadow-none">
          <option>This Week</option>
          <option>Last Week</option>
          <option>This Month</option>
        </select>
      </div>

      {/* Pure CSS Bar Chart Representation */}
      <div className="css-bar-chart px-2 pb-4">
        {chartData.map((val, i) => (
          <div 
            key={i} 
            className="css-bar d-flex align-items-end justify-content-center" 
            style={{ height: `${val}%` }}
            title={`${val} Leads`}
          >
            <span className="fw-medium">{val}</span>
            <div className="position-absolute text-muted small" style={{ bottom: "-25px", fontSize: "0.75rem" }}>
              {days[i]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
