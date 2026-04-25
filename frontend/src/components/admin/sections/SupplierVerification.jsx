import React, { useState, useEffect } from "react";
import api from "../../../services/api.js";

export default function SupplierVerification() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchPendingSuppliers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/users", { params: { role: "supplier", limit: 50 } });
      // Show suppliers who are NOT yet approved (pending admin action)
      const pending = res.data.users.filter(u => !u.isApproved);
      setSuppliers(pending);
    } catch (err) {
      console.error("Error fetching pending suppliers:", err);
      showToast("Failed to load suppliers", "danger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingSuppliers();
  }, []);

  const handleApprove = async (userId) => {
    setActionId(userId + "_approve");
    try {
      await api.put(`/api/admin/users/${userId}/approve`);
      showToast("Supplier approved! They can now create listings. ✅");
      fetchPendingSuppliers();
    } catch (err) {
      showToast("Approval failed. Please try again.", "danger");
    } finally {
      setActionId(null);
    }
  };

  const handleVerify = async (userId) => {
    setActionId(userId + "_verify");
    try {
      await api.put(`/api/admin/users/${userId}/verify`);
      showToast("Supplier fully verified with badge! 🏅");
      fetchPendingSuppliers();
    } catch (err) {
      showToast("Verification failed. Please try again.", "danger");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="supplier-verification fade-in">
      {/* Toast Notification */}
      {toast && (
        <div className={`alert alert-${toast.type} alert-dismissible fade show position-fixed top-0 end-0 m-3`} style={{ zIndex: 9999, minWidth: 300 }}>
          {toast.msg}
          <button type="button" className="btn-close" onClick={() => setToast(null)}></button>
        </div>
      )}

      <div className="mb-4">
        <h5 className="fw-bold mb-1">Supplier Approval Queue</h5>
        <p className="text-muted small">
          New suppliers must be approved before they can publish listings.
          Verifying also grants the "Verified Badge" on the marketplace.
        </p>
      </div>

      {loading ? (
        <div className="row g-4">
          {[1, 2, 3].map(i => (
            <div className="col-12 col-md-6 col-xl-4" key={i}>
              <div className="card border-0 shadow-sm rounded-4 p-4" style={{ height: 200 }}>
                <div className="placeholder-glow">
                  <span className="placeholder col-8 mb-3" style={{ height: 20, borderRadius: 6 }}></span>
                  <span className="placeholder col-5 mb-4" style={{ height: 14, borderRadius: 6 }}></span>
                  <span className="placeholder col-12" style={{ height: 38, borderRadius: 10 }}></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : suppliers.length === 0 ? (
        <div className="bg-white p-5 rounded-4 shadow-sm text-center">
          <i className="bi bi-patch-check fs-1 text-success mb-3 d-block opacity-50"></i>
          <h6 className="fw-bold">All caught up!</h6>
          <p className="text-muted small mb-0">No suppliers pending approval.</p>
        </div>
      ) : (
        <div className="row g-4">
          {suppliers.map(s => (
            <div key={s._id} className="col-12 col-md-6 col-xl-4">
              <div className="card border-0 shadow-sm rounded-4 h-100 p-4" style={{ border: "1px solid #f1f5f9" }}>
                
                {/* Header */}
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div style={{ width: 48, height: 48, borderRadius: "12px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "1.2rem", fontWeight: 700, flexShrink: 0 }}>
                    {s.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="overflow-hidden">
                    <h6 className="fw-bold mb-0 text-truncate">{s.name}</h6>
                    <p className="text-muted small mb-0 text-truncate">{s.email}</p>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="d-flex flex-wrap gap-2 mb-3">
                  <span className={`badge ${s.emailVerified ? "bg-success-subtle text-success" : "bg-warning-subtle text-warning"}`}>
                    <i className={`bi bi-${s.emailVerified ? "envelope-check" : "envelope-x"} me-1`}></i>
                    Email {s.emailVerified ? "Verified" : "Unverified"}
                  </span>
                  <span className="badge bg-danger-subtle text-danger">
                    <i className="bi bi-hourglass-split me-1"></i>
                    Pending Approval
                  </span>
                </div>

                {/* Info */}
                <div className="mb-3 p-3 bg-light rounded-3 small">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Joined:</span>
                    <span className="fw-semibold">{new Date(s.createdAt).toLocaleDateString("en-IN")}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Company:</span>
                    <span className="fw-semibold text-truncate ms-2">{s.companyName || "—"}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="d-flex gap-2 mt-auto">
                  <button
                    className="btn btn-primary rounded-3 flex-grow-1 fw-bold"
                    onClick={() => handleApprove(s._id)}
                    disabled={actionId === s._id + "_approve"}
                    style={{ fontSize: "0.85rem" }}
                  >
                    {actionId === s._id + "_approve"
                      ? <><span className="spinner-border spinner-border-sm me-1"></span>Approving...</>
                      : <><i className="bi bi-check-circle me-1"></i>Approve</>
                    }
                  </button>
                  <button
                    className="btn btn-success rounded-3 fw-bold px-3"
                    onClick={() => handleVerify(s._id)}
                    disabled={actionId === s._id + "_verify"}
                    title="Approve + grant Verified Badge"
                    style={{ fontSize: "0.85rem" }}
                  >
                    {actionId === s._id + "_verify"
                      ? <span className="spinner-border spinner-border-sm"></span>
                      : <><i className="bi bi-patch-check me-1"></i>Verify</>
                    }
                  </button>
                </div>
                <p className="text-muted" style={{ fontSize: "0.7rem", marginTop: 6 }}>
                  "Approve" grants listing access. "Verify" also adds the marketplace badge.
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
