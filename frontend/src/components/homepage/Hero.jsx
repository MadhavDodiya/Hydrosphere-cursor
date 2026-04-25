import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();
  const productOptions = useMemo(() => ["All Types", "Green", "Blue", "Grey"], []);
  const [location, setLocation] = useState("");
  const [product, setProduct] = useState(productOptions[0]);

  return (
    <section className="hs-section">
      <div className="container">
        <div className="row align-items-center g-4 g-lg-5">
          <div className="col-12 col-lg-6">
            <div className="hs-hero-tag">
              <span className="bi bi-stars" aria-hidden="true" />
              <span>THE FUTURE OF ENERGY</span>
            </div>

            <h1 className="mt-3 display-5 fw-bold hs-hero-title">
              Find Verified <span className="hs-accent">Hydrogen Suppliers</span> Near You
            </h1>

            <p className="mt-3 hs-muted">
              Connect with trusted hydrogen providers for your business. Search, compare, and contact suppliers in
              minutes.
            </p>

            <div className="hs-search-card mt-5 p-3 p-md-2">
              <form
                className="hs-search-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  const params = new URLSearchParams();
                  if (location.trim()) params.set("location", location.trim());
                  // Only add type filter if it's not "All Types"
                  if (product && product !== "All Types") params.set("type", product);
                  navigate(`/marketplace?${params.toString()}`);
                }}
              >
                <div className="hs-search-field">
                  <span className="bi bi-geo-alt hs-search-icon" aria-hidden="true" />
                  <input
                    className="form-control bg-transparent"
                    placeholder="Location (e.g. India)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    aria-label="Location"
                  />
                </div>

                <div className="hs-search-field">
                  <span className="bi bi-funnel hs-search-icon" aria-hidden="true" />
                  <select
                    className="form-select bg-transparent"
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                    aria-label="Product"
                  >
                    {productOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="hs-search-action">
                  <button type="submit" className="btn btn-primary w-100 px-4 py-2 fw-bold hs-shadow-hover">
                    Search Suppliers
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="col-12 col-lg-6 mt-5 mt-lg-0">
            <div className="hs-hero-media">
              <img src="/images/hero-plant.png" alt="Industrial hydrogen plant" />
              <div className="hs-hero-badge">
                <div className="d-flex align-items-center gap-2">
                  <span className="hs-hero-badge-dot" aria-hidden="true" />
                  <div className="lh-sm">
                    <div className="fw-bold small">99.9% Purity</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hs-hero-stats mt-5 pt-lg-4 border-top border-secondary border-opacity-10">
          <div className="row g-4">
            <div className="col-6 col-md-4">
              <div className="d-flex align-items-center gap-3">
                <div className="hs-stat-icon">
                  <i className="bi bi-patch-check-fill" aria-hidden="true" />
                </div>
                <div>
                  <div className="fw-bold fs-5 lh-1">500+</div>
                  <div className="small hs-muted mt-1">Verified Suppliers</div>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-4">
              <div className="d-flex align-items-center gap-3">
                <div className="hs-stat-icon">
                  <i className="bi bi-droplet-fill" aria-hidden="true" />
                </div>
                <div>
                  <div className="fw-bold fs-5 lh-1">3</div>
                  <div className="small hs-muted mt-1">Hydrogen Types</div>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="d-flex align-items-center gap-3">
                <div className="hs-stat-icon">
                  <i className="bi bi-chat-dots-fill" aria-hidden="true" />
                </div>
                <div>
                  <div className="fw-bold fs-5 lh-1">Real-time</div>
                  <div className="small hs-muted mt-1">Inquiries</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
