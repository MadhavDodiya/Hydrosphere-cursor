import React from "react";
import DashboardChart from "../../dashboard/DashboardChart.jsx";

export default function AdminAnalytics() {
  return (
    <div className="admin-analytics fade-in">
      <div className="row g-4 mb-4">
        <div className="col-12 col-xl-6">
          <div className="card border-0 shadow-sm rounded-4 h-100 p-4">
            <h6 className="fw-bold mb-4">User Growth (Last 8 Weeks)</h6>
            <DashboardChart id="usersChart" color="#EF4444" label="New Users" />
          </div>
        </div>
        <div className="col-12 col-xl-6">
          <div className="card border-0 shadow-sm rounded-4 h-100 p-4">
            <h6 className="fw-bold mb-4">Listing Volume (Last 8 Weeks)</h6>
            <DashboardChart id="listingsChart" color="#B91C1C" label="New Listings" />
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4">
        <div className="card-header bg-transparent p-4 border-0">
          <h6 className="fw-bold mb-0">Platform Distribution by Category</h6>
        </div>
        <div className="card-body p-4 pt-0">
          {/* Summary table placeholder */}
          <div className="table-responsive">
            <table className="table table-borderless align-middle mb-0">
              <thead className="bg-light rounded-3">
                <tr className="small text-muted text-uppercase fw-bold">
                  <th className="px-3 py-2">Category</th>
                  <th className="py-2">Listings</th>
                  <th className="py-2">Growth</th>
                  <th className="py-2 text-end">Market Share</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: "Green Hydrogen", count: 42, growth: "+15%", share: "56%" },
                  { name: "Blue Hydrogen", count: 21, growth: "+8%", share: "28%" },
                  { name: "Grey Hydrogen", count: 12, growth: "-2%", share: "16%" },
                ].map((cat, i) => (
                  <tr key={i} className="border-bottom">
                    <td className="px-3 py-3 fw-bold">{cat.name}</td>
                    <td className="py-3">{cat.count} items</td>
                    <td className="py-3 text-success small fw-bold">{cat.growth}</td>
                    <td className="py-3 text-end">
                       <div className="d-flex align-items-center justify-content-end gap-3">
                          <span className="small text-muted">{cat.share}</span>
                          <div className="progress" style={{ width: 100, height: 6 }}>
                             <div className="progress-bar bg-danger" style={{ width: cat.share }}></div>
                          </div>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
