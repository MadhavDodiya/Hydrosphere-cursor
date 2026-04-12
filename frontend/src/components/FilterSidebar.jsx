import React, { useState } from "react";

export default function FilterSidebar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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
        <h5 className="fw-bold d-none d-lg-block mb-4">Filters</h5>

        <div className="mb-4">
          <label className="form-label fw-semibold text-secondary small">Location</label>
          <select className="form-select form-select-sm border-0 border-bottom rounded-0 px-0">
            <option value="">All Locations</option>
            <option value="us">United States</option>
            <option value="eu">Europe</option>
            <option value="asia">Asia Pacific</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold text-secondary small">Product Type</label>
          <div className="form-check">
            <input className="form-check-input shadow-none" type="checkbox" id="gaseous" />
            <label className="form-check-label small" htmlFor="gaseous">Hydrogen Gas</label>
          </div>
          <div className="form-check">
            <input className="form-check-input shadow-none" type="checkbox" id="liquid" />
            <label className="form-check-label small" htmlFor="liquid">Liquid Hydrogen</label>
          </div>
          <div className="form-check">
            <input className="form-check-input shadow-none" type="checkbox" id="equipment" />
            <label className="form-check-label small" htmlFor="equipment">Equipment</label>
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold text-secondary small">Price Range ($/kg)</label>
          <div className="d-flex align-items-center gap-2">
            <input type="number" className="form-control form-control-sm text-center" placeholder="Min" min="0" />
            <span className="text-muted">-</span>
            <input type="number" className="form-control form-control-sm text-center" placeholder="Max" min="0" />
          </div>
        </div>

        <div className="mb-4">
          <label className="form-label fw-semibold text-secondary small">Rating</label>
          <div className="form-check">
            <input className="form-check-input shadow-none" type="checkbox" id="rating4" />
            <label className="form-check-label small text-warning" htmlFor="rating4">
              <i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star text-muted"></i> &amp; Up
            </label>
          </div>
        </div>

        <button className="btn btn-primary w-100 fw-medium">Apply Filters</button>
      </div>
    </div>
  );
}
