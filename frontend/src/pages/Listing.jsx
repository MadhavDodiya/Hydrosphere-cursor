import React, { useState, useEffect } from "react";
import FilterSidebar from "../components/FilterSidebar.jsx";
import SupplierCard from "../components/SupplierCard.jsx";
import Footer from "../components/Footer.jsx";
import "./Listing.css";
import { fetchListings } from "../services/listingService.js";

export default function Listing() {
  const [loading, setLoading] = useState(true);
  const [suppliers, setSuppliers] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  const [filters, setFilters] = useState({
    location: "",
    types: [],
    minPrice: "",
    maxPrice: "",
    minRating: false
  });
  const [sort, setSort] = useState("Recommended");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400); 
    return () => clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    const loadListings = async () => {
      try {
        setLoading(true);
        const params = {
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          sort: sort, // Server-side sort (Bug 7)
          ...(debouncedSearch.trim() ? { q: debouncedSearch.trim() } : {}),
          ...(filters.location.trim() ? { location: filters.location.trim() } : {}),
          ...(filters.minPrice !== "" ? { minPrice: filters.minPrice } : {}),
          ...(filters.maxPrice !== "" ? { maxPrice: filters.maxPrice } : {}),
          // Support multiple types (Bug 4)
          ...(filters.types.length > 0 ? { hydrogenType: filters.types.join(",") } : {}),
        };
        const response = await fetchListings(params);
        
        const mapped = (response.data || []).map(item => ({
          id: item._id,
          name: item.companyName || "Unknown Supplier",
          location: item.location || 'Unknown Location',
          rating: 4.5, // Logic for rating can be added if backend supports it
          description: item.description || `${item.hydrogenType} Hydrogen - ${item.quantity} kg available`,
          price: `$${item.price}`,
          rawPrice: Number(item.price),
          type: item.hydrogenType,
          imageUrl: item.images && item.images.length > 0 ? item.images[0] : "https://images.unsplash.com/photo-1518623489648-a173ef7824f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        }));

        setSuppliers(mapped);
        setTotalItems(response.total || 0);
        setTotalPages(response.totalPages || 1);
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadListings();
  }, [debouncedSearch, currentPage, filters, sort]);

  // Reset to page 1 when search/filter/sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filters, sort]);

  const handlePageChange = (e, page) => {
    e.preventDefault();
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="listing-page-bg pb-0">
      <div className="container py-4">
        <div className="row g-4">
          
          {/* Left: Filters Sidebar */}
          <div className="col-12 col-lg-3">
            <FilterSidebar filters={filters} onFilterChange={setFilters} />
          </div>
          
          {/* Right: Top Section & Grid */}
          <div className="col-12 col-lg-9">
            
            {/* Top Bar: Search & Sort */}
            <div className="bg-white p-3 rounded shadow-sm mb-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              <div className="position-relative flex-grow-1" style={{ maxWidth: "450px" }}>
                <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                <input
                  type="text"
                  className="form-control rounded-pill ps-5 bg-light form-control-focus shadow-none"
                  placeholder="Search by company, location or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="d-flex align-items-center gap-2">
                <label className="text-nowrap small text-muted fw-medium mb-0">Sort by:</label>
                <select 
                  className="form-select form-select-sm border-0 bg-light rounded-pill px-3 py-2 w-auto shadow-none cursor-pointer"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option>Recommended</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                </select>
              </div>
            </div>
            
            {/* Results Count */}
            <div className="mb-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold text-dark">
                {loading ? "Discovering suppliers..." : `${totalItems} Results Found`}
              </h5>
              {!loading && totalPages > 1 && (
                <span className="text-muted small">Page {currentPage} of {totalPages}</span>
              )}
            </div>

            {/* Grid */}
            <div className="row g-4">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="col-12 col-md-6 col-lg-4">
                    <SupplierCard supplier={null} />
                  </div>
                ))
              ) : suppliers.length > 0 ? (
                suppliers.map((supplier) => (
                  <div key={supplier.id} className="col-12 col-md-6 col-lg-4">
                    <SupplierCard supplier={supplier} />
                  </div>
                ))
              ) : (
                <div className="col-12">
                  <div className="bg-white p-5 rounded shadow-sm text-center">
                    <div className="display-1 text-muted mb-3"><i className="bi bi-search"></i></div>
                    <h4 className="fw-bold text-dark">No Suppliers Found</h4>
                    <p className="text-secondary">Try adjusting your search or filter criteria to find what you're looking for.</p>
                    <button className="btn btn-primary mt-2 px-4 rounded-pill" onClick={() => {
                      setSearch("");
                      setFilters({location: "", types: [], minPrice: "", maxPrice: "", minRating: false});
                    }}>
                      Clear All Filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="d-flex justify-content-center mt-5">
                <nav aria-label="Suppliers pagination">
                  <ul className="pagination pagination-sm shadow-sm gap-1">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <a className="page-link rounded cursor-pointer" onClick={(e) => handlePageChange(e, currentPage - 1)} tabIndex="-1">Previous</a>
                    </li>
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const page = idx + 1;
                      return (
                        <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                           <a className="page-link rounded cursor-pointer" onClick={(e) => handlePageChange(e, page)}>{page}</a>
                        </li>
                      )
                    })}
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <a className="page-link rounded cursor-pointer" onClick={(e) => handlePageChange(e, currentPage + 1)}>Next</a>
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
