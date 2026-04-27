import React, { useEffect, useState } from "react";
import api from "../../services/api.js";
import InquiryThreadModal from "../InquiryThreadModal.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { socket } from "../../api/socket.js";
import { Link } from "react-router-dom";
import { Card, Badge, Button } from "../ui";

export default function LeadsTable({ loading: parentLoading }) {
  const { showToast } = useToast();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [blockedMessage, setBlockedMessage] = useState("");

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        setLoading(true);
        setBlockedMessage("");
        const { data } = await api.get("/api/inquiries/supplier");
        setInquiries(data?.data || data || []);
      } catch (err) {
        console.error("Failed to fetch inquiries:", err);
        const status = err?.response?.status;
        const msg = err?.response?.data?.message || "Failed to fetch leads";
        if (status === 402) {
          setBlockedMessage(msg);
        } else {
          showToast(msg);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchInquiries();
  }, []);

  useEffect(() => {
    const onCreated = (payload) => {
      if (!payload?._id) return;
      setInquiries((prev) => {
        const exists = prev.some((x) => String(x._id) === String(payload._id));
        return exists ? prev : [payload, ...prev];
      });
    };

    const onUpdated = (payload) => {
      if (!payload?._id) return;
      setInquiries((prev) => prev.map((x) => (String(x._id) === String(payload._id) ? payload : x)));
    };

    socket.on("inquiry:created", onCreated);
    socket.on("inquiry:updated", onUpdated);
    return () => {
      socket.off("inquiry:created", onCreated);
      socket.off("inquiry:updated", onUpdated);
    };
  }, []);

  if (parentLoading || loading) {
    return (
      <Card className="p-8 space-y-6 animate-pulse">
        <div className="h-6 bg-black/[0.03] rounded-full w-1/3" />
        {[1,2,3].map(i => (
          <div key={i} className="flex gap-4 items-center">
             <div className="w-12 h-12 bg-black/[0.03] rounded-2xl" />
             <div className="flex-grow space-y-2">
                <div className="h-3 bg-black/[0.03] rounded-full w-3/4" />
                <div className="h-2 bg-black/[0.03] rounded-full w-1/4" />
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
          <h3 className="text-sm font-black text-[#1d1d1f] uppercase tracking-widest">Business Inquiries</h3>
          <p className="text-xs text-[#86868b] font-medium mt-1">Review and manage your incoming trade leads.</p>
        </div>
        <Badge variant="primary">
          {inquiries.length} Active Leads
        </Badge>
      </div>

      {/* Content Area */}
      <div className="overflow-x-auto">
        {blockedMessage ? (
          <div className="py-24 px-8 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-[#0071E3]/5 rounded-[32px] flex items-center justify-center text-[#0071E3] text-3xl mb-8">
              <i className="bi bi-lock-fill" />
            </div>
            <h3 className="text-xl font-black text-[#1d1d1f] mb-2 tracking-tight">Access Locked</h3>
            <p className="text-[#86868b] font-medium max-w-sm text-sm leading-relaxed mb-10">{blockedMessage}</p>
            <Button variant="primary" onClick={() => window.location.href='/dashboard/billing'}>
              Unlock Trade Dashboard
            </Button>
          </div>
        ) : inquiries.length === 0 ? (
           <div className="py-24 px-8 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-black/[0.03] rounded-[32px] flex items-center justify-center text-[#c1c1c6] text-3xl mb-8">
                <i className="bi bi-chat-left-dots" />
              </div>
              <h3 className="text-xl font-black text-[#1d1d1f] mb-2 tracking-tight">No Leads Yet</h3>
              <p className="text-[#86868b] font-medium max-w-sm text-sm leading-relaxed">Incoming inquiries from prospective buyers will appear here.</p>
           </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black/[0.03]">
                <th className="px-8 py-5 text-[10px] font-black text-[#86868b] uppercase tracking-widest">Buyer Instance</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#86868b] uppercase tracking-widest">Asset Interest</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#86868b] uppercase tracking-widest">Received On</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-[#86868b] uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.03]">
              {inquiries.map((l) => (
                <tr key={l._id} className="group hover:bg-[#F5F5F7]/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-[14px] bg-gradient-to-br from-[#0071E3] to-[#00D1B2] flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-500/20">
                        {(l.buyerId?.name || l.name || "B")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-black text-[#1d1d1f] mb-0.5">{l.buyerId?.name || l.name}</p>
                        <p className="text-[10px] font-bold text-[#86868b] truncate max-w-[180px]">{l.buyerId?.email || l.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-[#1d1d1f] mb-0.5">{l.listingId?.title || l.listingId?.companyName || "Listing Removed"}</p>
                    <Badge variant="primary" className="!py-0 !px-1.5 !text-[8px]">{l.listingId?.hydrogenType || "N/A"}</Badge>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-[#1d1d1f] mb-0.5">
                      {new Date(l.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-[10px] font-bold text-[#c1c1c6] uppercase">
                      {new Date(l.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <Button 
                      size="sm"
                      variant="secondary"
                      className="group-hover:bg-[#0071E3] group-hover:text-white transition-all"
                      onClick={() => setSelectedInquiry(l)}
                    >
                      Manage Thread
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
