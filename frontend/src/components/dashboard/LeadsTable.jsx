import React from "react";

const leads = [
  { id: "ORD-001", buyer: "Apex Gases", product: "High Purity H2", qty: "500 kg", status: "Pending",  date: "Today, 10:24 AM",    avatar: "AG", color: "#2563eb" },
  { id: "ORD-002", buyer: "TechFuel Corp",  product: "Liquid Hydrogen",   qty: "1,200 kg", status: "Approved", date: "Yesterday, 2:15 PM", avatar: "TC", color: "#16a34a" },
  { id: "ORD-003", buyer: "GreenEnergy",    product: "Electrolyzer Part",  qty: "2 Units",  status: "Rejected", date: "Oct 10, 2023",  avatar: "GE", color: "#dc2626" },
  { id: "ORD-004", buyer: "NeoX Space",     product: "High Purity H2",    qty: "850 kg",   status: "Approved", date: "Oct 08, 2023",  avatar: "NX", color: "#7c3aed" },
  { id: "ORD-005", buyer: "FuelTech GmbH",  product: "Green H2 Gas",      qty: "300 kg",   status: "Pending",  date: "Oct 06, 2023",  avatar: "FT", color: "#d97706" },
];

const statusBadge = (s) => {
  const map = {
    Pending:  { bg: "#fffbeb", color: "#d97706", dot: "#f59e0b" },
    Approved: { bg: "#f0fdf4", color: "#16a34a", dot: "#22c55e" },
    Rejected: { bg: "#fef2f2", color: "#dc2626", dot: "#ef4444" },
  };
  const c = map[s] || { bg: "#f1f5f9", color: "#64748b", dot: "#94a3b8" };
  return (
    <span className="d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill fw-semibold"
      style={{ background: c.bg, color: c.color, fontSize: "0.73rem" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, display: "inline-block" }}></span>
      {s}
    </span>
  );
};

export default function LeadsTable({ loading }) {
  if (loading) {
    return (
      <div className="p-4" style={{ background: "white", borderRadius: "16px", border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
        <div style={{ height: 24, background: "#f1f5f9", borderRadius: 6, width: "35%", marginBottom: 24, animation: "dashPulse 1.5s infinite" }}></div>
        {[1,2,3].map(i => <div key={i} style={{ height: 52, background: "#f1f5f9", borderRadius: 8, marginBottom: 12, animation: "dashPulse 1.5s infinite" }}></div>)}
      </div>
    );
  }

  return (
    <div style={{ background: "white", borderRadius: "16px", border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.04)", overflow: "hidden" }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom flex-wrap gap-2">
        <div>
          <h6 className="fw-bold mb-0" style={{ color: "#0f172a" }}>Recent Leads & Orders</h6>
          <p className="text-muted mb-0" style={{ fontSize: "0.78rem" }}>{leads.length} total inquiries</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-sm fw-medium" style={{ borderRadius: "8px", border: "1.5px solid #e2e8f0", color: "#64748b", fontSize: "0.8rem", padding: "0.35rem 0.9rem" }}>
            <i className="bi bi-download me-1"></i>Export
          </button>
          <button className="btn btn-sm fw-semibold" style={{ borderRadius: "8px", background: "linear-gradient(135deg,#2563eb,#1d4ed8)", color: "white", border: "none", fontSize: "0.8rem", padding: "0.35rem 0.9rem" }}>
            View All
          </button>
        </div>
      </div>

      {/* Table - scrollable on mobile */}
      <div style={{ overflowX: "auto" }}>
        <table className="table table-hover mb-0 align-middle" style={{ minWidth: "640px" }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {["Buyer", "Product", "Qty", "Status", "Date", "Action"].map((h, i) => (
                <th key={h} className={`fw-semibold border-0 py-3 ${i === 0 ? "ps-4" : ""} ${i === 5 ? "pe-4 text-end" : ""}`}
                  style={{ fontSize: "0.72rem", color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                <td className="ps-4 py-3">
                  <div className="d-flex align-items-center gap-2">
                    <div className="d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                      style={{ width: 34, height: 34, borderRadius: "10px", background: `${l.color}18`, color: l.color, fontSize: "0.75rem" }}>
                      {l.avatar}
                    </div>
                    <div>
                      <div className="fw-semibold" style={{ fontSize: "0.875rem", color: "#1e293b" }}>{l.buyer}</div>
                      <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{l.id}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3" style={{ fontSize: "0.85rem", color: "#475569" }}>{l.product}</td>
                <td className="py-3" style={{ fontSize: "0.85rem", color: "#475569" }}>{l.qty}</td>
                <td className="py-3">{statusBadge(l.status)}</td>
                <td className="py-3" style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{l.date}</td>
                <td className="pe-4 py-3 text-end">
                  <button className="btn btn-sm fw-medium"
                    style={{ borderRadius: "8px", border: "1.5px solid #dbeafe", color: "#2563eb", background: "#eff6ff", fontSize: "0.78rem", padding: "0.3rem 0.75rem" }}>
                    Respond
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
