import React, { useState } from "react";
import { addReply } from "../services/inquiryService.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function InquiryThreadModal({ inquiry, show, onClose, onReplyAdded }) {
  const { user } = useAuth();
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!show || !inquiry) return null;

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSubmitting(true);
    setError("");
    try {
      const updatedInquiry = await addReply(inquiry._id, replyText);
      setReplyText("");
      if (onReplyAdded) onReplyAdded(updatedInquiry);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reply");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 1060 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden d-flex flex-column" style={{ maxHeight: "85vh" }}>
          
          <div className="modal-header bg-primary text-white p-4 border-0 flex-shrink-0">
            <div>
              <h5 className="modal-title fw-bold mb-0">Inquiry Thread</h5>
              <p className="small mb-0 opacity-75">
                {inquiry.listingId?.companyName} • {inquiry.listingId?.hydrogenType} Hydrogen
              </p>
            </div>
            <button type="button" className="btn-close btn-close-white shadow-none" onClick={onClose}></button>
          </div>

          <div className="modal-body p-0 d-flex flex-column flex-grow-1 overflow-hidden" style={{ background: "#f8fafc" }}>
            <div className="p-4 overflow-auto flex-grow-1">
              {/* Original Message */}
              <div className="d-flex flex-column gap-1 mb-4 align-items-start">
                <div className="small fw-bold text-muted d-flex align-items-center gap-2">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: 24, height: 24, fontSize: "0.7rem" }}>
                    {inquiry.name[0].toUpperCase()}
                  </div>
                  {inquiry.name} <span style={{ fontSize: "0.65rem", fontWeight: "normal" }}>({new Date(inquiry.createdAt).toLocaleString()})</span>
                </div>
                <div className="p-3 bg-white border rounded-3 shadow-sm" style={{ borderBottomLeftRadius: 0, maxWidth: "80%" }}>
                  {inquiry.message}
                </div>
              </div>

              {/* Replies */}
              {(inquiry.replies || []).map((reply, idx) => {
                const isSeller = reply.senderRole === "seller";
                const isMe = (isSeller && user.role === "seller") || (!isSeller && user.role === "buyer");
                
                return (
                  <div key={idx} className={`d-flex flex-column gap-1 mb-4 ${isMe ? "align-items-end" : "align-items-start"}`}>
                    <div className="small fw-bold text-muted">
                      {isSeller ? "Seller" : inquiry.name} <span style={{ fontSize: "0.65rem", fontWeight: "normal" }}>({new Date(reply.createdAt).toLocaleString()})</span>
                    </div>
                    <div 
                      className={`p-3 rounded-3 shadow-sm ${isMe ? "bg-primary text-white" : "bg-white border"}`}
                      style={{ 
                        borderBottomRightRadius: isMe ? 0 : "0.5rem",
                        borderBottomLeftRadius: isMe ? "0.5rem" : 0, 
                        maxWidth: "80%" 
                      }}
                    >
                      {reply.message}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Input Box */}
            <div className="p-4 bg-white border-top flex-shrink-0">
              {error && <div className="alert alert-danger py-2 small">{error}</div>}
              <form onSubmit={handleReply} className="d-flex gap-2">
                <input 
                  type="text" 
                  className="form-control rounded-pill px-4 shadow-none" 
                  placeholder="Type your reply here..." 
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  disabled={submitting}
                />
                <button 
                  type="submit" 
                  className="btn btn-primary rounded-pill px-4 fw-bold"
                  disabled={submitting || !replyText.trim()}
                >
                  {submitting ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-send-fill"></i>}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
