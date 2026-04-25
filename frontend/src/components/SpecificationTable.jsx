import React from "react";

export default function SpecificationTable({ listing }) {
  if (!listing) return null;

  const typeColors = {
    Green: { bg: "#f0fdf4", text: "#16a34a", border: "#86efac" },
    Blue:  { bg: "#eff6ff", text: "#2563eb", border: "#93c5fd" },
    Grey:  { bg: "#f8fafc", text: "#64748b", border: "#cbd5e1" },
  };
  const tc = typeColors[listing.hydrogenType] || typeColors.Grey;

  const specs = [
    { label: "Hydrogen Type", value: listing.hydrogenType ? (
      <span style={{ background: tc.bg, color: tc.text, border: `1px solid ${tc.border}`, borderRadius: "6px", padding: "3px 10px", fontWeight: 600 }}>
        {listing.hydrogenType} Hydrogen
      </span>
    ) : "—" },
    { label: "Price per kg", value: listing.price != null ? `$${listing.price}` : "—" },
    { label: "Inventory", value: listing.quantity != null ? `${listing.quantity} kg` : "—" },
    { label: "Purity", value: listing.purity != null ? `${listing.purity}%` : "—" },
    { label: "Production Site", value: listing.location || "—" },
    { label: "Production Capacity", value: listing.productionCapacity || "—" },
    { label: "Delivery", value: listing.deliveryAvailability || "—" },
    { label: "Supplier Verification", value: listing.supplier?.isVerified
      ? <span className="text-success fw-semibold"><i className="bi bi-patch-check-fill me-1"></i>Verified Supplier</span>
      : <span className="text-muted"><i className="bi bi-hourglass-split me-1"></i>Pending Verification</span>
    },
  ];

  return (
    <div className="bg-white p-4 rounded-4 shadow-sm mt-4 border border-light">
      <h5 className="fw-bold mb-4 text-dark">
        <i className="bi bi-file-earmark-text me-2 text-primary"></i>Technical Specifications
      </h5>
      <div className="table-responsive">
        <table className="table table-hover border mb-0" style={{ borderRadius: "12px", overflow: "hidden" }}>
          <tbody style={{ fontSize: "0.9rem" }}>
            {specs.map((spec, index) => (
              <tr key={index}>
                <th scope="row" className="bg-light align-middle py-3 border-end text-muted fw-semibold" style={{ width: "38%" }}>
                  {spec.label}
                </th>
                <td className="align-middle py-3 text-dark fw-medium ps-4">{spec.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
