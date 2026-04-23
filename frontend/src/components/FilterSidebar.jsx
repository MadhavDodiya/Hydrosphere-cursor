import React, { useState } from "react";

export default function FilterSidebar({ filters = {}, onFilterChange }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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

  return (
    <div className="filter-sidebar bg-white p-3 rounded shadow-sm">
      <div className="d-flex justify-content-between align-items-center d-lg-none mb-3">
        <h5 className="mb-0 fw-bold">Filters</h5>
        <button
          className="btn btn-outline-primary btn-sm"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-expanded={isMobileOpen}
        >
          <i className="bi bi-funnel"></i> {isMobileOpen ? "Hide" : "Show"}
        </button>
      </div>

      <div className={`filter-content ${!isMobileOpen ? "d-none d-lg-block" : ""}`}>
        <div className="d-flex justify-content-between align-items-center mb-4 d-none d-lg-flex">
          <h5 className="fw-bold mb-0">Filters</h5>
          <button className="btn btn-link text-decoration-none p-0 small text-muted" onClick={handleClear}>Clear</button>
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold text-secondary small">Location</label>
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="e.g. Berlin, US"
            value={filters.location || ""}
            onChange={(e) => onFilterChange({ ...filters, location: e.target.value })}
          />
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold text-secondary small">Hydrogen Type</label>
          {['Green', 'Blue', 'Grey'].map(type => (
            <div className="form-check" key={type}>
              <input
                className="form-check-input shadow-none"
                type="checkbox"
                id={type}
                checked={filters.types?.includes(type) || false}
                onChange={() => handleTypeChange(type)}
              />
              <label className="form-check-label small" htmlFor={type}>{type} Hydrogen</label>
            </div>
          ))}
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold text-secondary small">Price Range ($/kg)</label>
          <div className="d-flex align-items-center gap-2">
            <input
              type="number"
              className="form-control form-control-sm text-center shadow-none"
              placeholder="Min"
              min="0"
              value={filters.minPrice || ""}
              onChange={(e) => onFilterChange({ ...filters, minPrice: e.target.value })}
            />
            <span className="text-muted">-</span>
            <input
              type="number"
              className="form-control form-control-sm text-center shadow-none"
              placeholder="Max"
              min="0"
              value={filters.maxPrice || ""}
              onChange={(e) => onFilterChange({ ...filters, maxPrice: e.target.value })}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold text-secondary small">Delivery</label>
          <select 
            className="form-select form-select-sm shadow-none"
            value={filters.deliveryAvailability || ""}
            onChange={(e) => onFilterChange({ ...filters, deliveryAvailability: e.target.value })}
          >
            <option value="">Any</option>
            <option value="Available">Ready to Ship</option>
            <option value="30 Days Lead Time">30 Days Lead Time</option>
            <option value="60 Days Lead Time">60 Days Lead Time</option>
            <option value="Pickup Only">Pickup Only</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold text-secondary small">Rating</label>
          <div className="form-check">
            <input
              className="form-check-input shadow-none"
              type="checkbox"
              id="rating4"
              checked={filters.minRating || false}
              onChange={(e) => onFilterChange({ ...filters, minRating: e.target.checked })}
            />
            <label className="form-check-label small text-warning" htmlFor="rating4">
              <i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star text-muted"></i> &amp; Up
            </label>
          </div>
        </div>
        
        <div className="d-lg-none mt-4">
          <button className="btn btn-primary w-100 fw-medium" onClick={() => setIsMobileOpen(false)}>Apply Filters</button>
        </div>
      </div>
    </div>
  );
}
