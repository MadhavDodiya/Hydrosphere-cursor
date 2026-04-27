import React, { useEffect, useState } from "react";
import api from "../../services/api.js";
import InquiryThreadModal from "../InquiryThreadModal.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { socket } from "../../api/socket.js";
import { Card, Badge, Button } from "../ui";

export default function BuyerInquiries() {
  const { showToast } = useToast();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/api/inquiries/buyer");
        setInquiries(data?.data || data || []);
      } catch (err) {
        console.error("Failed to fetch inquiries:", err);
        showToast(err?.response?.data?.message || "Failed to fetch inquiries");
      } finally {
        setLoading(false);
      }
    };
    fetchInquiries();
  }, []);

  useEffect(() => {
    const onUpdated = (payload) => {
      if (!payload?._id) return;
      setInquiries((prev) => prev.map((x) => (String(x._id) === String(payload._id) ? payload : x)));
    };
    socket.on("inquiry:updated", onUpdated);
    return () => socket.off("inquiry:updated", onUpdated);
  }, []);

  if (loading) {
     return (
       <Card className="p-8 space-y-6 animate-pulse">
         <div className="h-6 bg-black/[0.03] rounded-full w-1/4" />
         {[1,2,3].map(i => (
           <div key={i} className="flex gap-4 items-center">
              <div className="w-12 h-12 bg-black/[0.03] rounded-2xl" />
              <div className="flex-grow space-y-2">
                 <div className="h-3 bg-black/[0.03] rounded-full w-2/3" />
                 <div className="h-2 bg-black/[0.03] rounded-full w-1/3" />
              </div>
           </div>
         ))}
       </Card>
     );
  }

  return (
    <Card className="p-0 overflow-hidden border-none shadow-sm bg-white">
      {/* Header */}
      <div className="p-8 border-b border-black/[0.03] flex justify-between items-center bg-white">
        <div>
          <h3 className="text-sm font-black text-[#1d1d1f] uppercase tracking-widest">My Inquiries</h3>
          <p className="text-xs text-[#86868b] font-medium mt-1">History of all trade communications.</p>
        </div>
        <Badge variant="primary">
          {inquiries.length} Conversations
        </Badge>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-black/[0.03]">
              <th className="px-8 py-5 text-[10px] font-black text-[#86868b] uppercase tracking-widest">Producer / Asset</th>
              <th className="px-8 py-5 text-[10px] font-black text-[#86868b] uppercase tracking-widest">Asset Category</th>
              <th className="px-8 py-5 text-[10px] font-black text-[#86868b] uppercase tracking-widest">Sent On</th>
              <th className="px-8 py-5 text-right text-[10px] font-black text-[#86868b] uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.03]">
            {inquiries.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-24 px-8 text-center">
                   <div className="flex flex-col items-center">
                      <div className="w-20 h-20 bg-black/[0.03] rounded-[32px] flex items-center justify-center text-[#c1c1c6] text-3xl mb-8">
                        <i className="bi bi-chat-left-dots" />
                      </div>
                      <h3 className="text-xl font-black text-[#1d1d1f] mb-2 tracking-tight">No History Found</h3>
                      <p className="text-[#86868b] font-medium max-w-sm text-sm leading-relaxed">Your message history with producers will appear here.</p>
                   </div>
                </td>
              </tr>
            ) : (
              inquiries.map(l => (
                <tr key={l._id} className="group hover:bg-[#F5F5F7]/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-[14px] bg-black/[0.03] flex items-center justify-center text-[#1d1d1f] font-black text-sm shadow-sm border border-black/5">
                        {(l.listingId?.title || l.listingId?.companyName || "L")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-black text-[#1d1d1f] mb-0.5">{l.listingId?.title || l.listingId?.companyName || "Listing Removed"}</p>
                        <p className="text-[10px] font-bold text-[#86868b] flex items-center gap-1">
                          <i className="bi bi-geo-alt" /> {l.listingId?.location || "N/A"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <Badge variant="primary" className="!py-0 !px-1.5 !text-[8px]">{l.listingId?.hydrogenType || "N/A"}</Badge>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-[#1d1d1f] mb-0.5">
                      {new Date(l.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-[10px] font-bold text-[#c1c1c6] uppercase">
                      {new Date(l.createdAt).getFullYear()}
                    </p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Button 
                      size="sm"
                      variant="secondary"
                      className="group-hover:bg-[#0071E3] group-hover:text-white transition-all"
                      onClick={() => setSelectedInquiry(l)}
                    >
                      Open Thread
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedInquiry && (
        <InquiryThreadModal 
          show={!!selectedInquiry} 
          inquiry={selectedInquiry} 
          onClose={() => setSelectedInquiry(null)}
          onReplyAdded={(updatedInquiry) => {
            setInquiries(prev => prev.map(i => i._id === updatedInquiry._id ? { ...i, replies: updatedInquiry.replies } : i));
            setSelectedInquiry(updatedInquiry);
          }}
        />
      )}
    </Card>
  );
}

