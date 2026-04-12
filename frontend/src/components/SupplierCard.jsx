import React from "react";
import { Link } from "react-router-dom";

export default function SupplierCard({ supplier }) {
  if (!supplier) {
    // Skeleton Loader state
    return (
      <div className="card h-100 border-0 shadow-sm supplier-card skeleton-card">
        <div className="skeleton-img bg-secondary opacity-25 rounded-top" style={{ height: "180px" }}></div>
        <div className="card-body d-flex flex-column gap-2">
          <div className="skeleton-text bg-secondary opacity-25 w-75 rounded" style={{ height: "20px" }}></div>
          <div className="skeleton-text bg-secondary opacity-25 w-50 rounded" style={{ height: "16px" }}></div>
          <div className="skeleton-text bg-secondary opacity-25 w-100 rounded mt-2" style={{ height: "40px" }}></div>
        </div>
      </div>
    );
  }

  const { id, name, location, rating, description, price, imageUrl } = supplier;

  return (
    <div className="card h-100 border-0 shadow-sm supplier-card">
      <div className="position-relative overflow-hidden rounded-top" style={{ height: "180px" }}>
        <img 
          src={imageUrl} 
          className="card-img-top w-100 h-100 object-fit-cover supplier-img" 
          alt={name} 
        />
        <div className="position-absolute top-0 end-0 m-2 badge bg-white text-dark rounded-pill shadow-sm d-flex align-items-center gap-1">
          <span className="text-warning">★</span> <span className="fw-bold">{rating}</span>
        </div>
      </div>
      <div className="card-body d-flex flex-column">
        <h5 className="card-title fw-bold mb-1 text-truncate" title={name}>{name}</h5>
        <p className="card-text small text-muted mb-2">
          <i className="bi bi-geo-alt pe-1"></i>{location}
        </p>
        <p className="card-text small text-secondary flex-grow-1" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {description}
        </p>
        <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
          <div>
            <span className="fs-5 fw-bold text-primary">{price}</span>
            <span className="small text-muted">/kg</span>
          </div>
          <Link to={`/listings/${id || 'demo'}`} className="btn btn-outline-primary btn-sm px-3 rounded-pill fw-medium btn-hover-filled">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
