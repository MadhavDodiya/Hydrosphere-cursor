import React from "react";

export default function ActivityFeed({ loading }) {
  if (loading) {
    return (
      <div className="dash-card p-4">
        <h5 className="fw-bold mb-4">Activity</h5>
        <div className="dash-skeleton w-100 mb-3" style={{ height: "50px" }}></div>
        <div className="dash-skeleton w-100 mb-3" style={{ height: "50px" }}></div>
      </div>
    );
  }

  const activities = [
    { type: "inquiry", icon: "bi-envelope-paper", color: "text-primary bg-primary bg-opacity-10", desc: "New inquiry from Apex Gases", time: "1 hr ago" },
    { type: "order", icon: "bi-check-circle", color: "text-success bg-success bg-opacity-10", desc: "Order #4421 was approved", time: "3 hrs ago" },
    { type: "message", icon: "bi-chat-dots", color: "text-info bg-info bg-opacity-10", desc: "TechFuel Corp sent a message", time: "Yesterday" },
    { type: "system", icon: "bi-shield-check", color: "text-secondary bg-secondary bg-opacity-10", desc: "Account verified successfully", time: "2 days ago" },
  ];

  return (
    <div className="dash-card p-4 h-100">
      <h5 className="fw-bold mb-4 text-dark">Recent Activity</h5>
      <div className="d-flex flex-column gap-4">
        {activities.map((act, i) => (
          <div key={i} className="d-flex gap-3">
            <div className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${act.color}`} style={{width: 40, height: 40}}>
              <i className={`bi ${act.icon}`}></i>
            </div>
            <div>
              <p className="mb-0 fw-medium text-dark small">{act.desc}</p>
              <span className="text-muted" style={{fontSize: "0.75rem"}}>{act.time}</span>
            </div>
          </div>
        ))}
      </div>
      <button className="btn btn-sm btn-outline-secondary w-100 mt-4">View All Activity</button>
    </div>
  );
}
