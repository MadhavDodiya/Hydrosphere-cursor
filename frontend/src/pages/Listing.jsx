import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import FilterSidebar from "../components/FilterSidebar.jsx";
import SupplierCard from "../components/SupplierCard.jsx";
import Footer from "../components/Footer.jsx";
import { fetchListings } from "../services/listingService.js";
import { useToast } from "../context/ToastContext.jsx";
import { getApiErrorMessage } from "../utils/apiError.js";

export default function Listing() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const [suppliers, setSuppliers] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get("q") || "");
  
  const [filters, setFilters] = useState({
    location: searchParams.get("location") || "",
    types: searchParams.get("type") ? [searchParams.get("type")] : [],
    minPrice: "",
    maxPrice: "",
    minRating: false,
    deliveryAvailability: ""
  });
  const [sort, setSort] = useState("Recommended");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    const q = searchParams.get("q") || "";
    const loc = searchParams.get("location") || "";
    const type = searchParams.get("type");

    setSearch(q);
    setDebouncedSearch(q);
    setFilters(prev => ({
      ...prev,
      location: loc,
      types: type ? [type] : []
    }));
  }, [searchParams]);

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
          sort: sort,
          ...(debouncedSearch.trim() ? { q: debouncedSearch.trim() } : {}),
          ...(filters.location.trim() ? { location: filters.location.trim() } : {}),
          ...(filters.minPrice !== "" ? { minPrice: filters.minPrice } : {}),
          ...(filters.maxPrice !== "" ? { maxPrice: filters.maxPrice } : {}),
          ...(filters.deliveryAvailability ? { deliveryAvailability: filters.deliveryAvailability } : {}),
          ...(filters.types.length > 0 ? { hydrogenType: filters.types.join(",") } : {}),
        };
        const response = await fetchListings(params);
        
        const mapped = (response.data || []).map(item => ({
          id: item._id,
          name: item.title || item.companyName || "Unknown Supplier",
          location: item.location || 'Unknown Location',
          rating: 4.5,
          description: item.description || `${item.hydrogenType} Hydrogen`,
          price: item.price != null ? `₹${Number(item.price).toLocaleString('en-IN')}` : 'Contact for price',
          rawPrice: Number(item.price),
          type: item.hydrogenType,
          deliveryAvailability: item.deliveryAvailability || "",
          isVerified: item.supplier?.isVerified || false,
          purity: item.purity || null,
          imageUrl: item.images && item.images.length > 0 ? item.images[0] : "https://images.unsplash.com/photo-1518623489648-a173ef7824f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        }));

        setSuppliers(mapped);
        setTotalItems(response.total || 0);
        setTotalPages(response.totalPages || 1);
      } catch (error) {
        const msg = getApiErrorMessage(error, "Failed to fetch listings");
        showToast(msg, "error");
      } finally {
        setLoading(false);
      }
    };
    loadListings();
  }, [debouncedSearch, currentPage, filters, sort]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, filters, sort]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-[#f5f5f7] min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Left: Filters Sidebar */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <FilterSidebar filters={filters} onFilterChange={setFilters} />
          </aside>
          
          {/* Right: Content */}
          <main className="flex-grow">
            
            {/* Top Bar: Search & Sort */}
            <div className="bg-white rounded-[28px] p-2 shadow-sm border border-black/[0.03] mb-8 flex flex-col md:flex-row items-center gap-2">
              <div className="flex-grow flex items-center gap-3 px-4 w-full">
                <i className="bi bi-search text-[#86868b]" />
                <input
                  type="text"
                  className="w-full bg-transparent py-3 text-sm focus:outline-none placeholder:text-[#86868b]"
                  placeholder="Search suppliers, locations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="h-8 w-[1px] bg-black/5 hidden md:block" />

              <div className="flex items-center gap-3 px-4 w-full md:w-auto min-w-[200px]">
                <span className="text-[11px] font-bold text-[#86868b] uppercase tracking-wider whitespace-nowrap">Sort by</span>
                <select 
                  className="w-full bg-transparent py-3 text-sm font-semibold text-[#1d1d1f] focus:outline-none appearance-none cursor-pointer"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option>Recommended</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                </select>
              </div>
            </div>
            
            {/* Results Info */}
            <div className="flex items-end justify-between mb-6 px-2">
              <div>
                <h2 className="text-2xl font-extrabold text-[#1d1d1f] tracking-tight">
                  {loading ? "Searching..." : `${totalItems} Results`}
                </h2>
                <p className="text-sm text-[#86868b]">Found in your current region</p>
              </div>
              {!loading && totalPages > 1 && (
                <span className="text-xs font-medium text-[#86868b]">Page {currentPage} of {totalPages}</span>
              )}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-apple">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-[22px] h-[350px] animate-pulse" />
                ))
              ) : suppliers.length > 0 ? (
                suppliers.map((supplier) => (
                  <SupplierCard key={supplier.id} supplier={supplier} />
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-white rounded-[32px] border border-black/[0.03]">
                  <div className="w-20 h-20 bg-[#F5F5F7] rounded-full flex items-center justify-center mx-auto mb-6">
                    <i className="bi bi-search text-3xl text-[#86868b]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#1d1d1f] mb-2">No Suppliers Found</h3>
                  <p className="text-[#86868b] mb-8 max-w-sm mx-auto">Try adjusting your filters or search terms to find matching hydrogen partners.</p>
                  <button 
                    className="btn-secondary"
                    onClick={() => {
                      setSearch("");
                      setFilters({location: "", types: [], minPrice: "", maxPrice: "", minRating: false, deliveryAvailability: ""});
                    }}
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>

            {/* Apple-style Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button 
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${currentPage === 1 ? 'text-[#c1c1c6] cursor-not-allowed' : 'text-[#1d1d1f] hover:bg-white'}`}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <i className="bi bi-chevron-left" />
                </button>
                
                <div className="flex items-center gap-1 bg-white p-1 rounded-full shadow-sm border border-black/[0.03]">
                  {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                    const page = idx + 1; // Simplification: just first 5 for now
                    return (
                      <button 
                        key={page} 
                        className={`w-9 h-9 rounded-full text-sm font-bold transition-all ${currentPage === page ? 'bg-[#0071E3] text-white shadow-md shadow-blue-500/20' : 'text-[#1d1d1f] hover:bg-[#f5f5f7]'}`}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </button>
                    )
                  })}
                  {totalPages > 5 && <span className="px-2 text-[#86868b]">...</span>}
                </div>

                <button 
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${currentPage === totalPages ? 'text-[#c1c1c6] cursor-not-allowed' : 'text-[#1d1d1f] hover:bg-white'}`}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <i className="bi bi-chevron-right" />
                </button>
              </div>
            )}
            
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
