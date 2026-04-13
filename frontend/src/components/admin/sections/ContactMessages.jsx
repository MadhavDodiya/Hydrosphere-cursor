import React, { useState, useEffect } from "react";
import api from "../../../services/api.js";

export default function ContactMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState(null);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/contacts");
      setMessages(res.data);
    } catch (err) {
      console.error("Error fetching contact messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (id) => {
    try {
      await api.put(`/api/admin/contacts/${id}/respond`);
      fetchContacts();
      setSelectedMsg(null);
    } catch (err) {
      alert("Failed to update status");
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  return (
    <div className="contact-messages fade-in">
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-header bg-transparent p-4 border-0">
          <h5 className="fw-bold mb-0">General Contact Messages</h5>
          <p className="text-muted small mb-0">Submissions from the public Contact page.</p>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <th className="px-4 py-3">From</th>
                  <th className="py-3">Subject / Status</th>
                  <th className="py-3">Message Snippet</th>
                  <th className="py-3">Date</th>
                  <th className="px-4 py-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                   <tr><td colSpan="5" className="text-center py-5 text-muted">Loading contact messages...</td></tr>
                ) : messages.length === 0 ? (
                   <tr><td colSpan="5" className="text-center py-4 text-muted small">No contact messages yet.</td></tr>
                ) : messages.map(m => (
                  <tr key={m._id} style={{ cursor: "pointer" }} onClick={() => setSelectedMsg(m)} className={m.isResponded ? "opacity-75 bg-light" : ""}>
                    <td className="px-4 py-3">
                       <div className="small fw-bold text-dark">{m.name}</div>
                       <div className="text-muted small">{m.email}</div>
                    </td>
                    <td className="py-3">
                       <div className="d-flex flex-column gap-1">
                          <span className="badge bg-blue-subtle text-primary border-0 rounded-pill px-2 w-fit" style={{ fontSize: "0.65rem", width: "fit-content" }}>{m.subject}</span>
                          {m.isResponded && <span className="badge bg-success-subtle text-success border-0 rounded-pill px-2 w-fit" style={{ fontSize: "0.65rem", width: "fit-content" }}>Responded</span>}
                       </div>
                    </td>
                    <td className="py-3 text-muted small">
                       <div className="text-truncate" style={{ maxWidth: 200 }}>{m.message}</div>
                    </td>
                    <td className="py-3 text-muted small">
                       {new Date(m.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-end">
                       <button className="btn btn-sm btn-light border-0"><i className="bi bi-eye"></i></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Basic Bootstrap Modal implementation for message detail */}
      {selectedMsg && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)", zIndex: 1050 }} onClick={() => setSelectedMsg(null)}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content border-0 rounded-4 shadow">
              <div className="modal-header border-0 p-4 pb-0">
                <h5 className="fw-bold modal-title">{selectedMsg.subject}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedMsg(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="d-flex align-items-center gap-3 mb-4 p-3 bg-light rounded-3">
                   <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#dee2e6", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                      {selectedMsg.name[0].toUpperCase()}
                   </div>
                   <div>
                      <div className="fw-bold">{selectedMsg.name}</div>
                      <div className="text-muted small">{selectedMsg.email}</div>
                   </div>
                </div>
                <div className="text-dark" style={{ lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                   {selectedMsg.message}
                </div>
              </div>
              <div className="modal-footer border-0 p-4 pt-0">
                <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setSelectedMsg(null)}>Close</button>
                <button 
                  type="button" 
                  className={`btn ${selectedMsg.isResponded ? "btn-outline-success" : "btn-success"} rounded-pill px-4`} 
                  onClick={() => handleRespond(selectedMsg._id)}
                >
                  {selectedMsg.isResponded ? "Mark as Unread" : "Mark as Responded"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
