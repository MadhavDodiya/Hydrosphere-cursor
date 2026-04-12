import React from "react";
import SupplierCard from "./SupplierCard.jsx";

export default function RelatedSuppliers() {
  const similarSuppliers = [
    {
      id: "related1",
      name: "Global Energy Sol.",
      location: "Frankfurt, Germany",
      rating: 4.6,
      description: "Providing high quality hydrogen solutions for manufacturing and chemical plants.",
      price: "$4.10",
      imageUrl: "https://images.unsplash.com/photo-1518623489648-a173ef7824f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "related2",
      name: "NextGen H2",
      location: "Oslo, Norway",
      rating: 4.9,
      description: "100% offshore wind powered green hydrogen production.",
      price: "$4.75",
      imageUrl: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    },
    {
      id: "related3",
      name: "Apex Gases",
      location: "Texas, USA",
      rating: 4.5,
      description: "Reliable bulk transport of compressed hydrogen.",
      price: "$3.90",
      imageUrl: "https://images.unsplash.com/photo-1611273426858-450d8e3c9cce?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    }
  ];

  return (
    <div className="related-suppliers mt-5 pt-4 border-top">
      <h3 className="fw-bold mb-4">Similar Suppliers</h3>
      <div className="row g-4">
        {similarSuppliers.map((sup) => (
          <div key={sup.id} className="col-12 col-md-4">
            <SupplierCard supplier={sup} />
          </div>
        ))}
      </div>
    </div>
  );
}
