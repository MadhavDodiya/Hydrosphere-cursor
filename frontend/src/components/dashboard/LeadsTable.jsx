import React from "react";

export default function LeadsTable({ loading }) {
  const leads = [
    { id: "ORD-001", buyer: "Apex Gases", product: "High Purity H2", qty: "500 kg", status: "Pending", date: "Today, 10:24 AM" },
    { id: "ORD-002", buyer: "TechFuel Corp", product: "Liquid Hydrogen", qty: "1200 kg", status: "Approved", date: "Yesterday, 2:15 PM" },
    { id: "ORD-003", buyer: "GreenEnergy", product: "Electrolyzer Part", qty: "2 Units", status: "Rejected", date: "Oct 10, 2023" },
    { id: "ORD-004", buyer: "NeoX Space", product: "High Purity H2", qty: "850 kg", status: "Approved", date: "Oct 08, 2023" },
  ];

  const getStatusBadge = (status) => {
    switch(status) {
      case "Pending": return <span className="badge badge-soft-warning px-2 py-1 rounded-pill">Pending</span>;
      case "Approved": return <span className="badge badge-soft-success px-2 py-1 rounded-pill">Approved</span>;
      case "Rejected": return <span className="badge badge-soft-danger px-2 py-1 rounded-pill">Rejected</span>;
      default: return <span className="badge bg-secondary px-2 py-1 rounded-pill">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="dash-card p-4">
        <h5 className="fw-bold mb-4">Recent Leads & Orders</h5>
        <div className="dash-skeleton w-100 mb-3" style={{ height: "40px" }}></div>
        <div className="dash-skeleton w-100 mb-3" style={{ height: "40px" }}></div>
        <div className="dash-skeleton w-100 mb-2" style={{ height: "40px" }}></div>
      </div>
    );
  }

  return (
    <div className="dash-card p-0 overflow-hidden">
      <div className="d-flex justify-content-between align-items-center p-4 border-bottom">
        <h5 className="fw-bold mb-0 text-dark">Recent Leads & Orders</h5>
        <button className="btn btn-sm btn-outline-secondary">View All</button>
      </div>
      <div className="table-responsive">
        <table className="table table-hover mb-0 align-middle">
          <thead className="table-light text-muted small text-uppercase">
            <tr>
              <th className="ps-4 py-3 fw-semibold border-0">Buyer</th>
              <th className="py-3 fw-semibold border-0">Product</th>
              <th className="py-3 fw-semibold border-0">Qty</th>
              <th className="py-3 fw-semibold border-0">Status</th>
              <th className="py-3 fw-semibold border-0">Date</th>
              <th className="pe-4 py-3 fw-semibold border-0 text-end">Action</th>
            </tr>
          </thead>
          <tbody className="border-top-0">
            {leads.map((lead, idx) => (
              <tr key={idx}>
                <td className="ps-4 py-3 fw-medium text-dark">{lead.buyer}</td>
                <td className="py-3 text-secondary small">{lead.product}</td>
                <td className="py-3 text-secondary small">{lead.qty}</td>
                <td className="py-3">{getStatusBadge(lead.status)}</td>
                <td className="py-3 text-secondary small">{lead.date}</td>
                <td className="pe-4 py-3 text-end">
                  <button className="btn btn-sm btn-light fw-medium text-primary">Respond</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
