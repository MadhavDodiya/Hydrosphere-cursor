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
      // Fetch saved listings context (Task #2/5)
      const { data } = await api.get("/api/saved");
      console.log("SAVED_LISTINGS_DATA:", data);

      const payload = data?.data ?? data;
      const arr = Array.isArray(payload) ? payload : [];

      // Backend may return full listing docs OR SavedListing rows with populated listing refs.
      const mapped =
        arr.length > 0 && (arr[0]?.listing || arr[0]?.listingId)
          ? arr.map((item) => item.listingId || item.listing).filter(Boolean)
          : arr.filter((x) => x && x._id);

      setListings(mapped);
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
      showToast("Listing removed from bookmarks", "success");
      fetchSaved();
    } catch (err) {
      showToast("Failed to remove listing", "error");
    }
  };

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5 bg-white rounded-4 border">
        <div className="spinner-border text-primary mb-3"></div>
        <p className="text-secondary small">Loading your bookmarked listings...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-4 shadow-sm border overflow-hidden">
      <div className="px-4 py-3 border-bottom bg-light-subtle d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-bold text-dark">Bookmarked Inventory</h5>
        <span className="badge bg-primary rounded-pill px-3 py-2 fw-semibold" style={{ fontSize: '0.7rem' }}>
          {listings.length} Saved
        </span>
      </div>
      
      <div className="p-4">
        {listings.length === 0 ? (
          <div className="text-center py-5">
            <div className="mb-3">
              <i className="bi bi-bookmark-plus text-light-emphasis display-3"></i>
            </div>
            <h6 className="fw-bold text-dark">No Saved Listings</h6>
            <p className="text-muted small mb-4">You haven't bookmarked any listings yet. Browse the marketplace to find products you're interested in.</p>
            <Link to="/marketplace" className="btn btn-primary rounded-pill px-5 fw-medium shadow-sm">
              Explore Marketplace
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            {listings.map(l => (
              <div key={l._id} className="col-12 col-md-6 col-xl-4">
                <div className="card h-100 border-0 shadow-sm overflow-hidden hover-lift" style={{ borderRadius: "20px", border: "1px solid #f1f5f9" }}>
                  <div className="position-relative">
                    <img 
                      src={l.images?.[0] || "https://images.unsplash.com/photo-1518623489648-a173ef7824f3?w=400&auto=format"} 
                      className="card-img-top object-fit-cover" 
                      alt="" 
                      style={{ height: "180px" }}
                    />
                    <div className="position-absolute top-0 end-0 p-2">
                       <button 
                         onClick={() => removeSaved(l._id)} 
                         className="btn btn-white btn-sm rounded-circle shadow-sm d-flex align-items-center justify-content-center"
                         style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.9)' }} 
                         title="Remove Bookmark"
                       >
                         <i className="bi bi-heart-fill text-danger" style={{ fontSize: '0.8rem' }}></i>
                       </button>
                    </div>
                  </div>
                  <div className="card-body p-4 d-flex flex-column">
                    <div className="mb-2">
                       <span className="badge bg-primary-subtle text-primary border-primary-subtle rounded-pill px-3 py-2" style={{ fontSize: '0.65rem', fontWeight: 600 }}>{String(l.hydrogenType).toUpperCase()} H2</span>
                    </div>
                    <h6 className="fw-bold text-dark text-truncate mb-1">{l.title || l.companyName}</h6>
                    <p className="text-muted small mb-4">
                      <i className="bi bi-geo-alt me-1 text-primary"></i>{l.location}
                    </p>
                    <div className="d-flex justify-content-between align-items-center mt-auto">
                      <div className="fw-bold fs-5 text-dark">${l.price}<span className="text-muted fs-6 fw-normal">/kg</span></div>
                      <Link to={`/listings/${l._id}`} className="btn btn-sm btn-primary px-4 rounded-pill fw-medium shadow-sm" style={{ fontSize: '0.8rem' }}>
                        View Info
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
