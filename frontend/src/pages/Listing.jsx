import React, { useState, useEffect } from "react";
import FilterSidebar from "../components/FilterSidebar.jsx";
import SupplierCard from "../components/SupplierCard.jsx";
import Footer from "../components/Footer.jsx";
import "./Listing.css";
import { fetchListings } from "../services/listingService.js";

// Demo data
const DEMO_SUPPLIERS = [
  {
    id: "1",
    name: "HydroGen Pro",
    location: "Houston, USA",
    rating: 4.8,
    description: "Premium green hydrogen gaseous products for industrial applications.",
    price: "$4.20",
    imageUrl: "https://images.unsplash.com/photo-1518623489648-a173ef7824f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "2",
    name: "Liquid H2 Solutions",
    location: "Rotterdam, Netherlands",
    rating: 4.9,
    description: "Specializing in liquid hydrogen transport and bulk industrial delivery.",
    price: "$5.10",
    imageUrl: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "3",
    name: "EcoFuel Corp",
    location: "Tokyo, Japan",
    rating: 4.6,
    description: "Affordable and reliable grey and blue hydrogen supply.",
    price: "$3.50",
    imageUrl: "https://images.unsplash.com/photo-1611273426858-450d8e3c9cce?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "4",
    name: "AeroHydrogen",
    location: "Berlin, Germany",
    rating: 4.7,
    description: "Supporting aerospace and mobility sectors with ultra-pure hydrogen fuel.",
    price: "$6.00",
    imageUrl: "https://images.unsplash.com/photo-1549421287-dfeb40bcffc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
];

export default function Listing() {
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadListings = async () => {
      try {
        setLoading(true);
        const params = search.trim() ? { q: search.trim() } : {};
        const data = await fetchListings(params);
        const mappedSuppliers = data.map(item => ({
          id: item._id,
          name: item.companyName || "Unknown Supplier",
          location: item.location || 'Unknown Location',
          rating: 4.5, // Schema does not have rating
          description: item.description || `${item.hydrogenType} Hydrogen - ${item.quantity} kg available`,
          price: `$${item.price}`,
          imageUrl: "https://images.unsplash.com/photo-1518623489648-a173ef7824f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        }));
        setSuppliers(mappedSuppliers);
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setLoading(false);
      }
    };
    
    const timeoutId = setTimeout(() => {
      loadListings();
    }, 400); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [search]);

  // We rely on backend filtering now
  const filteredSuppliers = suppliers;

  return (
    <div className="listing-page-bg pb-0">
      <div className="container py-4">
        {/* Main 2-Column Layout */}
        <div className="row g-4">
          
          {/* Left: Filters Sidebar */}
          <div className="col-12 col-lg-3">
            <FilterSidebar />
          </div>
          
          {/* Right: Top Section & Grid */}
          <div className="col-12 col-lg-9">
            
            {/* Top Bar: Search & Sort */}
            <div className="bg-white p-3 rounded shadow-sm mb-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              <div className="position-relative flex-grow-1" style={{ maxWidth: "450px" }}>
                <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                <input
                  type="text"
                  className="form-control rounded-pill ps-5 bg-light"
                  placeholder="Search by location or product..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="d-flex align-items-center gap-2">
                <label className="text-nowrap small text-muted fw-medium mb-0">Sort by:</label>
                <select className="form-select form-select-sm border-0 bg-light rounded-pill px-3 py-2 w-auto shadow-none cursor-pointer">
                  <option>Recommended</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Highest Rated</option>
                </select>
              </div>
            </div>
            
            {/* Results Count */}
            <div className="mb-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold text-dark">
                {loading ? "Discovering suppliers..." : `${filteredSuppliers.length} Results Found`}
              </h5>
            </div>

            {/* Grid */}
            <div className="row g-4">
              {loading ? (
                // Skeleton Loader Array
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="col-12 col-md-6 col-lg-4">
                    <SupplierCard supplier={null} />
                  </div>
                ))
              ) : filteredSuppliers.length > 0 ? (
                filteredSuppliers.map((supplier) => (
                  <div key={supplier.id} className="col-12 col-md-6 col-lg-4">
                    <SupplierCard supplier={supplier} />
                  </div>
                ))
              ) : (
                // Empty State
                <div className="col-12">
                  <div className="bg-white p-5 rounded shadow-sm text-center">
                    <div className="display-1 text-muted mb-3"><i className="bi bi-search"></i></div>
                    <h4 className="fw-bold text-dark">No Suppliers Found</h4>
                    <p className="text-secondary">Try adjusting your search or filter criteria to find what you're looking for.</p>
                    <button className="btn btn-primary mt-2 px-4 rounded-pill" onClick={() => setSearch("")}>
                      Clear Search
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Pagination */}
            {!loading && filteredSuppliers.length > 0 && (
              <div className="d-flex justify-content-center mt-5">
                <nav aria-label="Suppliers pagination">
                  <ul className="pagination pagination-sm shadow-sm gap-1">
                    <li className="page-item disabled">
                      <a className="page-link rounded" href="#" tabIndex="-1">Previous</a>
                    </li>
                    <li className="page-item active"><a className="page-link rounded" href="#">1</a></li>
                    <li className="page-item"><a className="page-link rounded" href="#">2</a></li>
                    <li className="page-item"><a className="page-link rounded" href="#">3</a></li>
                    <li className="page-item">
                      <a className="page-link rounded" href="#">Next</a>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
            
          </div>
        </div>
      </div>
      <div className="mt-5">
         <Footer />
      </div>
    </div>
  );
}
