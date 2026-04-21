import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import Loader from "../components/Loader.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import {
  createListing,
  updateListing,
  fetchListingById,
} from "../services/listingService.js";
import { useToast } from "../context/ToastContext.jsx";
import { getApiErrorMessage } from "../utils/apiError.js";

const TYPES = ["Green", "Blue", "Grey"];

const typeColors = {
  Green: { bg: "#f0fdf4", border: "#86efac", text: "#16a34a", dot: "#22c55e" },
  Blue:  { bg: "#eff6ff", border: "#93c5fd", text: "#2563eb", dot: "#3b82f6" },
  Grey:  { bg: "#f8fafc", border: "#cbd5e1", text: "#64748b", dot: "#94a3b8" },
};

export default function AddListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const isEdit = Boolean(id);

  const [companyName, setCompanyName] = useState("");
  const [hydrogenType, setHydrogenType] = useState("Green");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [location, setLocation] = useState("");
  const [purity, setPurity] = useState("99.9");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);

  useEffect(() => {
    if (!isEdit || !user?._id) return;
    let cancelled = false;
    (async () => {
      try {
        const response = await fetchListingById(id);
        const found = response; // fetchListingById returns the listing object directly
        if (cancelled) return;
        if (!found) { setError("Listing not found."); setLoading(false); return; }
        
        // Security check: Ensure the listing belongs to the current user
        // The backend should also enforce this, but good to have here.
        if (found.seller?._id !== user._id && found.seller !== user._id) {
          setError("You do not have permission to edit this listing.");
          setLoading(false);
          return;
        }

        setCompanyName(found.companyName);
        setHydrogenType(found.hydrogenType);
        setPrice(String(found.price));
        setQuantity(String(found.quantity));
        setLocation(found.location);
        setPurity(found.purity != null ? String(found.purity) : "99.9");
        setDescription(found.description ?? "");
      } catch (err) {
        if (!cancelled) { const msg = getApiErrorMessage(err, "Failed to load listing."); setError(msg); showToast(msg); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, isEdit, user, showToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const desc = description.trim();
    if (desc.length < 10) { setError("Description must be at least 10 characters."); return; }
    const p = Number(price);
    const q = Number(quantity);
    const pu = purity === "" || purity == null ? null : Number(purity);
    if (Number.isNaN(p) || p < 0) { setError("Enter a valid price (0 or greater)."); return; }
    if (Number.isNaN(q) || q < 0 || !Number.isInteger(q)) { setError("Enter a valid whole-number quantity."); return; }
    if (pu != null && (Number.isNaN(pu) || pu < 0 || pu > 100)) { setError("Enter a valid purity between 0 and 100."); return; }
    setSubmitting(true);

    const formData = new FormData();
    formData.append("companyName", companyName.trim());
    formData.append("hydrogenType", hydrogenType);
    formData.append("price", p);
    formData.append("quantity", q);
    formData.append("location", location.trim());
    if (pu != null) formData.append("purity", pu);
    formData.append("description", desc);
    Array.from(imageFiles).forEach((file) => formData.append("images", file));

    try {
      if (isEdit) { await updateListing(id, formData); } else { await createListing(formData); }
      showToast(isEdit ? "Listing updated." : "Listing created!", "success");
      navigate("/dashboard");
    } catch (err) {
      const msg = getApiErrorMessage(err, "Save failed");
      setError(msg); showToast(msg);
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "60vh" }}>
      <Loader label="Loading listing…" />
    </div>
  );

  const inputStyle = { borderRadius: "12px", border: "1.5px solid #e2e8f0", padding: "0.75rem 1rem", fontSize: "0.9rem", width: "100%", outline: "none", transition: "border-color 0.2s, box-shadow 0.2s", background: "white" };
  const labelStyle = { fontSize: "0.875rem", fontWeight: 600, color: "#374151", marginBottom: "0.4rem", display: "block" };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f8faff 0%, #f0f7ff 100%)" }} className="py-5">
      <div className="container" style={{ maxWidth: "720px" }}>

        {/* Header breadcrumb */}
        <div className="mb-4">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-2" style={{ fontSize: "0.85rem" }}>
              <li className="breadcrumb-item"><Link to="/dashboard" className="text-decoration-none text-muted">Dashboard</Link></li>
              <li className="breadcrumb-item active text-dark fw-medium">{isEdit ? "Edit Listing" : "New Listing"}</li>
            </ol>
          </nav>
          <h1 className="fw-bold mb-1" style={{ fontSize: "1.8rem", color: "#0f172a" }}>
            {isEdit ? "✏️ Edit Listing" : "🚀 Add New Listing"}
          </h1>
          <p className="text-muted" style={{ fontSize: "0.9rem" }}>Fill in the details to {isEdit ? "update your" : "publish a new"} hydrogen listing</p>
        </div>

        <div className="card border-0 shadow-sm" style={{ borderRadius: "20px", overflow: "hidden" }}>

          {/* Card Header */}
          <div className="px-4 px-md-5 py-3 border-bottom" style={{ background: "linear-gradient(135deg, #f8faff, #eff6ff)" }}>
            <div className="d-flex align-items-center gap-2">
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2563eb" }}></div>
              <span className="fw-semibold text-dark" style={{ fontSize: "0.9rem" }}>Listing Information</span>
            </div>
          </div>

          <div className="p-4 p-md-5">
            {error && (
              <div className="d-flex align-items-start gap-3 p-3 mb-4" style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px" }}>
                <i className="bi bi-exclamation-circle-fill text-danger flex-shrink-0 mt-1"></i>
                <span style={{ fontSize: "0.875rem", color: "#dc2626" }}>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="d-flex flex-column gap-4">

              {/* Company Name */}
              <div>
                <label htmlFor="companyName" style={labelStyle}>Company Name *</label>
                <div className="position-relative">
                  <i className="bi bi-building position-absolute top-50 translate-middle-y ms-3" style={{ color: "#94a3b8", pointerEvents: "none" }}></i>
                  <input id="companyName" required minLength={2} style={{ ...inputStyle, paddingLeft: "2.75rem" }}
                    placeholder="e.g. HydroGen Solutions Ltd." value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                </div>
              </div>

              {/* Hydrogen Type */}
              <div>
                <label style={labelStyle}>Hydrogen Type *</label>
                <div className="d-flex gap-3 flex-wrap">
                  {TYPES.map(t => {
                    const c = typeColors[t];
                    return (
                      <button key={t} type="button" onClick={() => setHydrogenType(t)}
                        style={{
                          flex: "1 1 100px", padding: "0.8rem 1rem", border: `2px solid ${hydrogenType === t ? c.dot : "#e2e8f0"}`,
                          borderRadius: "12px", background: hydrogenType === t ? c.bg : "white",
                          cursor: "pointer", transition: "all 0.2s ease"
                        }}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <span style={{ width: 10, height: 10, borderRadius: "50%", background: c.dot, display: "inline-block", flexShrink: 0 }}></span>
                          <span style={{ fontWeight: 600, fontSize: "0.875rem", color: hydrogenType === t ? c.text : "#64748b" }}>{t} Hydrogen</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price & Quantity */}
              <div className="row g-3">
                <div className="col-12 col-sm-6">
                  <label htmlFor="price" style={labelStyle}>Price (USD/kg) *</label>
                  <div className="position-relative">
                    <span className="position-absolute top-50 translate-middle-y ms-3 fw-semibold" style={{ color: "#94a3b8", fontSize: "0.9rem" }}>$</span>
                    <input id="price" type="number" min={0} step="0.01" required style={{ ...inputStyle, paddingLeft: "2rem" }}
                      placeholder="0.00" value={price} onChange={(e) => setPrice(e.target.value)} />
                  </div>
                </div>
                <div className="col-12 col-sm-6">
                  <label htmlFor="quantity" style={labelStyle}>Quantity (units) *</label>
                  <div className="position-relative">
                    <i className="bi bi-boxes position-absolute top-50 translate-middle-y ms-3" style={{ color: "#94a3b8", pointerEvents: "none" }}></i>
                    <input id="quantity" type="number" min={0} step={1} required style={{ ...inputStyle, paddingLeft: "2.75rem" }}
                      placeholder="e.g. 500" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" style={labelStyle}>Location *</label>
                <div className="position-relative">
                  <i className="bi bi-geo-alt position-absolute top-50 translate-middle-y ms-3" style={{ color: "#94a3b8", pointerEvents: "none" }}></i>
                  <input id="location" required minLength={2} style={{ ...inputStyle, paddingLeft: "2.75rem" }}
                    placeholder="e.g. Berlin, Germany" value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>
              </div>

              {/* Purity */}
              <div className="row g-3">
                <div className="col-12 col-sm-6">
                  <label htmlFor="purity" style={labelStyle}>Hydrogen Purity (%)</label>
                  <div className="position-relative">
                    <i className="bi bi-shield-check position-absolute top-50 translate-middle-y ms-3" style={{ color: "#94a3b8", pointerEvents: "none" }}></i>
                    <input
                      id="purity"
                      type="number"
                      min={0}
                      max={100}
                      step="0.1"
                      style={{ ...inputStyle, paddingLeft: "2.75rem" }}
                      placeholder="e.g. 99.9"
                      value={purity}
                      onChange={(e) => setPurity(e.target.value)}
                    />
                  </div>
                  <div className="text-muted mt-1" style={{ fontSize: "0.75rem" }}>
                    Optional, used for marketplace filtering.
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" style={labelStyle}>Description *
                  <span className="fw-normal text-muted ms-1" style={{ fontSize: "0.8rem" }}>(min 10 chars, max 5000)</span>
                </label>
                <textarea id="description" required rows={5} minLength={10} maxLength={5000}
                  style={{ ...inputStyle, resize: "vertical", minHeight: "130px" }}
                  placeholder="Describe supply terms, certifications, delivery timelines, compliance details…"
                  value={description} onChange={(e) => setDescription(e.target.value)}
                />
                <div className="text-end mt-1" style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{description.length} / 5000</div>
              </div>

              {/* Images */}
              <div>
                <label htmlFor="images" style={labelStyle}>Product Images (Optional)</label>
                <div className="position-relative">
                  <i className="bi bi-images position-absolute top-50 translate-middle-y ms-3" style={{ color: "#94a3b8", pointerEvents: "none" }}></i>
                  <input id="images" type="file" multiple accept="image/*" style={{ ...inputStyle, paddingLeft: "2.75rem" }}
                    onChange={(e) => setImageFiles(e.target.files)} />
                </div>
              </div>

              {/* Actions */}
              <div className="d-flex flex-column flex-sm-row gap-3 pt-2">
                <button type="submit" disabled={submitting}
                  className="btn fw-semibold flex-fill"
                  style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)", color: "white", borderRadius: "12px", padding: "0.8rem", fontSize: "0.95rem", border: "none", boxShadow: "0 4px 15px rgba(37,99,235,0.3)", opacity: submitting ? 0.8 : 1 }}>
                  {submitting ? <span><span className="spinner-border spinner-border-sm me-2"></span>Saving…</span>
                    : <span><i className={`bi ${isEdit ? "bi-pencil-square" : "bi-rocket-takeoff"} me-2`}></i>{isEdit ? "Update Listing" : "Publish Listing"}</span>}
                </button>
                <button type="button" onClick={() => navigate("/dashboard")}
                  className="btn fw-medium"
                  style={{ borderRadius: "12px", padding: "0.8rem 1.5rem", border: "1.5px solid #e2e8f0", color: "#64748b", background: "white" }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
