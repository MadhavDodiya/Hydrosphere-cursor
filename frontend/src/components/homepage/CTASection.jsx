import { Link } from "react-router-dom";

export default function CTASection() {
  return (
    <section className="hs-section">
      <div className="container">
        <div className="hs-cta hs-shadow-soft p-4 p-md-5 text-white text-center">
          <h2 className="h2 fw-bold mb-2">Scale Your Hydrogen Reach</h2>
          <p className="mb-4 text-white-50">
            Join as a supplier, connect with buyers, and unlock new opportunities.
          </p>
          <div className="d-flex flex-column flex-sm-row justify-content-center gap-2">
            <Link to="/signup" className="btn btn-light px-4 fw-semibold">
              Join as Supplier
            </Link>
            <a href="#contact" className="btn btn-outline-light px-4 fw-semibold">
              Request Demo
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

