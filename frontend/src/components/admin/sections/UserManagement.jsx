import React, { useState, useEffect } from "react";
import api from "../../../services/api.js";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let cancelled = false;
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const params = { page };
        if (search.trim()) params.q = search.trim();
        if (roleFilter !== "All") params.role = roleFilter.toLowerCase();
        const res = await api.get("/api/admin/users", { params });
        if (!cancelled) {
          setUsers(res.data?.users || []);
          setTotalPages(res.data?.pages || 1);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchUsers();
    return () => { cancelled = true; };
  }, [page, roleFilter, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to page 1; useEffect will pick up the search change
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/api/admin/users/${userId}/role`, { role: newRole });
      // Optimistic update: reflect the role change immediately in local state
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error("Failed to update role", err);
    }
  };

  const handleToggleSuspend = async (userId, currentState) => {
    try {
      await api.put(`/api/admin/users/${userId}/suspend`, { suspend: !currentState });
      // Optimistic update
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isSuspended: !currentState } : u));
    } catch (err) {
      console.error("Failed to update suspension status", err);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      await api.delete(`/api/admin/users/${userId}`);
      // Remove from local state immediately
      setUsers(prev => prev.filter(u => u._id !== userId));
    } catch (err) {
      console.error("Failed to delete user", err);
    }
  };

  return (
    <div className="user-management fade-in">
      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-header bg-transparent p-4 border-0">
          <div className="row g-3 align-items-center">
            <div className="col-12 col-md-4">
              <h5 className="fw-bold mb-0">Platform Users</h5>
            </div>
            <div className="col-12 col-md-8">
              <form onSubmit={handleSearch} className="d-flex flex-wrap gap-2 justify-content-md-end">
                <select 
                  className="form-select w-auto rounded-pill border-light-subtle shadow-sm px-3"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="All">All Roles</option>
                  <option>Buyer</option>
                  <option>Seller</option>
                  <option>Admin</option>
                </select>
                <div className="position-relative">
                  <i className="bi bi-search position-absolute top-50 translate-middle-y ms-3 text-muted"></i>
                  <input 
                    type="text" 
                    className="form-control rounded-pill ps-5 border-light-subtle shadow-sm"
                    placeholder="Search name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-danger rounded-pill px-4 shadow-sm">Search</button>
              </form>
            </div>
          </div>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <th className="px-4 py-3">User Instance</th>
                  <th className="py-3">Role</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Joined Date</th>
                  <th className="px-4 py-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-5 text-muted">Loading platform users...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-5 text-muted">No users found.</td></tr>
                ) : users.map(u => (
                  <tr key={u._id}>
                    <td className="px-4 py-3">
                      <div className="d-flex align-items-center gap-3">
                        <div style={{ width: 36, height: 36, borderRadius: "10px", background: "#f8fafc", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.8rem" }}>
                          {/* Bug fix: guard against null/empty name before calling [0] */}
                          {(u.name?.[0] || "?").toUpperCase()}
                        </div>
                        <div>
                          <div className="fw-bold text-dark mb-0" style={{ fontSize: "0.9rem" }}>{u.name}</div>
                          <div className="text-muted small">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <select 
                        className="form-select form-select-sm w-auto rounded-3 border-light-subtle bg-light small"
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      >
                        <option value="buyer">Buyer</option>
                        <option value="seller">Seller</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="py-3">
                      {u.isSuspended ? (
                        <span className="badge rounded-pill bg-danger-subtle text-danger px-3 py-1.5" style={{ fontSize: "0.7rem", fontWeight: 700 }}>SUSPENDED</span>
                      ) : (
                        <span className="badge rounded-pill bg-success-subtle text-success px-3 py-1.5" style={{ fontSize: "0.7rem", fontWeight: 700 }}>ACTIVE</span>
                      )}
                    </td>
                    <td className="py-3 text-muted small">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-end">
                      <div className="d-flex gap-2 justify-content-end">
                        <button 
                          className={`btn btn-sm rounded-3 p-2 ${u.isSuspended ? "btn-danger" : "btn-light border"}`} 
                          onClick={() => handleToggleSuspend(u._id, u.isSuspended)}
                          title={u.isSuspended ? "Activate User" : "Suspend User"}
                        >
                          <i className={`bi bi-${u.isSuspended ? "check-circle" : "slash-circle"}`}></i>
                        </button>
                        <button className="btn btn-sm btn-light border rounded-3 p-2 text-danger" onClick={() => handleDelete(u._id)} title="Delete Permanently">
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

        {/* Pagination placeholder */}
        <div className="card-footer bg-transparent p-4 border-top">
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted small">Showing {users.length} users</span>
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
