import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchListings, deleteListing } from "../../services/listingService.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";

export default function MyListings() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadListings = async () => {
    try {
      setLoading(true);
      const res = await fetchListings({ seller: user.id });
      setListings(res.data || []);
    } catch (err) {
      console.error("Error loading my listings:", err);
      showToast("Failed to load listings", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, [user.id]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) return;
    try {
      await deleteListing(id);
      showToast("Listing deleted successfully", "success");
      loadListings();
    } catch (err) {
      showToast("Failed to delete listing", "error");
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="bg-white rounded-4 shadow-sm border overflow-hidden">
      <div className="px-4 py-3 border-bottom d-flex justify-content-between align-items-center">
        <h5 className="mb-0 fw-bold">My Listings</h5>
        <Link to="/add-listing" className="btn btn-primary btn-sm px-3">
          <i className="bi bi-plus-lg me-1"></i> Add New
        </Link>
      </div>
      
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="bg-light">
            <tr>
              <th className="px-4 py-3 border-0 text-muted small fw-bold text-uppercase">Listing</th>
              <th className="py-3 border-0 text-muted small fw-bold text-uppercase">Price/Qty</th>
              <th className="py-3 border-0 text-muted small fw-bold text-uppercase">Status</th>
              <th className="px-4 py-3 border-0 text-muted small fw-bold text-uppercase text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {listings.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-5 text-muted">No listings found.</td></tr>
            ) : (
              listings.map(l => (
                <tr key={l._id}>
                  <td className="px-4 py-3">
                    <div className="d-flex align-items-center gap-3">
                      <div style={{ width: 48, height: 48, borderRadius: "10px", background: "#f1f5f9", overflow: "hidden" }}>
                        <img 
                          src={l.images?.[0] || "https://placehold.co/100x100?text=H2"} 
                          alt="" 
                          className="w-100 h-100 object-fit-cover"
                        />
                      </div>
                      <div>
                        <div className="fw-bold text-dark">{l.companyName}</div>
                        <div className="text-muted small">{l.hydrogenType} Hydrogen • {l.location}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-dark fw-medium">
                    ${l.price}/kg <br/>
                    <span className="text-muted small fw-normal">{l.quantity} units</span>
                  </td>
                  <td className="py-3">
                    <span className="badge rounded-pill bg-success-subtle text-success px-3 py-2 fw-semibold" style={{ fontSize: '0.7rem' }}>Active</span>
                  </td>
                  <td className="px-4 py-3 text-end">
                    <div className="d-flex justify-content-end gap-2">
                      <Link to={`/add-listing/${l._id}`} className="btn btn-outline-secondary btn-sm rounded-3">
                        <i className="bi bi-pencil"></i>
                      </Link>
                      <button onClick={() => handleDelete(l._id)} className="btn btn-outline-danger btn-sm rounded-3">
                        <i className="bi bi-trash"></i>
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
