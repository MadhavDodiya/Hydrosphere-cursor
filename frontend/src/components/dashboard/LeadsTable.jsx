import React, { useEffect, useState } from "react";
import api from "../../services/api.js";

const statusBadge = (s) => {
  const map = {
    pending:  { bg: "#fffbeb", color: "#d97706", dot: "#f59e0b", label: "Pending" },
    approved: { bg: "#f0fdf4", color: "#16a34a", dot: "#22c55e", label: "Approved" },
    rejected: { bg: "#fef2f2", color: "#dc2626", dot: "#ef4444", label: "Rejected" },
  };
  const c = map[String(s).toLowerCase()] || { bg: "#f1f5f9", color: "#64748b", dot: "#94a3b8", label: s };
  return (
    <span className="d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill fw-semibold"
      style={{ background: c.bg, color: c.color, fontSize: "0.73rem" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, display: "inline-block" }}></span>
      {c.label}
    </span>
  );
};

export default function LeadsTable({ loading: parentLoading }) {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const { data } = await api.get("/api/inquiries/seller");
        setInquiries(data);
      } catch (err) {
        console.error("Failed to fetch inquiries:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInquiries();
  }, []);

  if (parentLoading || loading) {
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
          <h6 className="fw-bold mb-0" style={{ color: "#0f172a" }}>Recent Inquiries</h6>
          <p className="text-muted mb-0" style={{ fontSize: "0.78rem" }}>{inquiries.length} total inquiries</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-sm fw-medium" style={{ borderRadius: "8px", border: "1.5px solid #e2e8f0", color: "#64748b", fontSize: "0.8rem", padding: "0.35rem 0.9rem" }}>
            <i className="bi bi-download me-1"></i>Export
          </button>
        </div>
      </div>

      {/* Table - scrollable on mobile */}
      <div style={{ overflowX: "auto" }}>
        {inquiries.length === 0 ? (
           <div className="text-center py-5 text-muted small">No inquiries found yet.</div>
        ) : (
          <table className="table table-hover mb-0 align-middle" style={{ minWidth: "640px" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Buyer", "Listing", "Product Type", "Date", "Action"].map((h, i) => (
                  <th key={h} className={`fw-semibold border-0 py-3 ${i === 0 ? "ps-4" : ""} ${i === 4 ? "pe-4 text-end" : ""}`}
                    style={{ fontSize: "0.72rem", color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inquiries.map((l) => (
                <tr key={l._id} style={{ borderBottom: "1px solid #f8fafc" }}>
                  <td className="ps-4 py-3">
                    <div className="d-flex align-items-center gap-2">
                      <div className="d-flex align-items-center justify-content-center fw-bold flex-shrink-0"
                        style={{ width: 34, height: 34, borderRadius: "10px", background: `#ef444418`, color: "#ef4444", fontSize: "0.75rem" }}>
                        {l.name[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="fw-semibold" style={{ fontSize: "0.875rem", color: "#1e293b" }}>{l.name}</div>
                        <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{l.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3" style={{ fontSize: "0.85rem", color: "#475569" }}>{l.listingId?.companyName || "N/A"}</td>
                  <td className="py-3" style={{ fontSize: "0.85rem", color: "#475569" }}><span className="badge bg-light text-dark border fw-normal">{l.listingId?.hydrogenType || "N/A"} H2</span></td>
                  <td className="py-3" style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{new Date(l.createdAt).toLocaleDateString()}</td>
                  <td className="pe-4 py-3 text-end">
                    <button className="btn btn-sm fw-medium shadow-sm"
                      style={{ borderRadius: "8px", border: "none", color: "white", background: "linear-gradient(135deg,#2563eb,#1d4ed8)", fontSize: "0.78rem", padding: "0.3rem 0.75rem" }}>
                      View Message
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
