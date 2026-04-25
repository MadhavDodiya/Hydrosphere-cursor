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

const TYPES = ["Green Hydrogen", "Blue Hydrogen", "Grey Hydrogen"];

const typeColors = {
  "Green Hydrogen": { bg: "bg-[#34C759]/10", border: "border-[#34C759]", text: "text-[#34C759]" },
  "Blue Hydrogen":  { bg: "bg-[#0071E3]/10", border: "border-[#0071E3]", text: "text-[#0071E3]" },
  "Grey Hydrogen":  { bg: "bg-[#8E8E93]/10", border: "border-[#8E8E93]", text: "text-[#8E8E93]" },
};

export default function AddListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState("");
  const [hydrogenType, setHydrogenType] = useState("Green Hydrogen");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [location, setLocation] = useState("");
  const [purity, setPurity] = useState("99.9");
  const [productionCapacity, setProductionCapacity] = useState("");
  const [deliveryAvailability, setDeliveryAvailability] = useState("Available");
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
        const found = response;
        if (cancelled) return;
        if (!found) { setError("Listing not found."); setLoading(false); return; }
        
        if (found.supplier?._id !== user._id && found.supplier !== user._id) {
          setError("You do not have permission to edit this listing.");
          setLoading(false);
          return;
        }

        setTitle(found.title || found.companyName || "");
        setHydrogenType(found.hydrogenType);
        setPrice(String(found.price));
        setQuantity(String(found.quantity));
        setLocation(found.location);
        setPurity(found.purity != null ? String(found.purity) : "99.9");
        setProductionCapacity(found.productionCapacity ?? "");
        setDeliveryAvailability(found.deliveryAvailability ?? "Available");
        setDescription(found.description ?? "");
      } catch (err) {
        if (!cancelled) { const msg = getApiErrorMessage(err, "Failed to load listing."); setError(msg); showToast(msg); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id, isEdit, user?._id, user?.role]);

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
    const trimmedTitle = title.trim();
    formData.append("title", trimmedTitle);
    formData.append("companyName", trimmedTitle);
    formData.append("hydrogenType", hydrogenType);
    formData.append("price", p);
    formData.append("quantity", q);
    formData.append("location", location.trim());
    if (pu != null) formData.append("purity", pu);
    formData.append("productionCapacity", productionCapacity.trim());
    formData.append("deliveryAvailability", deliveryAvailability.trim());
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
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-6">
      <div className="animate-apple text-center">
        <div className="w-12 h-12 border-4 border-[#0071E3]/20 border-t-[#0071E3] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#86868b] font-bold text-sm tracking-widest uppercase">Fetching Data...</p>
      </div>
    </div>
  );

  if (user?.role === 'supplier' && !user?.isApproved && !isEdit) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-6">
        <div className="bg-white rounded-[32px] p-12 max-w-lg text-center shadow-2xl shadow-black/5 animate-apple border border-black/5">
          <div className="w-20 h-20 bg-[#FF9500]/10 rounded-full flex items-center justify-center mx-auto mb-8 text-[#FF9500] text-4xl">
            <i className="bi bi-hourglass-split" />
          </div>
          <h2 className="text-2xl font-black text-[#1d1d1f] mb-4">Pending Approval</h2>
          <p className="text-[#86868b] text-base leading-relaxed mb-10 font-medium">
            Your supplier account is currently under review by our admin team.<br/>You'll receive an email at <span className="text-[#1d1d1f] font-bold underline">{user?.email}</span> once approved.
          </p>
          <Link to="/dashboard" className="btn-primary inline-flex px-10">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] py-12 px-6 selection:bg-[#0071E3]/20">
      <div className="max-w-3xl mx-auto animate-apple">
        
        {/* Breadcrumb Header */}
        <div className="mb-10">
          <nav className="mb-4">
            <ol className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-[#86868b]">
              <li><Link to="/dashboard" className="hover:text-[#0071E3] transition-colors">Dashboard</Link></li>
              <li><i className="bi bi-chevron-right text-[8px]" /></li>
              <li className="text-[#1d1d1f]">{isEdit ? "Edit" : "New"} Listing</li>
            </ol>
          </nav>
          <h1 className="text-3xl font-extrabold text-[#1d1d1f] tracking-tight">{isEdit ? "✏️ Update Assets" : "🚀 Publish Supply"}</h1>
          <p className="text-[#86868b] mt-1">Configure your hydrogen asset for the global marketplace.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Main Info Card */}
          <div className="bg-white rounded-[32px] p-8 md:p-12 shadow-sm border border-black/[0.03]">
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-8 flex gap-3 animate-apple">
                <i className="bi bi-exclamation-circle text-red-500 mt-0.5" />
                <div className="text-sm text-red-600 font-medium leading-relaxed">{error}</div>
              </div>
            )}

            <div className="space-y-8">
              
              {/* Title Section */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#86868b] uppercase tracking-widest ml-1">Asset Title / Name</label>
                <div className="relative group">
                  <i className="bi bi-tag absolute left-4 top-1/2 -translate-y-1/2 text-[#86868b] group-focus-within:text-[#0071E3] transition-colors" />
                  <input
                    required
                    minLength={2}
                    className="form-control w-full pl-12"
                    placeholder="e.g. Premium Green H2 Supply Hub"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
              </div>

              {/* Hydrogen Type - Segmented Control Aesthetic */}
              <div className="space-y-4">
                <label className="text-[11px] font-bold text-[#86868b] uppercase tracking-widest ml-1 block">Production Pathway</label>
                <div className="grid grid-cols-3 gap-3">
                  {TYPES.map(t => {
                    const active = hydrogenType === t;
                    return (
                      <button 
                        key={t} 
                        type="button" 
                        onClick={() => setHydrogenType(t)}
                        className={`py-3 rounded-[18px] border-2 text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                          active 
                            ? `${typeColors[t].bg} ${typeColors[t].border} ${typeColors[t].text} shadow-lg shadow-black/5 scale-[1.02]` 
                            : 'bg-[#F5F5F7] border-transparent text-[#86868b] hover:bg-[#e8e8ed]'
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pricing & Units */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#86868b] uppercase tracking-widest ml-1">Rate (USD / kg)</label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868b] font-bold group-focus-within:text-[#0071E3]">$</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="form-control w-full pl-10"
                      placeholder="4.50"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#86868b] uppercase tracking-widest ml-1">Lot Size (kg)</label>
                  <div className="relative group">
                    <i className="bi bi-boxes absolute left-4 top-1/2 -translate-y-1/2 text-[#86868b] group-focus-within:text-[#0071E3]" />
                    <input
                      type="number"
                      required
                      className="form-control w-full pl-12"
                      placeholder="1000"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Technical Stack */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#86868b] uppercase tracking-widest ml-1">Location Hub</label>
                  <div className="relative group">
                    <i className="bi bi-geo-alt absolute left-4 top-1/2 -translate-y-1/2 text-[#86868b] group-focus-within:text-[#0071E3]" />
                    <input
                      required
                      className="form-control w-full pl-12"
                      placeholder="City, Country"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#86868b] uppercase tracking-widest ml-1">Certified Purity (%)</label>
                  <div className="relative group">
                    <i className="bi bi-patch-check absolute left-4 top-1/2 -translate-y-1/2 text-[#86868b] group-focus-within:text-[#0071E3]" />
                    <input
                      type="number"
                      step="0.01"
                      className="form-control w-full pl-12"
                      placeholder="99.9"
                      value={purity}
                      onChange={(e) => setPurity(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="space-y-2">
                <div className="flex justify-between ml-1">
                  <label className="text-[11px] font-bold text-[#86868b] uppercase tracking-widest">Supply Terms & Overview</label>
                  <span className="text-[10px] font-bold text-[#c1c1c6] uppercase tracking-widest">{description.length}/5000</span>
                </div>
                <textarea
                  required
                  minLength={10}
                  className="form-control w-full min-h-[160px] resize-none"
                  placeholder="Describe certifications, storage conditions, and fulfillment terms..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Media Section */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#86868b] uppercase tracking-widest ml-1">Media Assets (Images)</label>
                <div className="relative group">
                   <input
                     type="file"
                     multiple
                     accept="image/*"
                     className="block w-full text-xs text-[#86868b] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-[#0071E3] file:text-white hover:file:bg-[#0077ED] cursor-pointer bg-[#F5F5F7] p-2 rounded-[18px]"
                     onChange={(e) => setImageFiles(e.target.files)}
                   />
                </div>
              </div>

            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-6">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full sm:flex-1 py-4 text-base font-black shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <i className={`bi ${isEdit ? 'bi-pencil-square' : 'bi-rocket-takeoff'} text-lg`} />
                  {isEdit ? "Update Listing" : "Publish Listing"}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="w-full sm:w-auto px-10 py-4 text-sm font-black text-[#86868b] uppercase tracking-widest hover:text-[#1d1d1f] transition-colors"
            >
              Discard
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
