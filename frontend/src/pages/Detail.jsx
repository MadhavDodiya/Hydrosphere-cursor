import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProductInfo from "../components/ProductInfo.jsx";
import SupplierInfoCard from "../components/SupplierInfoCard.jsx";
import SpecificationTable from "../components/SpecificationTable.jsx";
import RelatedSuppliers from "../components/RelatedSuppliers.jsx";
import Footer from "../components/Footer.jsx";
import { fetchListingById } from "../services/listingService.js";

export default function Detail() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    const loadListing = async () => {
      try {
        if (id && id !== 'demo') {
          const data = await fetchListingById(id);
          setListing(data);
        }
      } catch (error) {
        console.error("Failed to load listing", error);
      } finally {
        setLoading(false);
      }
    };
    loadListing();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] animate-pulse selection:bg-[#0071E3]/20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="h-4 w-48 bg-black/5 rounded-full mb-10" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-[32px] p-8 h-96 shadow-sm border border-black/5" />
              <div className="bg-white rounded-[32px] p-8 h-64 shadow-sm border border-black/5" />
            </div>
            <div className="bg-white rounded-[32px] p-8 h-[500px] shadow-sm border border-black/5" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] selection:bg-[#0071E3]/20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Breadcrumb Info */}
        <nav className="mb-10 animate-apple">
          <ol className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-[#86868b]">
            <li><Link to="/" className="hover:text-[#0071E3] transition-colors">Home</Link></li>
            <li><i className="bi bi-chevron-right text-[8px]" /></li>
            <li><Link to="/marketplace" className="hover:text-[#0071E3] transition-colors">Marketplace</Link></li>
            <li><i className="bi bi-chevron-right text-[8px]" /></li>
            <li className="text-[#1d1d1f] truncate max-w-[150px]">{listing?.hydrogenType || "Product"}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-10 animate-apple">
            <ProductInfo 
              title={listing ? `${listing.hydrogenType} Hydrogen` : "High Purity Hydrogen"}
              rating={4.8}
              location={listing?.location || "Industrial Hub"}
              description={listing?.description || "High-grade industrial hydrogen tailored for sustainable enterprise mobility and fuel cell infrastructure."}
              imageUrl={listing?.images?.length ? listing.images[0] : null}
            />
            
            <SpecificationTable listing={listing} />
          </div>
          
          {/* Action Panel Column */}
          <div className="animate-apple delay-100">
            <SupplierInfoCard 
              key={listing?._id || "detail-listing"}
              listing={listing}
              supplierName={listing?.title || listing?.companyName || "Verified Partner"}
              location={listing?.location || "Global Distribution"}
              rating={4.8}
              price={listing ? `$${listing.price}` : "$4.50"}
            />
          </div>
        </div>

        {/* Discovery Section */}
        <div className="mt-20 animate-apple delay-200">
          <RelatedSuppliers type={listing?.hydrogenType} excludeId={listing?._id} />
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
