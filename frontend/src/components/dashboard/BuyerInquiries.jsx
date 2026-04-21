import React, { useEffect, useState } from "react";
import api from "../../services/api.js";
import InquiryThreadModal from "../InquiryThreadModal.jsx";

export default function BuyerInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const { data } = await api.get("/api/inquiries/user");
        setInquiries(data);
      } catch (err) {
        console.error("Failed to fetch inquiries:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInquiries();
  }, []);

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="bg-white rounded-4 shadow-sm border overflow-hidden">
      <div className="px-4 py-3 border-bottom d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-bold">My Inquiries</h5>
        <span className="badge bg-primary rounded-pill px-3 py-2">{inquiries.length} total</span>
      </div>
      
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="bg-light">
            <tr>
              <th className="px-4 py-3 border-0 text-muted small fw-bold text-uppercase">Supplier</th>
              <th className="py-3 border-0 text-muted small fw-bold text-uppercase">Product</th>
              <th className="py-3 border-0 text-muted small fw-bold text-uppercase">Date</th>
              <th className="px-4 py-3 border-0 text-muted small fw-bold text-uppercase text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-5 text-muted">You haven't sent any inquiries yet.</td></tr>
            ) : (
              inquiries.map(l => (
                <tr key={l._id}>
                  <td className="px-4 py-3">
                    <div className="fw-bold text-dark">{l.listingId?.companyName || "Unknown Supplier"}</div>
                    <div className="text-muted small">{l.listingId?.location || "N/A"}</div>
                  </td>
                  <td className="py-3">
                    <span className="badge bg-light text-dark border fw-normal">{l.listingId?.hydrogenType || "N/A"} H2</span>
                  </td>
                  <td className="py-3 text-muted small">
                    {new Date(l.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-end">
                    <button 
                      className="btn btn-sm btn-primary px-3 shadow-sm"
                      onClick={() => setSelectedInquiry(l)}
                      style={{ borderRadius: "8px" }}>
                      View Messages
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
            setInquiries(prev => prev.map(i => i._id === updatedInquiry._id ? updatedInquiry : i));
            setSelectedInquiry(updatedInquiry);
          }}
        />
      )}
    </div>
  );
}
