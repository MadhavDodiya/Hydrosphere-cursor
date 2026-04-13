import React, { useState, useEffect } from "react";
import InquiryModal from "./InquiryModal.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { saveListing, unsaveListing } from "../services/savedService.js";

export default function SupplierInfoCard({ listing, supplierName, location, rating, price }) {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [isSaved, setIsSaved] = useState(listing?.saved || false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setIsSaved(listing?.saved || false);
  }, [listing]);

  const toggleSave = async () => {
    if (!isAuthenticated) {
      showToast("Please sign in to save listings.");
      return;
    }
    if (!listing?._id || saving) return;

    setSaving(true);
    const nextState = !isSaved;
    try {
      if (nextState) {
        await saveListing(listing._id);
        showToast("Listing saved to your collection.", "success");
      } else {
        await unsaveListing(listing._id);
        showToast("Removed from saved.");
      }
      setIsSaved(nextState);
    } catch (err) {
      showToast("Failed to update saved status.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="supplier-sticky-card">
      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h4 className="card-title fw-bold mb-1">{supplierName}</h4>
              <p className="text-muted small mb-0"><i className="bi bi-geo-alt pe-1"></i>{location}</p>
            </div>
            <div className="trust-badge rounded-pill px-3 py-1 small d-flex align-items-center gap-1">
              <i className="bi bi-shield-check text-success"></i> Verified
            </div>
          </div>
          
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div className="d-flex align-items-center gap-2">
              <span className="text-warning fs-5"><i className="bi bi-star-fill"></i></span>
              <span className="fw-bold fs-5">{rating}</span>
            </div>
            <button 
              className={`btn btn-sm rounded-pill px-3 ${isSaved ? 'btn-danger' : 'btn-outline-danger'}`}
              onClick={toggleSave}
              disabled={saving}
            >
              <i className={`bi bi-heart${isSaved ? '-fill' : ''} me-1`}></i>
              {isSaved ? 'Saved' : 'Save'}
            </button>
          </div>

          <div className="price-section mb-4 p-3 bg-light rounded text-center">
            <span className="text-muted d-block small mb-1">Starting from</span>
            <h2 className="text-primary fw-bold mb-0">
              {price} <span className="fs-6 text-muted fw-normal">/kg</span>
            </h2>
          </div>

          <div className="d-flex flex-column gap-3 d-none d-lg-flex">
            <button 
              className="btn btn-primary btn-lg fw-medium shadow-sm w-100"
              onClick={() => setShowModal(true)}
            >
              Request Quote
            </button>
            <button 
              className="btn btn-outline-secondary btn-lg fw-medium w-100"
              onClick={() => setShowModal(true)}
            >
              Contact Supplier
            </button>
          </div>

          <hr className="my-4 text-muted" />

          <ul className="list-unstyled mb-0 small text-secondary d-flex flex-column gap-2">
            <li><i className="bi bi-clock-history text-primary pe-2"></i> Response time: &lt; 24h</li>
            <li><i className="bi bi-truck text-primary pe-2"></i> Standard &amp; Express Delivery</li>
            <li><i className="bi bi-patch-check text-primary pe-2"></i> ISO 9001 Certified</li>
          </ul>
        </div>
      </div>
      
      {/* Mobile Sticky Action Bar */}
      <div className="mobile-sticky-action d-lg-none">
        <button className="btn btn-outline-secondary fw-medium w-50" onClick={() => setShowModal(true)}>Contact</button>
        <button className="btn btn-primary fw-medium shadow-sm w-50" onClick={() => setShowModal(true)}>Request Quote</button>
      </div>

      {listing && (
        <InquiryModal 
          listing={listing} 
          show={showModal} 
          onClose={() => setShowModal(false)} 
        />
      )}
    </div>
  );
}
