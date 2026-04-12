export default function SupplierCard({ supplier }) {
  return (
    <div className="card hs-supplier-card h-100">
      <div className="hs-supplier-image">
        <img src={supplier.imageUrl} alt={supplier.name} loading="lazy" />
        <div className="hs-rating-pill">
          <span className="bi bi-star-fill text-warning me-1" aria-hidden="true" />
          {supplier.rating}
        </div>
      </div>

      <div className="card-body d-flex flex-column">
        <div className="d-flex align-items-start justify-content-between gap-3">
          <div>
            <h3 className="h6 fw-bold mb-1">{supplier.name}</h3>
            <div className="small text-body-secondary">
              <span className="bi bi-geo-alt me-1" aria-hidden="true" />
              {supplier.location}
            </div>
          </div>

          <button type="button" className="btn btn-outline-primary hs-icon-btn" aria-label={`Open ${supplier.name}`}>
            <span className="bi bi-arrow-right" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-auto pt-3 d-flex align-items-center justify-content-between">
          <div className="small text-body-secondary">Starting at</div>
          <div className="fw-bold">{supplier.price}</div>
        </div>
      </div>
    </div>
  );
}

