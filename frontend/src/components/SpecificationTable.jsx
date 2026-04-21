import React from "react";

export default function SpecificationTable({ listing }) {
  if (!listing) return null;

  const specs = [
    { label: "Producer", value: listing.companyName },
    { label: "Hydrogen Type", value: `${listing.hydrogenType} Hydrogen` },
    { label: "Price per kg", value: `$${listing.price}` },
    { label: "Current Inventory", value: `${listing.quantity} kg` },
    { label: "Production Site", value: listing.location },
    { label: "Verification Status", value: listing.seller?.isVerified ? "✅ Verified Supplier" : "⏳ Pending Verification" }
  ];

  return (
    <div className="bg-white p-4 rounded-4 shadow-sm mt-4 border border-light">
      <h5 className="fw-bold mb-4 text-dark"><i className="bi bi-file-earmark-text me-2 text-primary"></i>Technical Specifications</h5>
      <div className="table-responsive">
        <table className="table table-hover border mb-0" style={{ borderRadius: "12px", overflow: "hidden" }}>
          <tbody style={{ fontSize: "0.9rem" }}>
            {specs.map((spec, index) => (
              <tr key={index}>
                <th scope="row" className="bg-light align-middle py-3 border-end text-muted fw-semibold" style={{ width: "35%" }}>{spec.label}</th>
                <td className="align-middle py-3 text-dark fw-medium ps-4">{spec.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
