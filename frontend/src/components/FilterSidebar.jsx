export default function FilterSidebar({ filters = {}, onFilterChange }) {
  const handleTypeChange = (type) => {
    const currentTypes = filters.types || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    onFilterChange({ ...filters, types: newTypes });
  };

  const handleClear = () => {
    onFilterChange({
      location: "",
      types: [],
      minPrice: "",
      maxPrice: "",
      minRating: false,
      deliveryAvailability: ""
    });
  };

  const FilterContent = ({ isMobile = false }) => (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold mb-0">Filters</h5>
        <button className="btn btn-link text-decoration-none p-0 small text-muted fw-semibold" onClick={handleClear}>Clear All</button>
      </div>

      <div className="mb-4">
        <label className="form-label fw-bold text-dark small text-uppercase" style={{ letterSpacing: '0.05em' }}>Location</label>
        <div className="position-relative">
          <i className="bi bi-geo-alt position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
          <input
            type="text"
            className="form-control ps-5"
            placeholder="Search location..."
            value={filters.location || ""}
            onChange={(e) => onFilterChange({ ...filters, location: e.target.value })}
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="form-label fw-bold text-dark small text-uppercase" style={{ letterSpacing: '0.05em' }}>Hydrogen Type</label>
        <div className="d-flex flex-column gap-2">
          {['Green', 'Blue', 'Grey'].map(type => (
            <div className="form-check custom-check" key={type}>
              <input
                className="form-check-input shadow-none cursor-pointer"
                type="checkbox"
                id={`filter-${type}`}
                checked={filters.types?.includes(type) || false}
                onChange={() => handleTypeChange(type)}
              />
              <label className="form-check-label small cursor-pointer fw-medium" htmlFor={`filter-${type}`}>{type} Hydrogen</label>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="form-label fw-bold text-dark small text-uppercase" style={{ letterSpacing: '0.05em' }}>Price Range (₹/kg)</label>
        <div className="d-flex align-items-center gap-2">
          <input
            type="number"
            className="form-control text-center shadow-none"
            placeholder="Min"
            value={filters.minPrice || ""}
            onChange={(e) => onFilterChange({ ...filters, minPrice: e.target.value })}
          />
          <span className="text-muted">to</span>
          <input
            type="number"
            className="form-control text-center shadow-none"
            placeholder="Max"
            value={filters.maxPrice || ""}
            onChange={(e) => onFilterChange({ ...filters, maxPrice: e.target.value })}
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="form-label fw-bold text-dark small text-uppercase" style={{ letterSpacing: '0.05em' }}>Availability</label>
        <select
          className="form-select shadow-none cursor-pointer"
          value={filters.deliveryAvailability || ""}
          onChange={(e) => onFilterChange({ ...filters, deliveryAvailability: e.target.value })}
        >
          <option value="">Any Availability</option>
          <option value="Available">Ready to Ship</option>
          <option value="30 Days Lead Time">30 Days Lead Time</option>
          <option value="60 Days Lead Time">60 Days Lead Time</option>
          <option value="Pickup Only">Pickup Only</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="form-label fw-bold text-dark small text-uppercase" style={{ letterSpacing: '0.05em' }}>Minimum Rating</label>
        <div className="form-check custom-check">
          <input
            className="form-check-input shadow-none cursor-pointer"
            type="checkbox"
            id="filter-rating4"
            checked={filters.minRating || false}
            onChange={(e) => onFilterChange({ ...filters, minRating: e.target.checked })}
          />
          <label className="form-check-label small cursor-pointer text-warning fw-bold" htmlFor="filter-rating4">
            <i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star text-muted ms-1"></i>
            <span className="text-muted fw-medium ms-2">& Up</span>
          </label>
        </div>
      </div>

      {isMobile && (
        <button className="btn btn-primary w-100 py-3 rounded-4 fw-bold mt-2 shadow-sm" data-bs-dismiss="offcanvas">
          Show Results
        </button>
      )}
    </>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="d-lg-none mb-4">
        <button 
          className="btn btn-white w-100 py-3 rounded-4 shadow-sm fw-bold border d-flex align-items-center justify-content-center gap-2"
          type="button" 
          data-bs-toggle="offcanvas" 
          data-bs-target="#offcanvasFilters"
        >
          <i className="bi bi-funnel-fill text-primary"></i>
          Refine Results
          {filters.types?.length > 0 && <span className="badge bg-primary rounded-pill ms-1">{filters.types.length}</span>}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <div className="d-none d-lg-block bg-white p-4 rounded-4 shadow-sm border border-secondary border-opacity-10 sticky-top" style={{ top: '100px' }}>
        <FilterContent />
      </div>

      {/* Mobile Offcanvas */}
      <div className="offcanvas offcanvas-bottom h-75 rounded-top-5 border-0 shadow-lg d-lg-none" tabIndex="-1" id="offcanvasFilters" aria-labelledby="offcanvasFiltersLabel">
        <div className="offcanvas-header px-4 pt-4 pb-0">
          <h5 className="offcanvas-title fw-bold" id="offcanvasFiltersLabel">Filter Suppliers</h5>
          <button type="button" className="btn-close shadow-none" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body p-4">
          <FilterContent isMobile />
        </div>
      </div>
    </>
  );
}
