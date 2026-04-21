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
        // Fetch real featured listings from API (Bug 6)
        const res = await fetchListings({ isFeatured: true, limit: 3 });
        
        const mapped = (res.data || []).map(item => ({
          id: item._id,
          name: item.companyName,
          location: item.location,
          rating: "4.8", // Featured usually higher
          price: `$${item.price}/kg`,
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
    <section className="hs-section pt-0">
      <div className="container">
        <div className="d-flex align-items-end justify-content-between flex-wrap gap-2 mb-4">
          <div>
            <h2 className="h4 mb-1 fw-bold">Featured Suppliers</h2>
            <div className="hs-muted small">Top-rated partners in your region meeting purity standards.</div>
          </div>
          <Link to="/marketplace" className="btn btn-link text-decoration-none px-0">
            View All Suppliers <span className="bi bi-arrow-right" aria-hidden="true" />
          </Link>
        </div>

        <div className="row g-3">
          {loading ? (
             Array.from({ length: 3 }).map((_, i) => (
              <div className="col-12 col-md-6 col-lg-4" key={i}>
                <div className="bg-light rounded" style={{ height: "300px", animation: "pulse 1.5s infinite" }}></div>
              </div>
            ))
          ) : suppliers.length > 0 ? (
            suppliers.map((supplier) => (
              <div className="col-12 col-md-6 col-lg-4" key={supplier.id || supplier.name}>
                <Link to={`/listings/${supplier.id}`} className="text-decoration-none text-reset">
                  <SupplierCard supplier={supplier} />
                </Link>
              </div>
            ))
          ) : (
            <div className="col-12 text-center py-4 hs-muted">
              Discover top suppliers by exploring our marketplace.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
