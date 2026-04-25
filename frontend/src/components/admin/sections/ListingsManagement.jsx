import React, { useState, useEffect } from "react";
import api from "../../../services/api.js";

export default function ListingsManagement() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/listings", {
        params: { status: statusFilter, q: search, page }
      });
      setListings(res.data.listings);
      setTotalPages(res.data.pages);
    } catch (err) {
      console.error("Error fetching listings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [page, statusFilter]);

  const handleStatusUpdate = async (listingId, action) => {
    try {
      await api.put(`/api/admin/listings/${listingId}/${action}`);
      fetchListings();
    } catch (err) {
      alert(`Failed to ${action} listing`);
    }
  };

  const handleToggleFeature = async (listingId) => {
    try {
      await api.put(`/api/admin/listings/${listingId}/feature`);
      fetchListings();
    } catch (err) {
      alert("Failed to toggle feature");
    }
  };

  const handleDelete = async (listingId) => {
    if (!window.confirm("Delete this listing permanently?")) return;
    try {
      await api.delete(`/api/admin/listings/${listingId}`);
      fetchListings();
    } catch (err) {
      alert("Failed to delete listing");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved": return <span className="badge rounded-pill bg-success-subtle text-success px-3 py-1.5" style={{ fontSize: "0.7rem", fontWeight: 700 }}>APPROVED</span>;
      case "pending":  return <span className="badge rounded-pill bg-warning-subtle text-warning-emphasis px-3 py-1.5" style={{ fontSize: "0.7rem", fontWeight: 700 }}>PENDING</span>;
      case "rejected": return <span className="badge rounded-pill bg-danger-subtle text-danger px-3 py-1.5" style={{ fontSize: "0.7rem", fontWeight: 700 }}>REJECTED</span>;
      default:        return null;
    }
  };

  return (
    <div className="listings-management fade-in">
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-header bg-transparent p-4 border-0">
          <div className="row g-3 align-items-center">
            <div className="col-12 col-md-4">
              <h5 className="fw-bold mb-0">Manage Listings</h5>
            </div>
            <div className="col-12 col-md-8">
              <form className="d-flex flex-wrap gap-2 justify-content-md-end" onSubmit={(e) => { e.preventDefault(); setPage(1); fetchListings(); }}>
                <select 
                  className="form-select w-auto rounded-pill border-light-subtle shadow-sm px-3"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Status</option>
                  <option>Pending</option>
                  <option>Approved</option>
                  <option>Rejected</option>
                </select>
                <input 
                  type="text" 
                  className="form-control rounded-pill border-light-subtle shadow-sm px-4" 
                  style={{ maxWidth: 220 }}
                  placeholder="Filter by title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button type="submit" className="btn btn-danger rounded-pill px-4 shadow-sm">Filter</button>
              </form>
            </div>
          </div>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <th className="px-4 py-3">Product / Supplier</th>
                  <th className="py-3 text-center">Featured</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Created At</th>
                  <th className="px-4 py-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-5 text-muted">Refreshing listings...</td></tr>
                ) : listings.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-5 text-muted">No listings found.</td></tr>
                ) : listings.map(l => (
                  <tr key={l._id}>
                    <td className="px-4 py-3">
                      <div>
                        <div className="fw-bold text-dark mb-1" style={{ fontSize: "0.9rem" }}>{l.companyName}</div>
                        <div className="d-flex align-items-center gap-2">
                           <span className="badge bg-light text-muted border fw-normal" style={{ fontSize: "0.65rem" }}>{l.hydrogenType} H2</span>
                           <span className="text-muted small">by {l.supplier?.name || "Deleted User"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-center">
                       <button 
                         className={`btn btn-sm p-1 rounded-circle border-0 ${l.isFeatured ? "text-warning" : "text-muted opacity-25"}`}
                         onClick={() => handleToggleFeature(l._id)}
                       >
                         <i className={`bi bi-star${l.isFeatured ? "-fill" : ""} fs-5`}></i>
                       </button>
                    </td>
                    <td className="py-3">
                       {getStatusBadge(l.status)}
                    </td>
                    <td className="py-3 text-muted small">
                       {new Date(l.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-end">
                       <div className="d-flex gap-2 justify-content-end">
                          {l.status === "pending" && (
                            <>
                              <button className="btn btn-sm btn-success rounded-3 px-3 shadow-sm border-0 fw-bold" onClick={() => handleStatusUpdate(l._id, "approve")} style={{ fontSize: "0.75rem" }}>Approve</button>
                              <button className="btn btn-sm btn-outline-danger rounded-3 px-3 fw-bold" onClick={() => handleStatusUpdate(l._id, "reject")} style={{ fontSize: "0.75rem" }}>Reject</button>
                            </>
                          )}
                          <button className="btn btn-sm btn-light border rounded-3 p-2 text-danger" onClick={() => handleDelete(l._id)} title="Delete Listing">
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

        <div className="card-footer bg-transparent p-4 border-top">
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted small">Total platform listings: {listings.length} items</span>
            <div className="d-flex gap-2">
               <button className="btn btn-sm btn-light border rounded-pill px-3" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
               <button className="btn btn-sm btn-light border rounded-pill px-3" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
