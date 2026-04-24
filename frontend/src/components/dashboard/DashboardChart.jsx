import React from "react";

export default function DashboardChart({ loading, data, planUsage }) {
  const chartData = data && data.length > 0 ? data : [
    { label: "Mon", leads: 0, views: 0 }, { label: "Tue", leads: 0, views: 0 }, { label: "Wed", leads: 0, views: 0 },
    { label: "Thu", leads: 0, views: 0 }, { label: "Fri", leads: 0, views: 0 }, { label: "Sat", leads: 0, views: 0 },
    { label: "Sun", leads: 0, views: 0 }
  ];
  const loadingHeights = ["42%", "58%", "36%", "72%", "54%", "63%", "47%"];

  const maxLeads = Math.max(...chartData.map(d => d.leads), 1);
  const maxViews = Math.max(...chartData.map(d => d.views), 1);

  if (loading) {
    return (
      <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
        <div style={{ height: 20, background: "#f1f5f9", borderRadius: 6, width: "40%", marginBottom: 24, animation: "dashPulse 1.5s infinite" }}></div>
        <div className="d-flex align-items-end gap-2" style={{ height: 200 }}>
          {chartData.map((_, i) => (
            <div key={i} style={{ flex: 1, background: "#f1f5f9", borderRadius: "6px 6px 0 0", height: loadingHeights[i % loadingHeights.length], animation: "dashPulse 1.5s infinite" }}></div>
          ))}
        </div>
      </div>
    );
  }

  const totalLeads = chartData.reduce((a, d) => a + d.leads, 0);
  const totalViews = chartData.reduce((a, d) => a + d.views, 0);

  return (
    <div className="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center px-4 pt-4 pb-3 border-bottom gap-3">
        <div>
          <h5 className="fw-bold mb-0" style={{ color: "#0f172a" }}>Analytics Overview</h5>
          <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>Engagement performance & resource usage</p>
        </div>
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center gap-2">
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--color-primary-end)", display: "inline-block" }}></span>
            <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 500 }}>Inquiries</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#94a3b8", display: "inline-block" }}></span>
            <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 500 }}>Views</span>
          </div>
        </div>
      </div>

      <div className="row g-0">
        {/* Chart Column */}
        <div className="col-12 col-md-8 p-4 border-end">
          <div className="position-relative" style={{ height: 220 }}>
            {/* SVG Line for Views */}
            <svg 
              style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                width: '100%', 
                height: '100%', 
                zIndex: 1,
                pointerEvents: 'none',
                overflow: 'visible'
              }}
            >
              <path
                d={chartData.map((d, i) => {
                  const x = (i / (chartData.length - 1)) * 100;
                  const y = 100 - (d.views / maxViews) * 100;
                  return `${i === 0 ? 'M' : 'L'} ${x}% ${y}%`;
                }).join(' ')}
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2"
                strokeDasharray="4 4"
                style={{ transition: 'd 0.8s ease' }}
              />
            </svg>

            <div className="d-flex align-items-end gap-2 h-100">
              {chartData.map((d, i) => {
                const leadPct = (d.leads / maxLeads) * 100;
                const viewPct = (d.views / maxViews) * 100;
                return (
                  <div key={i} className="d-flex flex-column align-items-center flex-fill h-100 group">
                    <div className="position-relative d-flex align-items-end justify-content-center w-100 flex-grow-1">
                      {/* Views Dot */}
                      <div 
                        style={{ 
                          position: 'absolute', 
                          bottom: `${viewPct}%`, 
                          width: 8, 
                          height: 8, 
                          background: '#94a3b8', 
                          borderRadius: '50%', 
                          zIndex: 2,
                          transform: 'translateY(4px)',
                          transition: 'bottom 0.8s ease',
                          border: '2px solid white'
                        }}
                        title={`${d.views} views`}
                      />
                      {/* Inquiries Bar */}
                      <div
                        style={{
                          width: "60%",
                          height: `${Math.max(leadPct, 4)}%`,
                          background: "linear-gradient(180deg, var(--color-primary-end), var(--color-primary-start))",
                          borderRadius: "6px 6px 2px 2px",
                          transition: "height 0.8s cubic-bezier(0.34,1.56,0.64,1)",
                          opacity: 0.85,
                          cursor: "pointer",
                        }}
                        title={`${d.leads} inquiries`}
                      />
                    </div>
                    <span style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 12, fontWeight: 600 }}>{d.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="row g-3 mt-4 pt-3 border-top">
            <div className="col-6">
              <div className="small text-muted mb-1">Total Inquiries</div>
              <div className="h4 fw-bold mb-0" style={{ color: "var(--color-primary-end)" }}>{totalLeads}</div>
            </div>
            <div className="col-6">
              <div className="small text-muted mb-1">Total Views</div>
              <div className="h4 fw-bold mb-0 text-secondary">{totalViews}</div>
            </div>
          </div>
        </div>

        {/* Plan Usage Column */}
        <div className="col-12 col-md-4 p-4 bg-light bg-opacity-25">
          <h6 className="fw-bold mb-4" style={{ color: "#0f172a" }}>Plan Usage</h6>
          
          {planUsage ? (
            <div className="d-flex flex-column gap-4">
              <div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="small fw-bold">Listings</span>
                  <span className="small text-muted">{planUsage.listings.used} of {planUsage.listings.limit || "∞"}</span>
                </div>
                <div className="progress" style={{ height: 8, borderRadius: 4 }}>
                  <div 
                    className="progress-bar bg-primary" 
                    style={{ width: `${planUsage.listings.percentage}%`, borderRadius: 4 }}
                  />
                </div>
              </div>

              <div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="small fw-bold">Monthly Leads</span>
                  <span className="small text-muted">{planUsage.leads.used} of {planUsage.leads.limit || "∞"}</span>
                </div>
                <div className="progress" style={{ height: 8, borderRadius: 4 }}>
                  <div 
                    className="progress-bar bg-info" 
                    style={{ width: `${planUsage.leads.percentage}%`, borderRadius: 4 }}
                  />
                </div>
              </div>

              <div className="mt-2 p-3 rounded-4 bg-white border border-secondary border-opacity-10 shadow-sm">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <i className="bi bi-rocket-takeoff-fill text-primary"></i>
                  <span className="small fw-bold">Need more?</span>
                </div>
                <p className="small text-muted mb-0">Upgrade to Enterprise for unlimited listings and direct lead routing.</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-bar-chart fs-1 opacity-25"></i>
              <p className="small mt-2">Usage data unavailable</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
