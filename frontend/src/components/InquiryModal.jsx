import React, { useState } from "react";
import { createInquiry } from "../services/inquiryService.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function InquiryModal({ listing, show, onClose }) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    message: `Hi, I am interested in your ${listing?.hydrogenType || ""} Hydrogen listing in ${listing?.location || ""}. Please provide more details.`,
  });

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createInquiry({
        listingId: listing._id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send inquiry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", zIndex: 1060 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="modal-header bg-primary text-white p-4 border-0">
            <div>
              <h5 className="modal-title fw-bold mb-0">Request Information</h5>
              <p className="small mb-0 opacity-75">Send a direct message to the supplier</p>
            </div>
            <button type="button" className="btn-close btn-close-white shadow-none" onClick={onClose}></button>
          </div>

          <div className="modal-body p-4">
            {success ? (
              <div className="text-center py-4">
                <div className="display-1 text-success mb-3">
                  <i className="bi bi-check-circle-fill"></i>
                </div>
                <h4 className="fw-bold">Inquiry Sent!</h4>
                <p className="text-muted">Your message has been delivered to the seller. We'll notify you when they respond.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="listing-snippet d-flex align-items-center gap-3 p-3 bg-light rounded-3 mb-4">
                   <div className="bg-white rounded p-2 border text-center" style={{ width: 60 }}>
                      <span className="d-block fw-bold text-primary" style={{ fontSize: "0.7rem", lineHeight: 1 }}>{listing?.hydrogenType}</span>
                      <span className="small text-muted" style={{ fontSize: "0.6rem" }}>H2 GAS</span>
                   </div>
                   <div>
                      <div className="fw-bold small">{listing?.companyName}</div>
                      <div className="text-muted" style={{ fontSize: "0.75rem" }}>{listing?.location} • ${listing?.price}/kg</div>
                   </div>
                </div>

                {error && <div className="alert alert-danger border-0 small py-2">{error}</div>}

                {!isAuthenticated && (
                  <div className="alert alert-warning border-0 small py-2 mb-4">
                    <i className="bi bi-info-circle me-2"></i>
                    You must be logged in as a <strong>Buyer</strong> to send inquiries.
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control rounded-3 border-light-subtle shadow-none"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your Name"
                    disabled={!isAuthenticated}
                  />
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Email</label>
                    <input
                      type="email"
                      name="email"
                      className="form-control rounded-3 border-light-subtle shadow-none"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="email@example.com"
                      disabled={!isAuthenticated}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-control rounded-3 border-light-subtle shadow-none"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="+91 XXXXX XXXXX"
                      disabled={!isAuthenticated}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-bold text-muted">Your Message</label>
                  <textarea
                    name="message"
                    rows="4"
                    className="form-control rounded-3 border-light-subtle shadow-none"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Enter your specific requirements..."
                    disabled={!isAuthenticated}
                  ></textarea>
                </div>

                <div className="d-flex gap-2">
                   <button type="button" className="btn btn-light w-100 py-2 rounded-3 fw-bold" onClick={onClose}>Cancel</button>
                   <button 
                     type="submit" 
                     className="btn btn-primary w-100 py-2 rounded-3 fw-bold shadow-sm"
                     disabled={loading || !isAuthenticated}
                   >
                     {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : "Send Inquiry"}
                   </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
