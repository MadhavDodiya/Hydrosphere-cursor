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
            />
            
            <SpecificationTable />

            {/* Optional Reviews Section */}
            <div className="bg-white p-4 rounded shadow-sm mt-4">
               <h4 className="fw-bold mb-4">Customer Reviews</h4>
               <div className="d-flex gap-3 mb-4 border-bottom pb-4">
                  <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold flex-shrink-0" style={{width: "48px", height: "48px"}}>AJ</div>
                  <div>
                    <h6 className="fw-bold mb-1">Apex Journeys</h6>
                    <div className="text-warning small mb-2"><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i></div>
                    <p className="text-secondary small mb-0">Excellent communication and prompt delivery. The purity met exactly what was specified. Highly recommend HydroGen Pro.</p>
                  </div>
               </div>
               <button className="btn btn-outline-primary btn-sm rounded-pill fw-medium px-4">Read All 120 Reviews</button>
            </div>
            
          </div>
          
          {/* Right section: Sticky Action Panel */}
          <div className="col-12 col-lg-4">
            <SupplierInfoCard 
              supplierName={listing?.companyName || "HydroGen Pro"}
              location={listing?.location || "Houston, USA"}
              rating={4.8}
              price={listing ? `$${listing.price}` : "$4.50"}
            />
          </div>
        </div>

        {/* Bottom Section: Related Suppliers */}
        <RelatedSuppliers />
      </div>
      
      <div className="mt-5">
        <Footer />
      </div>
    </div>
  );
}
