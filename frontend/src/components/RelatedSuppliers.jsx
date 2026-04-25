import React, { useEffect, useState } from "react";
import SupplierCard from "./SupplierCard.jsx";
import { fetchListings } from "../services/listingService.js";

export default function RelatedSuppliers({ type, excludeId }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRelated = async () => {
      try {
        setLoading(true);
        const res = await fetchListings({ 
          hydrogenType: type, 
          limit: 4 
        });
        
        const filtered = (res.data || [])
          .filter(l => l._id !== excludeId)
          .slice(0, 3)
          .map(item => ({
            id: item._id,
            name: item.companyName,
            location: item.location,
            rating: 4.5 + (Math.random() * 0.5),
            description: item.description,
            price: `$${item.price}`,
            imageUrl: item.images?.[0] || null
          }));
          
        setSuppliers(filtered);
      } catch (err) {
        console.error("Error loading related suppliers:", err);
      } finally {
        setLoading(false);
      }
    };

    if (type) loadRelated();
  }, [type, excludeId]);

  if (!loading && suppliers.length === 0) return null;

  return (
    <div className="pt-20 animate-apple">
      <div className="flex items-center gap-4 mb-10">
         <div className="w-10 h-10 rounded-xl bg-[#0071E3]/10 flex items-center justify-center text-[#0071E3]">
            <i className="bi bi-grid-3x3-gap text-xl" />
         </div>
         <h3 className="text-[11px] font-black text-[#86868b] uppercase tracking-[0.2em]">Similar Suppliers</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {loading ? (
           Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <SupplierCard supplier={null} />
            </div>
          ))
        ) : (
          suppliers.map((sup) => (
            <div key={sup.id}>
              <SupplierCard supplier={sup} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
