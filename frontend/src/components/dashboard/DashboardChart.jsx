import React from "react";

const chartData = [
  { label: "Mon", leads: 40, revenue: 3200 },
  { label: "Tue", leads: 65, revenue: 5100 },
  { label: "Wed", leads: 30, revenue: 2600 },
  { label: "Thu", leads: 88, revenue: 7040 },
  { label: "Fri", leads: 72, revenue: 5760 },
  { label: "Sat", leads: 95, revenue: 7600 },
  { label: "Sun", leads: 58, revenue: 4640 },
];

const maxLeads = Math.max(...chartData.map(d => d.leads));

export default function DashboardChart({ loading }) {
  if (loading) {
    return (
      <div className="h-100 p-4" style={{ background: "white", borderRadius: "16px", border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
        <div style={{ height: 20, background: "#f1f5f9", borderRadius: 6, width: "40%", marginBottom: 24, animation: "dashPulse 1.5s infinite" }}></div>
        <div className="d-flex align-items-end gap-2" style={{ height: 200 }}>
          {chartData.map((_, i) => (
            <div key={i} style={{ flex: 1, background: "#f1f5f9", borderRadius: "6px 6px 0 0", height: `${30 + Math.random() * 60}%`, animation: "dashPulse 1.5s infinite" }}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-100" style={{ background: "white", borderRadius: "16px", border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center px-4 pt-4 pb-3 border-bottom">
        <div>
          <h6 className="fw-bold mb-0" style={{ color: "#0f172a" }}>Leads Volume</h6>
          <p className="text-muted mb-0" style={{ fontSize: "0.78rem" }}>Weekly overview</p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center gap-1">
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6", display: "inline-block" }}></span>
            <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Leads</span>
          </div>
          <select className="form-select form-select-sm border-0 bg-light rounded-pill shadow-none" style={{ fontSize: "0.78rem", width: "auto" }}>
            <option>This Week</option>
            <option>Last Week</option>
            <option>This Month</option>
          </select>
        </div>
      </div>

      {/* Chart */}
      <div className="px-4 pb-4 pt-3">
        <div className="d-flex align-items-end gap-2" style={{ height: 180 }}>
          {chartData.map((d, i) => {
            const pct = (d.leads / maxLeads) * 100;
            return (
              <div key={i} className="d-flex flex-column align-items-center flex-fill" style={{ height: "100%" }}>
                <div className="position-relative d-flex align-items-end justify-content-center" style={{ flex: 1, width: "100%" }}>
                  <div
                    style={{
                      width: "70%",
                      height: `${pct}%`,
                      minHeight: 4,
                      background: i === 5 ? "linear-gradient(180deg, #2563eb, #60a5fa)" : "linear-gradient(180deg, #93c5fd, #dbeafe)",
                      borderRadius: "6px 6px 0 0",
                      transition: "height 0.8s cubic-bezier(0.34,1.56,0.64,1)",
                      position: "relative",
                      cursor: "pointer",
                    }}
                    title={`${d.leads} leads`}
                  >
                    {i === 5 && (
                      <div style={{ position: "absolute", top: -28, left: "50%", transform: "translateX(-50%)", background: "#2563eb", color: "white", borderRadius: 6, padding: "2px 8px", fontSize: "0.7rem", whiteSpace: "nowrap", fontWeight: 600 }}>
                        {d.leads}
                      </div>
                    )}
                  </div>
                </div>
                <span style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: 8, fontWeight: 500 }}>{d.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="d-flex border-top">
        {[
          { label: "Total Leads", value: chartData.reduce((a, d) => a + d.leads, 0), color: "#2563eb" },
          { label: "Avg/Day", value: Math.round(chartData.reduce((a, d) => a + d.leads, 0) / 7), color: "#0891b2" },
          { label: "Peak Day", value: "Sat", color: "#7c3aed" },
        ].map((s, i) => (
          <div key={i} className={`text-center flex-fill py-3 ${i < 2 ? "border-end" : ""}`}>
            <div className="fw-bold" style={{ color: s.color, fontSize: "1.1rem" }}>{s.value}</div>
            <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
