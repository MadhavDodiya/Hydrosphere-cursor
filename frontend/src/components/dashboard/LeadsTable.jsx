import React, { useEffect, useState } from "react";
import api from "../../services/api.js";
import InquiryThreadModal from "../InquiryThreadModal.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { socket } from "../../api/socket.js";
import { Link } from "react-router-dom";

export default function LeadsTable({ loading: parentLoading }) {
  const { showToast } = useToast();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [blockedMessage, setBlockedMessage] = useState("");

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        setLoading(true);
        setBlockedMessage("");
        // Fetched via dedicated supplier inquiries endpoint (Task #2)
        const { data } = await api.get("/api/inquiries/supplier");
        console.log("LEADS_RECEIVED_DATA:", data);
        setInquiries(data?.data || data || []);
      } catch (err) {
        console.error("Failed to fetch inquiries:", err);
        const status = err?.response?.status;
        const msg = err?.response?.data?.message || "Failed to fetch leads";
        if (status === 402) {
          setBlockedMessage(msg);
        } else {
          showToast(msg);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchInquiries();
  }, []);

  useEffect(() => {
    const onCreated = (payload) => {
      if (!payload?._id) return;
      setInquiries((prev) => {
        const exists = prev.some((x) => String(x._id) === String(payload._id));
        return exists ? prev : [payload, ...prev];
      });
    };

    const onUpdated = (payload) => {
      if (!payload?._id) return;
      setInquiries((prev) => prev.map((x) => (String(x._id) === String(payload._id) ? payload : x)));
    };

    socket.on("inquiry:created", onCreated);
    socket.on("inquiry:updated", onUpdated);
    return () => {
      socket.off("inquiry:created", onCreated);
      socket.off("inquiry:updated", onUpdated);
    };
  }, []);

  if (parentLoading || loading) {
    return (
      <div className="p-4 bg-white rounded-4 border shadow-sm">
        <div style={{ height: 24, background: "#f1f5f9", borderRadius: 8, width: "35%", marginBottom: 30, animation: "dashPulse 1.5s infinite" }}></div>
        {[1,2,3].map(i => (
          <div key={i} className="d-flex gap-3 mb-4">
             <div style={{ width: 44, height: 44, background: "#f1f5f9", borderRadius: 12, animation: "dashPulse 1.5s infinite" }}></div>
             <div className="flex-fill">
                <div style={{ height: 16, background: "#f1f5f9", borderRadius: 6, width: "80%", marginBottom: 8, animation: "dashPulse 1.5s infinite" }}></div>
                <div style={{ height: 12, background: "#f1f5f9", borderRadius: 6, width: "40%", animation: "dashPulse 1.5s infinite" }}></div>
             </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-4 shadow-sm border overflow-hidden">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center px-4 py-3 border-bottom bg-light-subtle">
        <div>
          <h6 className="fw-bold mb-0 text-dark">Business Inquiries</h6>
          <p className="text-secondary mb-0" style={{ fontSize: "0.75rem" }}>Review and manage your incoming leads.</p>
        </div>
        <div className="badge bg-primary rounded-pill px-3 py-2 fw-semibold" style={{ fontSize: '0.7rem' }}>
          {inquiries.length} Active Leads
        </div>
      </div>

      {/* Table Area */}
      <div style={{ overflowX: "auto" }}>
        {blockedMessage ? (
          <div className="text-center py-5 px-4">
            <i className="bi bi-lock display-3 text-light-emphasis mb-3 d-block"></i>
            <h6 className="fw-bold text-dark">Upgrade required</h6>
            <p className="text-muted small mb-3">{blockedMessage}</p>
            <Link to="/dashboard/billing" className="btn btn-primary btn-sm rounded-pill px-4 shadow-sm fw-medium">
              View Plans
            </Link>
          </div>
        ) : inquiries.length === 0 ? (
           <div className="text-center py-5">
              <i className="bi bi-inbox display-3 text-light-emphasis mb-3 d-block"></i>
              <h6 className="fw-bold text-dark">No Leads Yet</h6>
              <p className="text-muted small">Prospective buyers will appear here once they inquire about your listings.</p>
           </div>
        ) : (
          <table className="table table-hover mb-0 align-middle">
            <thead className="bg-light">
              <tr>
                <th className="fw-bold border-0 py-3 ps-4 text-muted small text-uppercase" style={{ letterSpacing: '0.05em' }}>Buyer Instance</th>
                <th className="fw-bold border-0 py-3 text-muted small text-uppercase" style={{ letterSpacing: '0.05em' }}>Product Interest</th>
                <th className="fw-bold border-0 py-3 text-muted small text-uppercase" style={{ letterSpacing: '0.05em' }}>Inquiry Date</th>
                <th className="fw-bold border-0 py-3 pe-4 text-end text-muted small text-uppercase" style={{ letterSpacing: '0.05em' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((l) => (
                <tr key={l._id}>
                  <td className="ps-4 py-3">
                    <div className="d-flex align-items-center gap-3">
                      <div className="d-flex align-items-center justify-content-center fw-bold text-white shadow-sm flex-shrink-0"
                        style={{ width: 40, height: 40, borderRadius: "12px", background: "linear-gradient(135deg, #6366f1, #4f46e5)", fontSize: "0.9rem" }}>
                        {(l.buyerId?.name || l.name || "B")[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="fw-bold text-dark mb-0">{l.buyerId?.name || l.name}</div>
                        <div className="text-muted" style={{ fontSize: "0.75rem" }}>{l.buyerId?.email || l.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="fw-medium text-dark" style={{ fontSize: "0.875rem" }}>{l.listingId?.title || l.listingId?.companyName || "Listing Removed"}</div>
                    <div className="text-secondary small">{l.listingId?.hydrogenType || "N/A"} Hydrogen Gas</div>
                  </td>
                  <td className="py-3">
                    <div className="text-dark fw-medium" style={{ fontSize: "0.85rem" }}>{new Date(l.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                    <div className="text-muted" style={{ fontSize: "0.7rem" }}>{new Date(l.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </td>
                  <td className="pe-4 py-3 text-end">
                    <button 
                      className="btn btn-primary btn-sm rounded-pill px-4 shadow-sm fw-medium"
                      onClick={() => setSelectedInquiry(l)}
                      style={{ fontSize: "0.78rem" }}>
                      Manage Thread
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedInquiry && (
        <InquiryThreadModal 
          show={!!selectedInquiry} 
          inquiry={selectedInquiry} 
          onClose={() => setSelectedInquiry(null)}
          onReplyAdded={(updatedInquiry) => {
            setInquiries(prev => prev.map(i => i._id === updatedInquiry._id ? { ...i, replies: updatedInquiry.replies } : i));
            setSelectedInquiry(updatedInquiry);
          }}
        />
      )}
    </div>
  );
}
