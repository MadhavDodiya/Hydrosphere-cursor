import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api.js";
import { useToast } from "../../context/ToastContext.jsx";

export default function SavedListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchSaved = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/saved");
      setListings(data.map(item => item.listingId).filter(Boolean));
    } catch (err) {
      console.error("Error fetching saved listings:", err);
      showToast("Failed to load saved listings", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const removeSaved = async (id) => {
    try {
      await api.delete(`/api/saved/${id}`);
      showToast("Listing removed from saved", "success");
      fetchSaved();
    } catch (err) {
      showToast("Failed to remove listing", "error");
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="bg-white rounded-4 shadow-sm border overflow-hidden">
      <div className="px-4 py-3 border-bottom">
        <h5 className="mb-0 fw-bold">Saved Listings</h5>
      </div>
      
      <div className="p-4">
        {listings.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-bookmark-heart text-muted display-4 mb-3"></i>
            <p className="text-muted mb-4">You haven't saved any listings yet.</p>
            <Link to="/marketplace" className="btn btn-primary px-4 fw-medium">
              Explore Marketplace
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            {listings.map(l => (
              <div key={l._id} className="col-12 col-md-6 col-xl-4">
                <div className="card h-100 border-0 shadow-sm overflow-hidden" style={{ borderRadius: "16px", border: "1px solid #f1f5f9" }}>
                  <img 
                    src={l.images?.[0] || "https://placehold.co/400x200?text=H2+Listing"} 
                    className="card-img-top object-fit-cover" 
                    alt="" 
                    style={{ height: "160px" }}
                  />
                  <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                       <span className="badge bg-primary-subtle text-primary border-0 rounded-pill px-2 py-1" style={{ fontSize: '0.65rem' }}>{l.hydrogenType} H2</span>
                       <button onClick={() => removeSaved(l._id)} className="btn btn-link p-0 text-danger" title="Remove">
                         <i className="bi bi-heart-fill"></i>
                       </button>
                    </div>
                    <h6 className="fw-bold text-dark text-truncate mb-1">{l.companyName}</h6>
                    <p className="text-muted small mb-3">
                      <i className="bi bi-geo-alt me-1"></i>{l.location}
                    </p>
                    <div className="d-flex justify-content-between align-items-center mt-auto">
                      <div className="fw-bold text-primary">${l.price}/kg</div>
                      <Link to={`/listings/${l._id}`} className="btn btn-sm btn-outline-primary px-3 rounded-pill fw-medium" style={{ fontSize: '0.75rem' }}>
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
