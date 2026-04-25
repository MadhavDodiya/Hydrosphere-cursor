import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SupplierCard from "./SupplierCard.jsx";
import { fetchListings } from "../../services/listingService.js";

export default function FeaturedSuppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        setLoading(true);
        const res = await fetchListings({ isFeatured: true, limit: 3 });
        
        const mapped = (res.data || []).map(item => ({
          id: item._id,
          name: item.title || item.companyName,
          location: item.location,
          rating: "4.8", 
          price: `₹${item.price}/kg`,
          imageUrl: item.images?.[0] || "https://images.unsplash.com/photo-1518623489648-a173ef7824f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        }));
        
        setSuppliers(mapped);
      } catch (err) {
        console.error("Error loading featured suppliers:", err);
      } finally {
        setLoading(false);
      }
    };
    loadFeatured();
  }, []);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <h2 className="text-3xl font-extrabold text-[#1d1d1f] tracking-tight mb-2">Featured Suppliers</h2>
            <p className="text-[#86868b] text-lg">Top-rated partners meeting global purity standards.</p>
          </div>
          <Link to="/marketplace" className="text-[#0071E3] font-medium hover:underline flex items-center gap-1 group">
            View All Marketplace
            <i className="bi bi-chevron-right text-xs transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
             Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-[#F5F5F7] rounded-[22px] h-[320px] animate-pulse" />
            ))
          ) : suppliers.length > 0 ? (
            suppliers.map((supplier) => (
              <Link key={supplier.id} to={`/listings/${supplier.id}`} className="block transition-transform active:scale-95">
                <SupplierCard supplier={supplier} />
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-[#86868b]">
              Discover top suppliers by exploring our marketplace.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
