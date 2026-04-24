import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

export default function NotificationBell({ user }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Mock notifications
  const notifications = [
    { id: 1, type: "inquiry", title: "New Inquiry", desc: "Global Hydrogen Inc sent a message", time: "2 min ago", unread: true },
    { id: 2, type: "approval", title: "Listing Approved", desc: "Your 'Green H2 - Mumbai' is live", time: "1 hour ago", unread: true },
    { id: 3, type: "system", title: "Welcome", desc: "Thanks for joining HydroSphere!", time: "Yesterday", unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="hs-notification-bell" ref={ref}>
      <button className="hs-bell-btn" onClick={() => setOpen(!open)}>
        <i className="bi bi-bell"></i>
        {unreadCount > 0 && <span className="hs-bell-dot">{unreadCount}</span>}
      </button>

      {open && (
        <div className="hs-notification-dropdown">
          <div className="hs-notif-header">
            <h6 className="mb-0">Notifications</h6>
            <button className="btn btn-link btn-sm text-decoration-none p-0">Mark all read</button>
          </div>
          <div className="hs-notif-list">
            {notifications.map(n => (
              <div key={n.id} className={`hs-notif-item ${n.unread ? "unread" : ""}`}>
                <div className={`hs-notif-icon ${n.type}`}>
                  <i className={`bi ${n.type === 'inquiry' ? 'bi-chat-dots' : n.type === 'approval' ? 'bi-check-circle' : 'bi-info-circle'}`}></i>
                </div>
                <div className="hs-notif-content">
                  <div className="hs-notif-title">{n.title}</div>
                  <div className="hs-notif-desc">{n.desc}</div>
                  <div className="hs-notif-time">{n.time}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="hs-notif-footer">
            <Link to="/dashboard" onClick={() => setOpen(false)}>View all notifications</Link>
          </div>
        </div>
      )}
    </div>
  );
}
