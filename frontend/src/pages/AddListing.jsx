import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Button, Input, Card, Badge } from "../components/ui";
import {
  createListing,
  updateListing,
  fetchListingById,
} from "../services/listingService.js";
import { useToast } from "../context/ToastContext.jsx";
import { getApiErrorMessage } from "../utils/apiError.js";

const TYPES = ["Green Hydrogen", "Blue Hydrogen", "Grey Hydrogen"];

export default function AddListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    title: "",
    hydrogenType: "Green Hydrogen",
    price: "",
    quantity: "",
    location: "",
    purity: "99.9",
    productionCapacity: "",
    deliveryAvailability: "Available",
    description: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);

  useEffect(() => {
    if (!isEdit || !user?._id) return;
    const fetch = async () => {
      try {
        setLoading(true);
        const found = await fetchListingById(id);
        if (!found) { setError("Listing not found."); return; }
        
        if (found.supplier?._id !== user._id && found.supplier !== user._id) {
          setError("Access denied.");
          return;
        }

        setFormData({
          title: found.title || "",
          hydrogenType: found.hydrogenType,
          price: String(found.price || found.pricePerKg || ""),
          quantity: String(found.quantity || found.minOrderQuantity || ""),
          location: found.location,
          purity: String(found.purity || "99.9"),
          productionCapacity: found.productionCapacity || "",
          deliveryAvailability: found.deliveryAvailability || "Available",
          description: found.description || "",
        });
      } catch (err) {
        setError(getApiErrorMessage(err, "Failed to load listing."));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, isEdit, user?._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const submissionData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      submissionData.append(key, value);
    });
    
    // Support legacy field names for backend compatibility if needed
    submissionData.append("pricePerKg", formData.price);
    submissionData.append("minOrderQuantity", formData.quantity);

    Array.from(imageFiles).forEach((file) => submissionData.append("images", file));

    try {
      if (isEdit) { 
        await updateListing(id, submissionData); 
      } else { 
        await createListing(submissionData); 
      }
      showToast(isEdit ? "Asset updated successfully." : "Asset published to marketplace!", "success");
      navigate("/dashboard");
    } catch (err) {
      setError(getApiErrorMessage(err, "Submission failed"));
      showToast("Check form for errors", "error");
    } finally { 
      setSubmitting(false); 
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-black/5 border-t-[#0071E3] rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F5F7] py-20 px-6 selection:bg-[#0071E3]/10">
      <div className="max-w-4xl mx-auto animate-apple">
        
        {/* Header */}
        <div className="mb-12">
          <Link to="/dashboard" className="text-sm font-black text-[#86868b] hover:text-[#0071E3] flex items-center gap-2 mb-6 transition-colors">
            <i className="bi bi-arrow-left" /> Back to Dashboard
          </Link>
          <Badge variant="primary" className="mb-4">{isEdit ? 'Asset Management' : 'Global Distribution'}</Badge>
          <h1 className="text-4xl font-black text-[#1d1d1f] tracking-tight">
            {isEdit ? 'Update Asset' : 'Publish New Asset'}
          </h1>
          <p className="text-[#86868b] font-medium mt-2">Enter technical specifications and pricing for your hydrogen supply.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          <Card className="p-10 md:p-14 border-none shadow-2xl shadow-black/[0.03]" hover={false}>
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-10 flex gap-3 animate-apple">
                <i className="bi bi-exclamation-circle-fill text-red-500 mt-0.5" />
                <div className="text-sm text-red-600 font-bold leading-relaxed">{error}</div>
              </div>
            )}

            <div className="space-y-10">
              <Input
                label="Asset Title"
                placeholder="e.g. Ultra-Pure Green Hydrogen Hub"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />

              <div className="space-y-3">
                <label className="text-[11px] font-black text-[#86868b] uppercase tracking-widest ml-1">Hydrogen Category</label>
                <div className="flex p-1 bg-black/[0.03] rounded-[20px] border border-black/[0.02]">
                  {TYPES.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData({...formData, hydrogenType: t})}
                      className={`flex-1 py-3 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all ${formData.hydrogenType === t ? 'bg-white text-[#1d1d1f] shadow-md' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}
                    >
                      {t.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input
                  label="Price (₹/kg)"
                  type="number"
                  placeholder="0.00"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                />
                <Input
                  label="Min Order Quantity (kg)"
                  type="number"
                  placeholder="1000"
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input
                  label="Production Hub Location"
                  placeholder="City, Country"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
                <Input
                  label="Certified Purity (%)"
                  type="number"
                  step="0.01"
                  placeholder="99.9"
                  required
                  value={formData.purity}
                  onChange={(e) => setFormData({...formData, purity: e.target.value})}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-[#86868b] uppercase tracking-widest ml-1">Technical Overview</label>
                <textarea
                  className="form-control-apple w-full min-h-[160px] resize-none"
                  placeholder="Describe production methods, certifications, and terms..."
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-[#86868b] uppercase tracking-widest ml-1">Asset Images</label>
                <input 
                  type="file" 
                  multiple 
                  onChange={(e) => setImageFiles(e.target.files)}
                  className="w-full text-xs text-[#86868b] file:mr-6 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-[#0071E3] file:text-white hover:file:bg-[#0077ED] cursor-pointer bg-black/[0.03] p-2 rounded-2xl"
                />
              </div>
            </div>
          </Card>

          <div className="flex flex-col md:flex-row items-center gap-4">
             <Button type="submit" loading={submitting} className="w-full md:flex-1 py-5 text-lg" size="lg">
                {isEdit ? 'Update Asset' : 'Publish Asset'}
             </Button>
             <Button variant="ghost" type="button" onClick={() => navigate('/dashboard')} className="w-full md:w-auto px-10">
                Cancel
             </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
