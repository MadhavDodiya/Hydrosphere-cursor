import React, { useState, useEffect } from "react";
import api from "../../../services/api.js";

export default function InquiryMonitor() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/inquiries");
      setInquiries(res.data);
    } catch (err) {
      console.error("Error fetching inquiries:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFlag = async (id) => {
    try {
      await api.put(`/api/admin/inquiries/${id}/flag`);
      fetchInquiries();
    } catch (err) {
      alert("Flag toggle failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this inquiry from logs?")) return;
    try {
      await api.delete(`/api/admin/inquiries/${id}`);
      fetchInquiries();
    } catch (err) {
      alert("Delete failed");
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  return (
    <div className="inquiry-monitor fade-in">
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-header bg-transparent p-4 border-0">
          <h5 className="fw-bold mb-0">Platform Communication Log</h5>
          <p className="text-muted small mb-0">Monitor inquiries between buyers and sellers for security and compliance.</p>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <th className="px-4 py-3">Involved Parties</th>
                  <th className="py-3">Subject / Product</th>
                  <th className="py-3">Message Snippet</th>
                  <th className="py-3">Date</th>
                  <th className="px-4 py-3 text-end">Monitor</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                   <tr><td colSpan="5" className="text-center py-5 text-muted">Retrieving communication logs...</td></tr>
                ) : inquiries.length === 0 ? (
                   <tr><td colSpan="5" className="text-center py-5 text-muted">No platform inquiries found.</td></tr>
                ) : inquiries.map(inq => (
                  <tr key={inq._id} className={inq.isFlagged ? "bg-danger-subtle table-danger" : ""}>
                    <td className="px-4 py-3">
                       <div className="d-flex flex-column small">
                          <span className="fw-bold text-dark">Buyer: {inq.buyerId?.name || inq.name}</span>
                          <span className="text-muted">Seller: {inq.sellerId?.name || "Multiple"}</span>
                       </div>
                    </td>
                    <td className="py-3">
                       <div className="badge bg-light text-primary border fw-bold" style={{ fontSize: "0.65rem" }}>
                          {inq.listingId?.companyName || "Listing Deleted"}
                       </div>
                    </td>
                    <td className="py-3">
                       <p className="text-muted small mb-0 text-truncate" style={{ maxWidth: "250px" }}>
                          {inq.message}
                       </p>
                    </td>
                    <td className="py-3 text-muted small">
                       {new Date(inq.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-end">
                       <div className="d-flex gap-2 justify-content-end">
                          <button 
                            className={`btn btn-sm rounded-3 p-2 ${inq.isFlagged ? "btn-danger" : "btn-light border"}`} 
                            onClick={() => handleFlag(inq._id)}
                            title={inq.isFlagged ? "Unflag" : "Flag Inappropriate"}
                          >
                             <i className="bi bi-flag"></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-light border rounded-3 p-2 text-danger" 
                            onClick={() => handleDelete(inq._id)}
                            title="Delete Inquiry"
                          >
                             <i className="bi bi-trash3"></i>
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
