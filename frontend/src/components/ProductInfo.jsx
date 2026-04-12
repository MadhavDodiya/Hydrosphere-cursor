import React from "react";

export default function ProductInfo({ title, rating, location, description }) {
  return (
    <div className="product-info mb-4">
      <h1 className="fw-bold mb-2 text-dark">{title}</h1>
      <div className="d-flex align-items-center gap-3 mb-3 text-secondary">
        <div className="d-flex align-items-center gap-1">
          <i className="bi bi-star-fill text-warning"></i>
          <span className="fw-bold text-dark">{rating}</span>
          <span className="small text-muted">(120 Reviews)</span>
        </div>
        <div className="vr bg-secondary"></div>
        <div className="small d-flex align-items-center gap-1">
          <i className="bi bi-geo-alt"></i> {location}
        </div>
      </div>
      
      <div className="product-image-container mb-4">
        <img 
          src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
          alt="Hydrogen Plant" 
        />
      </div>

      <div className="product-description bg-white p-4 rounded shadow-sm">
        <h4 className="fw-bold mb-3">Product Overview</h4>
        <p className="text-secondary lh-lg mb-0">
          {description}
          Our High Purity Hydrogen Gas is optimized for industrial and energy-related applications 
          requiring strict contamination control. Utilizing state-of-the-art compression and 
          storage technologies, we ensure that our hydrogen meets the highest standards for 
          purity, safety, and reliability. Perfect for fuel cells, chemical processing, 
          and specialized aerospace demands.
        </p>
      </div>
    </div>
  );
}
