import { Link } from "react-router-dom";
import SupplierCard from "./SupplierCard.jsx";

const suppliers = [
  {
    name: "Nordic H2 Solutions",
    location: "Oslo, Norway",
    rating: "4.9",
    price: "$4.50/kg",
    imageUrl: "/images/supplier-1.png",
  },
  {
    name: "SolarHydro Gen",
    location: "Austin, TX",
    rating: "4.8",
    price: "$3.95/kg",
    imageUrl: "/images/supplier-2.png",
  },
  {
    name: "Apex Energy Co.",
    location: "Rotterdam, NL",
    rating: "4.7",
    price: "$4.10/kg",
    imageUrl: "/images/supplier-3.png",
  },
];

export default function FeaturedSuppliers() {
  return (
    <section className="hs-section pt-0">
      <div className="container">
        <div className="d-flex align-items-end justify-content-between flex-wrap gap-2 mb-4">
          <div>
            <h2 className="h4 mb-1 fw-bold">Featured Suppliers</h2>
            <div className="hs-muted small">Top-rated partners in your region meeting purity standards.</div>
          </div>
          <Link to="/marketplace" className="btn btn-link text-decoration-none px-0">
            View All Suppliers <span className="bi bi-arrow-right" aria-hidden="true" />
          </Link>
        </div>

        <div className="row g-3">
          {suppliers.map((supplier) => (
            <div className="col-12 col-md-6 col-lg-4" key={supplier.name}>
              <SupplierCard supplier={supplier} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

