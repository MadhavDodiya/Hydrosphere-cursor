import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMyListings, deleteListing } from "../../services/listingService.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";

export default function MyListings() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const loadListings = async () => {
      try {
        setLoading(true);
        const res = await fetchMyListings();
        setListings(res?.data || res || []);
      } catch (err) {
        console.error("Error loading my listings:", err);
        showToast("Failed to load listings", "error");
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      loadListings();
    }
  }, [user?._id]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      setDeletingId(id);
      await deleteListing(id);
      showToast("Listing deleted successfully", "success");
      // Bug fix: optimistic local removal instead of re-fetching entire list
      setListings(prev => prev.filter(l => l._id !== id));
    } catch (err) {
      showToast("Failed to delete listing", "error");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5 bg-white rounded-4 border">
        <div className="spinner-border text-primary mb-3"></div>
        <p className="text-secondary small">Fetching your marketplace listings...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-4 shadow-sm border overflow-hidden">
      <div className="px-4 py-3 border-bottom d-flex justify-content-between align-items-center bg-light-subtle">
        <h5 className="mb-0 fw-bold text-dark">Inventory Management</h5>
        <Link to="/add-listing" className="btn btn-primary btn-sm px-4 rounded-pill shadow-sm">
          <i className="bi bi-plus-lg me-2"></i>New Listing
        </Link>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead>
            <tr>
              <th className="px-4 py-3 border-0 text-muted small fw-bold text-uppercase" style={{ letterSpacing: '0.05em' }}>Product Details</th>
              <th className="py-3 border-0 text-muted small fw-bold text-uppercase" style={{ letterSpacing: '0.05em' }}>Pricing & Stock</th>
              <th className="py-3 border-0 text-muted small fw-bold text-uppercase" style={{ letterSpacing: '0.05em' }}>Visibility</th>
              <th className="px-4 py-3 border-0 text-muted small fw-bold text-uppercase text-end" style={{ letterSpacing: '0.05em' }}>Management</th>
            </tr>
          </thead>
          <tbody>
            {listings.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-5">
                  <div className="py-4">
                    <i className="bi bi-box-seam display-4 text-light mb-3 d-block"></i>
                    <h6 className="fw-bold text-dark">No Listings Found</h6>
                    <p className="text-muted small px-5">You haven't added any products to the marketplace yet. Start by creating your first listing!</p>
                    <Link to="/add-listing" className="btn btn-outline-primary btn-sm px-4 mt-2 rounded-pill">Create My First Listing</Link>
                  </div>
                </td>
              </tr>
            ) : (
              listings.map(l => (
                <tr key={l._id}>
                  <td className="px-4 py-3">
                    <div className="d-flex align-items-center gap-3">
                      <div className="shadow-sm border" style={{ width: 52, height: 52, borderRadius: "12px", background: "#f8fafc", overflow: "hidden" }}>
                        <img
                          src={l.images?.[0] || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&auto=format&fit=crop"}
                          alt=""
                          className="w-100 h-100 object-fit-cover"
                        />
                      </div>
                      <div>
                        <div className="fw-bold text-dark mb-0">{l.title || l.companyName}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          <span className="badge bg-primary-subtle text-primary border-primary-subtle fw-medium me-2">{l.hydrogenType} H2</span>
                          <i className="bi bi-geo-alt me-1"></i>{l.location}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="fw-bold text-dark">${l.price}<span className="text-muted small fw-normal">/kg</span></div>
                    <div className="text-secondary" style={{ fontSize: '0.8rem' }}>Stock: <span className="fw-medium">{l.quantity} units</span></div>
                  </td>
                  <td className="py-3">
                    <span className={`badge rounded-pill px-3 py-2 fw-semibold ${l.status === 'approved' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`} style={{ fontSize: '0.65rem', letterSpacing: '0.02em' }}>
                      {String(l.status || 'active').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-end">
                    <div className="d-flex justify-content-end gap-2">
                      <Link to={`/add-listing/${l._id}`} className="btn btn-light btn-sm rounded-circle border p-0 d-flex align-items-center justify-content-center shadow-sm" style={{ width: 32, height: 32 }} title="Edit">
                        <i className="bi bi-pencil-fill text-secondary" style={{ fontSize: '0.75rem' }}></i>
                      </Link>
                      <button onClick={() => handleDelete(l._id)} disabled={deletingId === l._id} className="btn btn-light btn-sm rounded-circle border p-0 d-flex align-items-center justify-content-center shadow-sm" style={{ width: 32, height: 32 }} title="Delete">
                        {deletingId === l._id ? (
                          <span className="spinner-border spinner-border-sm text-danger" />
                        ) : (
                          <i className="bi bi-trash3-fill text-danger" style={{ fontSize: '0.75rem' }}></i>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
