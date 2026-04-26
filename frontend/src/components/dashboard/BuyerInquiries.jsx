import React, { useEffect, useState } from "react";
import api from "../../services/api.js";
import InquiryThreadModal from "../InquiryThreadModal.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { socket } from "../../api/socket.js";

export default function BuyerInquiries() {
  const { showToast } = useToast();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        setLoading(true);
        // Correct endpoint should be /api/inquiries/buyer (Task #2)
        const { data } = await api.get("/api/inquiries/buyer");
        setInquiries(data?.data || data || []);
      } catch (err) {
        console.error("Failed to fetch inquiries:", err);
        showToast(err?.response?.data?.message || "Failed to fetch inquiries");
      } finally {
        setLoading(false);
      }
    };
    fetchInquiries();
  }, []);

  useEffect(() => {
    const onUpdated = (payload) => {
      if (!payload?._id) return;
      setInquiries((prev) => prev.map((x) => (String(x._id) === String(payload._id) ? payload : x)));
    };
    socket.on("inquiry:updated", onUpdated);
    return () => socket.off("inquiry:updated", onUpdated);
  }, []);

  if (loading) {
     return (
       <div className="d-flex flex-column align-items-center justify-content-center py-5 bg-white rounded-4 border">
         <div className="spinner-border text-primary mb-3"></div>
         <p className="text-secondary small">Synchronizing your messaging history...</p>
       </div>
     );
  }

  return (
    <div className="bg-white rounded-4 shadow-sm border overflow-hidden">
      <div className="px-4 py-3 border-bottom d-flex justify-content-between align-items-center bg-light-subtle">
        <div>
          <h6 className="mb-0 fw-bold text-dark">My Inquiries</h6>
          <p className="text-muted mb-0 small">History of all messages sent to producers.</p>
        </div>
        <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-2 fw-semibold" style={{ fontSize: '0.7rem' }}>
          {inquiries.length} Conversations
        </span>
      </div>
      
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th className="px-4 py-3 border-0 text-muted small fw-bold text-uppercase" style={{ letterSpacing: '0.05em' }}>Producer</th>
              <th className="py-3 border-0 text-muted small fw-bold text-uppercase" style={{ letterSpacing: '0.05em' }}>Product Type</th>
              <th className="py-3 border-0 text-muted small fw-bold text-uppercase" style={{ letterSpacing: '0.05em' }}>Sent On</th>
              <th className="px-4 py-3 border-0 text-muted small fw-bold text-uppercase text-end" style={{ letterSpacing: '0.05em' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-5">
                  <div className="py-3">
                    <i className="bi bi-chat-left-dots display-4 text-light mb-3 d-block"></i>
                    <h6 className="fw-bold text-dark">No Inquiries Found</h6>
                    <p className="text-muted small">You haven't contacted any suppliers yet. Your message history will appear here.</p>
                  </div>
                </td>
              </tr>
            ) : (
              inquiries.map(l => (
                <tr key={l._id}>
                  <td className="px-4 py-3">
                    <div className="fw-bold text-dark mb-0">{l.listingId?.title || l.listingId?.companyName || "Listing"}</div>
                    <div className="text-muted small"><i className="bi bi-geo-alt me-1"></i>{l.listingId?.location || "N/A"}</div>
                  </td>
                  <td className="py-3">
                    <span className="badge bg-light text-secondary border fw-medium">{l.listingId?.hydrogenType || "N/A"} H2</span>
                  </td>
                  <td className="py-3 text-secondary" style={{ fontSize: "0.85rem" }}>
                    {new Date(l.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-end">
                    <button 
                      className="btn btn-outline-primary btn-sm rounded-pill px-4 fw-medium"
                      onClick={() => setSelectedInquiry(l)}
                      style={{ fontSize: "0.78rem" }}>
                      Open Thread
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
