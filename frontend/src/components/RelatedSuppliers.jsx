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
        // Fetch listings of the same type
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

  if (loading && !type) return null;
  if (!loading && suppliers.length === 0) return null;

  return (
    <div className="related-suppliers mt-5 pt-4 border-top">
      <h3 className="fw-bold mb-4"><i className="bi bi-grid-3x3-gap me-2 text-primary"></i>Similar Suppliers</h3>
      <div className="row g-4">
        {loading ? (
           Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="col-12 col-md-4">
              <SupplierCard supplier={null} />
            </div>
          ))
        ) : (
          suppliers.map((sup) => (
            <div key={sup.id} className="col-12 col-md-4">
              <SupplierCard supplier={sup} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
