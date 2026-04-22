import React from "react";
import { Link } from "react-router-dom";

export default function SupplierCard({ supplier }) {
  if (!supplier) {
    // Skeleton Loader state
    return (
      <div className="card hs-supplier-card h-100 border-0">
        <div className="skeleton-img bg-secondary opacity-25" style={{ height: "220px", borderRadius: "24px 24px 0 0" }}></div>
        <div className="card-body d-flex flex-column gap-2 p-4">
          <div className="skeleton-text bg-secondary opacity-25 w-75 rounded" style={{ height: "24px" }}></div>
          <div className="skeleton-text bg-secondary opacity-25 w-50 rounded" style={{ height: "16px" }}></div>
          <div className="skeleton-text bg-secondary opacity-25 w-100 rounded mt-3" style={{ height: "40px" }}></div>
        </div>
      </div>
    );
  }

  const { id, name, location, rating, description, price, imageUrl } = supplier;

  return (
    <div className="card hs-supplier-card h-100 border-0">
      <div className="hs-supplier-image">
        <img 
          src={imageUrl} 
          className="w-100 h-100 object-fit-cover" 
          alt={name} 
        />
        <div className="hs-rating-pill">
          <span className="bi bi-star-fill text-warning me-1" aria-hidden="true" />
          {rating || "4.5"}
        </div>
      </div>
      <div className="card-body d-flex flex-column p-4">
        <h5 className="card-title fw-bold mb-1 text-truncate" title={name}>{name}</h5>
        <p className="card-text small text-muted mb-3">
          <i className="bi bi-geo-alt pe-1"></i>{location}
        </p>
        <p className="card-text small text-secondary flex-grow-1" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: "1.6" }}>
          {description}
        </p>
        <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top border-light">
          <div>
            <span className="fs-5 fw-bold" style={{ color: "var(--color-primary-end)" }}>{price}</span>
            <span className="small text-muted">/kg</span>
          </div>
          <Link to={`/listings/${id || 'demo'}`} className="btn btn-outline-primary btn-sm px-4 py-2 rounded-pill fw-medium">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
