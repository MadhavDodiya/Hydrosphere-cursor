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

  const { id, name, location, rating, description, price, imageUrl, type, deliveryAvailability, productionCapacity, isVerified, purity } = supplier;

  const typeColors = {
    Green: { bg: "#ecfdf5", text: "#059669", dot: "#10b981" }, // Emerald
    Blue:  { bg: "#eff6ff", text: "#2563eb", dot: "#3b82f6" }, // Blue
    Grey:  { bg: "#f8fafc", text: "#475569", dot: "#64748b" }, // Slate
  };
  const typeColor = typeColors[type] || typeColors.Grey;

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
        {isVerified && (
          <div className="position-absolute top-0 start-0 m-3 badge rounded-pill bg-white text-primary border-0 shadow-sm px-3 py-2 fw-bold" style={{ backdropFilter: "blur(8px)", backgroundColor: "rgba(255,255,255,0.9)" }}>
            <i className="bi bi-patch-check-fill me-1 text-primary" aria-hidden="true" />
            ✓ Approved
          </div>
        )}
        {purity && (
          <div className="position-absolute bottom-0 end-0 m-3 badge rounded-pill bg-dark text-white border-0 shadow-sm px-3 py-2 fw-bold" style={{ backgroundColor: "rgba(15,23,42,0.8)" }}>
            {purity}% Purity
          </div>
        )}
      </div>
      <div className="card-body d-flex flex-column p-4">
        <h5 className="card-title fw-bold mb-1 text-truncate" title={name}>{name}</h5>
        <div className="d-flex align-items-center gap-2 mb-2">
          <p className="card-text small text-muted mb-0">
            <i className="bi bi-geo-alt pe-1"></i>{location}
          </p>
          {type && (
            <span style={{ background: typeColor.bg, color: typeColor.text, fontSize: "0.7rem", fontWeight: 800, borderRadius: "99px", padding: "2px 10px", border: `1px solid ${typeColor.dot}30`, whiteSpace: "nowrap" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: typeColor.dot, display: "inline-block", marginRight: 4, verticalAlign: "middle" }}></span>
              {type} H₂
            </span>
          )}
        </div>
        <p className="card-text small text-secondary flex-grow-1" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: "1.6" }}>
          {description}
        </p>
        <div className="d-flex flex-wrap gap-2 mt-2">
          {deliveryAvailability && (
            <span style={{ background: "#f0fdf4", color: "#16a34a", fontSize: "0.72rem", fontWeight: 600, borderRadius: "8px", padding: "4px 10px", border: "1px solid #dcfce7" }}>
              <i className="bi bi-truck me-1"></i>{deliveryAvailability}
            </span>
          )}
          {productionCapacity && (
            <span style={{ background: "#eff6ff", color: "#2563eb", fontSize: "0.72rem", fontWeight: 600, borderRadius: "8px", padding: "4px 10px", border: "1px solid #dbeafe" }}>
              <i className="bi bi-gear me-1"></i>{productionCapacity}
            </span>
          )}
        </div>
        <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top border-light">
          <div>
            <span className="fs-5 fw-bold hs-accent">{price}</span>
            <span className="small text-muted">/kg</span>
          </div>
          <Link to={`/listings/${id || 'demo'}`} className="btn btn-primary btn-sm px-4 py-2 rounded-pill fw-bold hs-shadow-hover">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
