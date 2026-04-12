const categories = [
  {
    icon: "bi bi-droplet",
    title: "Hydrogen Gas",
    desc: "Compressed hydrogen for industrial and mobility use.",
    bgClass: "bg-primary-subtle text-primary",
  },
  {
    icon: "bi bi-snow",
    title: "Liquid Hydrogen",
    desc: "Cryogenic hydrogen for large-scale transport.",
    bgClass: "bg-success-subtle text-success",
  },
  {
    icon: "bi bi-gear",
    title: "Equipment",
    desc: "Electrolyzers, compressors, and dispensers.",
    bgClass: "bg-warning-subtle text-warning-emphasis",
  },
  {
    icon: "bi bi-box-seam",
    title: "Storage",
    desc: "On-site tanks and container solutions.",
    bgClass: "bg-info-subtle text-info-emphasis",
  },
];

export default function CategorySection() {
  return (
    <section className="hs-section pt-0">
      <div className="container">
        <div className="d-flex align-items-end justify-content-between flex-wrap gap-2 mb-4">
          <div>
            <h2 className="h4 mb-1 fw-bold">Browse by Category</h2>
            <div className="hs-muted small">Explore products and services across the hydrogen value chain.</div>
          </div>
        </div>

        <div className="row g-3">
          {categories.map((c) => (
            <div className="col-12 col-sm-6 col-lg-3" key={c.title}>
              <div className="card hs-category-card h-100">
                <div className="card-body">
                  <div className={`hs-category-icon ${c.bgClass}`}>
                    <span className={c.icon} aria-hidden="true" />
                  </div>
                  <h3 className="h6 fw-bold mt-3 mb-1">{c.title}</h3>
                  <p className="mb-0 small hs-muted">{c.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

