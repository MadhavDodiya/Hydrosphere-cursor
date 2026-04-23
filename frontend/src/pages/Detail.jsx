import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProductInfo from "../components/ProductInfo.jsx";
import SupplierInfoCard from "../components/SupplierInfoCard.jsx";
import SpecificationTable from "../components/SpecificationTable.jsx";
import RelatedSuppliers from "../components/RelatedSuppliers.jsx";
import Footer from "../components/Footer.jsx";
import { fetchListingById } from "../services/listingService.js";
import "./Detail.css";

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

  // Loading skeleton
  if (loading) {
    return (
      <div className="detail-page-bg pb-0">
        <div className="container py-4">
          <div className="placeholder-glow">
            <span className="placeholder col-3 mb-4" style={{ height: 18, borderRadius: 6 }}></span>
            <div className="row g-4">
              <div className="col-12 col-lg-8">
                <div className="bg-white rounded shadow-sm p-4 mb-4">
                  <span className="placeholder col-8 mb-3" style={{ height: 28 }}></span>
                  <span className="placeholder col-4 mb-4" style={{ height: 16 }}></span>
                  <span className="placeholder col-12 mb-2" style={{ height: 200, borderRadius: 12 }}></span>
                  <span className="placeholder col-12 mt-3" style={{ height: 14 }}></span>
                  <span className="placeholder col-10" style={{ height: 14 }}></span>
                </div>
              </div>
              <div className="col-12 col-lg-4">
                <div className="bg-white rounded shadow-sm p-4">
                  <span className="placeholder col-8 mb-3" style={{ height: 20 }}></span>
                  <span className="placeholder col-12 mb-2" style={{ height: 14 }}></span>
                  <span className="placeholder col-12" style={{ height: 44, borderRadius: 22 }}></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="detail-page-bg pb-0">
      <div className="container py-4">
        
        {/* Breadcrumb Info */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/">Home</Link></li>
            <li className="breadcrumb-item"><Link to="/marketplace">Suppliers</Link></li>
            <li className="breadcrumb-item active text-dark fw-medium" aria-current="page">{listing?.hydrogenType || "High Purity"} H2</li>
          </ol>
        </nav>

        <div className="row g-4">
          
          {/* Left section: Main Content */}
          <div className="col-12 col-lg-8">
            <ProductInfo 
              title={listing ? `${listing.hydrogenType} Hydrogen Gas` : "High Purity Hydrogen Gas"}
              rating={4.8}
              location={listing?.location || "Houston, USA"}
              description={listing?.description || "Premium grade gaseous product suitable for industrial scaling and commercial mobility fuel cells."}
              imageUrl={listing?.images?.length ? listing.images[0] : null}
            />
            
            <SpecificationTable listing={listing} />

            {/* Reviews section hidden — no real reviews data yet */}
            
          </div>
          
          {/* Right section: Sticky Action Panel */}
          <div className="col-12 col-lg-4">
            <SupplierInfoCard 
              key={listing?._id || "detail-listing"}
              listing={listing}
              supplierName={listing?.title || listing?.companyName || "HydroGen Pro"}
              location={listing?.location || "Houston, USA"}
              rating={4.8}
              price={listing ? `$${listing.price}` : "$4.50"}
            />
          </div>
        </div>

        {/* Bottom Section: Related Suppliers */}
        <RelatedSuppliers type={listing?.hydrogenType} excludeId={listing?._id} />
      </div>
      
      <div className="mt-5">
        <Footer />
      </div>
    </div>
  );
}
