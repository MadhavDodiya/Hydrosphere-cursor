import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMyListings, deleteListing } from "../../services/listingService.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { Card, Badge, Button } from "../ui";

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

    const previousListings = [...listings];
    setListings(prev => prev.filter(l => l._id !== id));
    setDeletingId(id);

    try {
      await deleteListing(id);
      showToast("Listing deleted successfully", "success");
    } catch (err) {
      setListings(previousListings);
      showToast("Failed to delete listing", "error");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <Card className="p-8 space-y-6 animate-pulse">
        <div className="h-6 bg-black/[0.03] rounded-full w-1/4" />
        {[1,2,3].map(i => (
          <div key={i} className="flex gap-4 items-center">
             <div className="w-14 h-14 bg-black/[0.03] rounded-2xl" />
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
          <h3 className="text-sm font-black text-[#1d1d1f] uppercase tracking-widest">Inventory Management</h3>
          <p className="text-xs text-[#86868b] font-medium mt-1">Manage and monitor your hydrogen assets.</p>
        </div>
        <Button size="sm" onClick={() => window.location.href='/add-listing'} className="gap-2">
          <i className="bi bi-plus-lg" /> New Asset
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-black/[0.03]">
              <th className="px-8 py-5 text-[10px] font-black text-[#86868b] uppercase tracking-widest">Product Details</th>
              <th className="px-8 py-5 text-[10px] font-black text-[#86868b] uppercase tracking-widest">Pricing & Stock</th>
              <th className="px-8 py-5 text-[10px] font-black text-[#86868b] uppercase tracking-widest">Visibility</th>
              <th className="px-8 py-5 text-right text-[10px] font-black text-[#86868b] uppercase tracking-widest">Management</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.03]">
            {listings.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-24 px-8 text-center">
                   <div className="flex flex-col items-center">
                      <div className="w-20 h-20 bg-black/[0.03] rounded-[32px] flex items-center justify-center text-[#c1c1c6] text-3xl mb-8">
                        <i className="bi bi-box-seam" />
                      </div>
                      <h3 className="text-xl font-black text-[#1d1d1f] mb-2 tracking-tight">No Assets Listed</h3>
                      <p className="text-[#86868b] font-medium max-w-sm text-sm leading-relaxed mb-10">You haven't added any products to the marketplace yet.</p>
                      <Button variant="secondary" onClick={() => window.location.href='/add-listing'}>
                        Create My First Listing
                      </Button>
                   </div>
                </td>
              </tr>
            ) : (
              listings.map(l => (
                <tr key={l._id} className="group hover:bg-[#F5F5F7]/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-black/[0.03] overflow-hidden border border-black/5 shadow-sm group-hover:scale-105 transition-transform">
                        <img
                          src={l.images?.[0] || "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&auto=format&fit=crop"}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-black text-[#1d1d1f] mb-1">{l.title || l.companyName}</p>
                        <div className="flex items-center gap-2">
                           <Badge variant={l.hydrogenType === 'Green Hydrogen' ? 'success' : 'primary'} className="!py-0 !px-1.5 !text-[8px]">{l.hydrogenType}</Badge>
                           <span className="text-[10px] font-bold text-[#86868b] flex items-center gap-1">
                             <i className="bi bi-geo-alt" /> {l.location}
                           </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-[#1d1d1f] mb-0.5">₹{l.price}<span className="text-[#86868b] text-[10px] ml-1">/kg</span></p>
                    <p className="text-[10px] font-bold text-[#86868b] uppercase">Stock: <span className="text-[#1d1d1f]">{l.quantity} units</span></p>
                  </td>
                  <td className="px-8 py-6">
                    <Badge variant={l.status === 'approved' ? 'success' : 'warning'}>
                      {l.status || 'pending'}
                    </Badge>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        className="!w-9 !h-9 !p-0 !rounded-xl"
                        onClick={() => window.location.href=`/add-listing/${l._id}`}
                        title="Edit"
                      >
                        <i className="bi bi-pencil-fill text-xs" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="!w-9 !h-9 !p-0 !rounded-xl text-red-500 hover:bg-red-50"
                        onClick={() => handleDelete(l._id)} 
                        disabled={deletingId === l._id}
                        title="Delete"
                      >
                        {deletingId === l._id ? (
                          <span className="w-3 h-3 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <i className="bi bi-trash3-fill text-xs" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
