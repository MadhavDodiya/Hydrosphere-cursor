import React from "react";

export default function SpecificationTable() {
  const specs = [
    { label: "Purity", value: "99.99%" },
    { label: "Delivery Type", value: "Gaseous / Compressed" },
    { label: "Storage Method", value: "Type IV Cylinders" },
    { label: "Pressure", value: "350 Bar / 700 Bar" },
    { label: "Availability", value: "In Stock - 5000 kg" },
    { label: "Source", value: "Green Hydrogen (PEM Electrolysis)" }
  ];

  return (
    <div className="bg-white p-4 rounded shadow-sm mt-4">
      <h4 className="fw-bold mb-3">Specifications</h4>
      <div className="table-responsive">
        <table className="table table-bordered specs-table mb-0">
          <tbody>
            {specs.map((spec, index) => (
              <tr key={index}>
                <th scope="row" className="align-middle py-3">{spec.label}</th>
                <td className="align-middle py-3 fw-medium">{spec.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
