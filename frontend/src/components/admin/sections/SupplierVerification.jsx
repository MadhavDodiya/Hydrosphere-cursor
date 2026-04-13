import React, { useState, useEffect } from "react";
import api from "../../../services/api.js";

export default function SupplierVerification() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUnverifiedSellers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/users", {
        params: { role: "seller" }
      });
      // Further filter here if API doesn't support isVerified filter directly
      const unverified = res.data.users.filter(u => !u.isVerified);
      setSuppliers(unverified);
    } catch (err) {
      console.error("Error fetching unverified sellers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnverifiedSellers();
  }, []);

  const handleVerify = async (userId) => {
    try {
      await api.put(`/api/admin/users/${userId}/verify`);
      showFeedback("Supplier verified successfully!");
      fetchUnverifiedSellers();
    } catch (err) {
      alert("Verification failed");
    }
  };

  const showFeedback = (msg) => {
     // Local feedback logic if toast isn't passed down
     console.log(msg);
  };

  return (
    <div className="supplier-verification fade-in">
      <div className="mb-4">
        <h5 className="fw-bold mb-1">Supplier Verification</h5>
        <p className="text-muted small">Verify sellers to grant them the "Verified Badge" on the marketplace.</p>
      </div>

      <div className="row g-4">
        {loading ? (
          <div className="col-12 py-5 text-center text-muted">Scanning for unverified suppliers...</div>
        ) : suppliers.length === 0 ? (
          <div className="col-12">
             <div className="bg-white p-5 rounded-4 shadow-sm text-center">
                <i className="bi bi-patch-check fs-1 text-success mb-3 opacity-25"></i>
                <h6 className="fw-bold">All caught up!</h6>
                <p className="text-muted small mb-0">No pending supplier verification requests found.</p>
             </div>
          </div>
        ) : suppliers.map(s => (
          <div key={s._id} className="col-12 col-md-6 col-xl-4">
            <div className="card border-0 shadow-sm rounded-4 h-100 p-4 transition-all hover-up" style={{ border: "1px solid #f1f5f9" }}>
              <div className="d-flex align-items-center gap-3 mb-4">
                <div style={{ width: 48, height: 48, borderRadius: "12px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "1.2rem", fontWeight: 700 }}>
                  {s.name[0].toUpperCase()}
                </div>
                <div>
                   <h6 className="fw-bold mb-0">{s.name}</h6>
                   <p className="text-muted small mb-0">{s.email}</p>
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between text-muted small mb-2">
                  <span>Joined Date:</span>
                  <span className="fw-bold">{new Date(s.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="d-flex justify-content-between text-muted small">
                  <span>Listings:</span>
                  <span className="fw-bold fs-6 text-dark">—</span>
                </div>
              </div>

              <div className="d-flex gap-2">
                <button className="btn btn-success rounded-3 w-100 fw-bold border-0 shadow-sm" onClick={() => handleVerify(s._id)} style={{ fontSize: "0.85rem" }}>
                   Verify Supplier ✓
                </button>
                <button className="btn btn-light border rounded-3 text-danger px-3" title="Reject">
                   <i className="bi bi-x-lg"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
