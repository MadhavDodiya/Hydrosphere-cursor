import React from "react";

const activities = [
  { icon: "bi-envelope-paper-fill", bg: "#eff6ff", color: "#2563eb", desc: "New inquiry from Apex Gases", time: "1 hr ago", dot: "#3b82f6" },
  { icon: "bi-check-circle-fill", bg: "#f0fdf4", color: "#16a34a", desc: "Order #4421 was approved", time: "3 hrs ago", dot: "#22c55e" },
  { icon: "bi-chat-dots-fill", bg: "#f0f9ff", color: "#0891b2", desc: "TechFuel Corp sent a message", time: "Yesterday", dot: "#06b6d4" },
  { icon: "bi-shield-fill-check", bg: "#faf5ff", color: "#7c3aed", desc: "Account verified successfully", time: "2 days ago", dot: "#8b5cf6" },
  { icon: "bi-star-fill", bg: "#fffbeb", color: "#d97706", desc: "GreenEnergy left a 5-star review", time: "3 days ago", dot: "#f59e0b" },
];

export default function ActivityFeed({ loading }) {
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

  return (
    <div className="h-100" style={{ background: "white", borderRadius: "16px", border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-bottom d-flex justify-content-between align-items-center">
        <div>
          <h6 className="fw-bold mb-0" style={{ color: "#0f172a" }}>Recent Activity</h6>
          <p className="text-muted mb-0" style={{ fontSize: "0.78rem" }}>Latest updates</p>
        </div>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 0 3px rgba(34,197,94,0.2)" }}></div>
      </div>

      {/* Feed */}
      <div className="px-4 py-3 flex-fill" style={{ overflowY: "auto" }}>
        {activities.map((act, i) => (
          <div key={i} className="d-flex gap-3" style={{ marginBottom: i < activities.length - 1 ? "1.25rem" : 0, position: "relative" }}>
            {/* Vertical line */}
            {i < activities.length - 1 && (
              <div style={{ position: "absolute", left: 20, top: 44, width: 1, height: "calc(100% + 0.5rem)", background: "#f1f5f9" }}></div>
            )}
            <div className="d-flex align-items-center justify-content-center flex-shrink-0"
              style={{ width: 40, height: 40, borderRadius: "12px", background: act.bg }}>
              <i className={`bi ${act.icon}`} style={{ color: act.color, fontSize: "1rem" }}></i>
            </div>
            <div className="flex-fill">
              <p className="mb-0 fw-medium" style={{ fontSize: "0.85rem", color: "#1e293b", lineHeight: 1.4 }}>{act.desc}</p>
              <span style={{ fontSize: "0.73rem", color: "#94a3b8" }}>{act.time}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-top">
        <button className="btn w-100 fw-medium" style={{ borderRadius: "10px", border: "1.5px solid #e2e8f0", color: "#475569", fontSize: "0.85rem", padding: "0.5rem" }}>
          View all activity
        </button>
      </div>
    </div>
  );
}
