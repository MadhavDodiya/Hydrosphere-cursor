import React from "react";

const getRelativeTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hrs ago`;
  return date.toLocaleDateString();
};

export default function ActivityFeed({ loading, activities }) {
  if (loading) {
    return (
      <div className="h-100 p-4" style={{ background: "white", borderRadius: "16px", border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
        <div style={{ height: 20, background: "#f1f5f9", borderRadius: 6, width: "50%", marginBottom: 24, animation: "dashPulse 1.5s infinite" }}></div>
        {[1, 2, 3].map(i => (
          <div key={i} className="d-flex gap-3 mb-4">
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "#f1f5f9", flexShrink: 0, animation: "dashPulse 1.5s infinite" }}></div>
            <div className="flex-fill">
              <div style={{ height: 14, background: "#f1f5f9", borderRadius: 6, width: "80%", marginBottom: 8, animation: "dashPulse 1.5s infinite" }}></div>
              <div style={{ height: 11, background: "#f1f5f9", borderRadius: 6, width: "40%", animation: "dashPulse 1.5s infinite" }}></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const items = activities && activities.length > 0 ? activities : [
    { desc: "Welcome to HydroSphere Dashboard!", time: new Date(), type: "system" }
  ];

  const getStyle = (type) => {
    switch(type) {
      case 'inquiry': return { icon: "bi-envelope-paper-fill", bg: "#eff6ff", color: "#2563eb" };
      case 'save':    return { icon: "bi-bookmark-heart-fill", bg: "#fdf2f8", color: "#db2777" };
      case 'listing': return { icon: "bi-plus-circle-fill", bg: "#f0fdf4", color: "#16a34a" };
      default:        return { icon: "bi-info-circle-fill", bg: "#f8fafc", color: "#64748b" };
    }
  };

  return (
    <div className="h-100" style={{ background: "white", borderRadius: "16px", border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column" }}>
      <div className="px-4 pt-4 pb-3 border-bottom d-flex justify-content-between align-items-center">
        <div>
          <h6 className="fw-bold mb-0" style={{ color: "#0f172a" }}>Recent Activity</h6>
          <p className="text-muted mb-0" style={{ fontSize: "0.78rem" }}>Latest updates</p>
        </div>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 0 3px rgba(34,197,94,0.2)" }}></div>
      </div>

      <div className="px-4 py-3 flex-fill" style={{ overflowY: "auto" }}>
        {items.map((act, i) => {
          const style = getStyle(act.type);
          return (
            <div key={act.id || i} className="d-flex gap-3" style={{ marginBottom: i < items.length - 1 ? "1.25rem" : 0, position: "relative" }}>
              {i < items.length - 1 && (
                <div style={{ position: "absolute", left: 20, top: 44, width: 1, height: "calc(100% + 0.5rem)", background: "#f1f5f9" }}></div>
              )}
              <div className="d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: 40, height: 40, borderRadius: "12px", background: style.bg }}>
                <i className={`bi ${style.icon}`} style={{ color: style.color, fontSize: "1rem" }}></i>
              </div>
              <div className="flex-fill">
                <p className="mb-0 fw-medium" style={{ fontSize: "0.85rem", color: "#1e293b", lineHeight: 1.4 }}>{act.desc}</p>
                <span style={{ fontSize: "0.73rem", color: "#94a3b8" }}>{getRelativeTime(act.time)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-4 py-3 border-top">
        <button className="btn w-100 fw-medium" style={{ borderRadius: "10px", border: "1.5px solid #e2e8f0", color: "#475569", fontSize: "0.85rem", padding: "0.5rem" }}>
          View all activity
        </button>
      </div>
    </div>
  );
}
