import React, { useState } from "react";
import InquiryModal from "./InquiryModal.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { saveListing, unsaveListing } from "../services/savedService.js";

export default function SupplierInfoCard({ listing, supplierName, location, rating, price }) {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [showModal, setShowModal] = useState(false);
  
  const canSendInquiry = user?.role === "buyer" || !isAuthenticated;
  const [isSaved, setIsSaved] = useState(listing?.saved || false);
  const [saving, setSaving] = useState(false);

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
        showToast("Listing saved.", "success");
      } else {
        await unsaveListing(listing._id);
        showToast("Removed from saved.");
      }
      setIsSaved(nextState);
    } catch {
      showToast("Failed to update saved status.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="lg:sticky lg:top-32 space-y-6">
      <div className="bg-white rounded-[32px] p-8 shadow-2xl shadow-black/5 border border-black/[0.03] animate-apple">
        
        {/* Header Info */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1 min-w-0 pr-4">
            <h3 className="text-xl font-extrabold text-[#1d1d1f] truncate leading-tight">{supplierName}</h3>
            <div className="flex items-center gap-1.5 mt-1 text-[#86868b] text-xs font-bold">
              <i className="bi bi-geo-alt-fill text-[10px]" />
              {location}
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
             <div className="flex items-center gap-1 bg-[#34C759]/10 text-[#34C759] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-[#34C759]/20">
                <i className="bi bi-shield-check" /> Verified
             </div>
             <button 
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isSaved ? 'bg-[#FF3B30] text-white' : 'bg-[#F5F5F7] text-[#86868b] hover:text-[#FF3B30]'}`}
                onClick={toggleSave}
                disabled={saving}
              >
                <i className={`bi bi-heart${isSaved ? '-fill' : ''}`} />
              </button>
          </div>
        </div>

        {/* Pricing Widget */}
        <div className="bg-[#F5F5F7] rounded-[24px] p-6 text-center mb-8 border border-black/[0.02]">
           <span className="text-[10px] font-black text-[#86868b] uppercase tracking-[0.2em] mb-2 block">Enterprise Rate</span>
           <div className="flex items-baseline justify-center gap-1">
              <span className="text-4xl font-black text-[#1d1d1f] tracking-tight">{price}</span>
              <span className="text-sm font-bold text-[#86868b]">/kg</span>
           </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button 
            className="btn-primary w-full py-4 text-base font-black shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            onClick={() => setShowModal(true)}
            disabled={!canSendInquiry}
          >
            {user?.role === "supplier" ? "Supplier View" : "Request Quote"}
            <i className="bi bi-chevron-right text-xs" />
          </button>
          <button 
            className="w-full py-4 text-sm font-black text-[#1d1d1f] bg-[#F5F5F7] rounded-full hover:bg-[#e8e8ed] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            onClick={() => setShowModal(true)}
            disabled={!canSendInquiry}
          >
            <i className="bi bi-chat-text" />
            Message Supplier
          </button>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 pt-8 border-t border-black/5">
           <ul className="space-y-4">
              {[
                { icon: "bi-clock-history", label: "Response Rate", value: "< 24h" },
                { icon: "bi-truck", label: "Global Logistics", value: "Standard & Express" },
                { icon: "bi-patch-check", label: "Certification", value: "ISO 9001 Certified" }
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-4 group">
                   <div className="w-8 h-8 rounded-lg bg-[#0071E3]/5 flex items-center justify-center text-[#0071E3] transition-colors group-hover:bg-[#0071E3] group-hover:text-white">
                      <i className={`bi ${item.icon}`} />
                   </div>
                   <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-[#86868b] uppercase tracking-widest">{item.label}</p>
                      <p className="text-xs font-bold text-[#1d1d1f]">{item.value}</p>
                   </div>
                </li>
              ))}
           </ul>
        </div>
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
