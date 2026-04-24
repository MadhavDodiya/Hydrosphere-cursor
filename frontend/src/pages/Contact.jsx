import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../context/ToastContext.jsx";

export default function Contact() {
  const { showToast } = useToast();
  const formRef = useRef();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const [formData, setFormData] = useState({
    user_name: "",
    user_email: "",
    user_phone: "",
    user_role: "Buyer",
    subject: "General Inquiry",
    message: ""
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Contact Us — HydroSphere India";
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }
      
      setStatus({ 
        type: "success", 
        message: "Message sent! We'll get back to you within 24 hours." 
      });
      showToast("Message sent successfully!", "success");
      setFormData({
        user_name: "",
        user_email: "",
        user_phone: "",
        user_role: "Buyer",
        subject: "General Inquiry",
        message: ""
      });
    } catch (error) {
      console.error("Submission Error:", error);
      setStatus({ 
        type: "danger", 
        message: error.message || "Oops! Something went wrong. Please try again later." 
      });
      showToast(error.message || "Failed to send message.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      {/* ── 1. Hero Header ───────────────────────────────────── */}
      <section className="py-5 text-center text-white" style={{ backgroundColor: "#0A2342" }}>
        <div className="container py-4">
          <h1 className="display-4 fw-bold mb-3">Get in Touch</h1>
          <p className="lead opacity-75 mx-auto" style={{ maxWidth: "600px" }}>
            Have a question? Want to list your products? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* ── 2. Contact Content (Two Column) ──────────────────── */}
      <section className="py-5 bg-white">
        <div className="container py-4">
          <div className="row g-5">
            
            {/* Left: Contact Form */}
            <div className="col-lg-7">
              <div className="pe-lg-4">
                <h3 className="fw-bold mb-4" style={{ color: "#0A2342" }}>Send us a Message</h3>
                
                {status.message && (
                  <div className={`alert alert-${status.type} border-0 shadow-sm rounded-3 mb-4 d-flex align-items-center`}>
                    <i className={`bi bi-${status.type === 'success' ? 'check-circle' : 'exclamation-triangle'}-fill me-3 fs-4`}></i>
                    <div>{status.message}</div>
                  </div>
                )}

                <form ref={formRef} onSubmit={handleSubmit} className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Full Name *</label>
                    <input 
                      type="text" 
                      name="user_name"
                      className="form-control rounded-3 border-light-subtle py-2 shadow-none" 
                      placeholder="Enter your name"
                      required
                      value={formData.user_name}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Email Address *</label>
                    <input 
                      type="email" 
                      name="user_email"
                      className="form-control rounded-3 border-light-subtle py-2 shadow-none" 
                      placeholder="your@email.com"
                      required
                      value={formData.user_email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label small fw-bold text-muted">Phone Number (Optional)</label>
                    <input 
                      type="tel" 
                      name="user_phone"
                      className="form-control rounded-3 border-light-subtle py-2 shadow-none" 
                      placeholder="+91 XXXXX XXXXX"
                      value={formData.user_phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-12">
                    <label className="form-label small fw-bold text-muted d-block mb-3">I am a:</label>
                    <div className="btn-group w-100 shadow-sm" role="group">
                      <input 
                        type="radio" 
                        className="btn-check" 
                        name="user_role" 
                        id="role-buyer" 
                        value="Buyer"
                        checked={formData.user_role === "Buyer"}
                        onChange={handleChange}
                        autoComplete="off" 
                      />
                      <label className="btn btn-outline-teal rounded-start-3 py-2 fw-medium" htmlFor="role-buyer">Buyer</label>

                      <input 
                        type="radio" 
                        className="btn-check" 
                        name="user_role" 
                        id="role-supplier" 
                        value="Supplier"
                        checked={formData.user_role === "Supplier"}
                        onChange={handleChange}
                        autoComplete="off" 
                      />
                      <label className="btn btn-outline-teal rounded-end-3 py-2 fw-medium" htmlFor="role-supplier">Supplier</label>
                    </div>
                  </div>

                  <div className="col-md-12 mt-4">
                    <label className="form-label small fw-bold text-muted">Subject</label>
                    <select 
                      name="subject"
                      className="form-select rounded-3 border-light-subtle py-2 shadow-none"
                      value={formData.subject}
                      onChange={handleChange}
                    >
                      <option>General Inquiry</option>
                      <option>Want to List Products</option>
                      <option>Report an Issue</option>
                      <option>Partnership</option>
                    </select>
                  </div>

                  <div className="col-md-12">
                    <label className="form-label small fw-bold text-muted">Your Message *</label>
                    <textarea 
                      name="message"
                      className="form-control rounded-3 border-light-subtle shadow-none" 
                      rows="4" 
                      placeholder="How can we help you?"
                      required
                      value={formData.message}
                      onChange={handleChange}
                    ></textarea>
                  </div>

                  <div className="col-12 mt-4">
                    <button 
                      type="submit" 
                      className="btn btn-teal text-white w-100 py-3 fw-bold rounded-3 shadow-sm border-0 transition-all hover-up"
                      disabled={loading}
                      style={{ backgroundColor: "#1C7293", transition: "all 0.3s ease" }}
                    >
                      {loading ? (
                        <><span className="spinner-border spinner-border-sm me-2"></span>Sending...</>
                      ) : (
                        "Send Message"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right: Contact info */}
            <div className="col-lg-5">
              <div className="ps-lg-4 h-100 d-flex flex-column">
                <h3 className="fw-bold mb-4" style={{ color: "#0A2342" }}>Contact Information</h3>
                
                <div className="d-flex flex-column gap-3 mb-5">
                  <div className="card border-0 bg-light rounded-4 overflow-hidden mb-3">
                    <div className="card-body p-4 d-flex align-items-center gap-4">
                      <div className="contact-icon rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ backgroundColor: "#E6F0F4", color: "#1C7293", width: "56px", height: "56px" }}>
                        <i className="bi bi-envelope-fill fs-4"></i>
                      </div>
                      <div>
                        <div className="small text-muted fw-bold text-uppercase tracking-wider mb-1">Email us</div>
                        <a href="mailto:hello@hydrosphere.in" className="text-decoration-none fw-bold fs-5" style={{ color: "#0A2342" }}>hello@hydrosphere.in</a>
                      </div>
                    </div>
                  </div>

                  <div className="card border-0 bg-light rounded-4 overflow-hidden mb-3">
                    <div className="card-body p-4 d-flex align-items-center gap-4">
                      <div className="contact-icon rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ backgroundColor: "#E8F8F5", color: "#21B5A0", width: "56px", height: "56px" }}>
                        <i className="bi bi-whatsapp fs-4"></i>
                      </div>
                      <div>
                        <div className="small text-muted fw-bold text-uppercase tracking-wider mb-1">WhatsApp support</div>
                        <a href="https://wa.me/910000000000" target="_blank" rel="noreferrer" className="text-decoration-none fw-bold fs-5" style={{ color: "#0A2342" }}>+91 XXXXXXXXXX</a>
                      </div>
                    </div>
                  </div>

                  <div className="card border-0 bg-light rounded-4 overflow-hidden mb-3">
                    <div className="card-body p-4 d-flex align-items-center gap-4">
                      <div className="contact-icon rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style={{ backgroundColor: "#FDF5E6", color: "#B58921", width: "56px", height: "56px" }}>
                        <i className="bi bi-geo-alt-fill fs-4"></i>
                      </div>
                      <div>
                        <div className="small text-muted fw-bold text-uppercase tracking-wider mb-1">Location</div>
                        <div className="fw-bold fs-5" style={{ color: "#0A2342" }}>Ahmedabad, Gujarat, India</div>
                      </div>
                    </div>
                  </div>

                  <div className="alert border-0 bg-blue-light rounded-4 p-4 mt-auto" style={{ backgroundColor: "#F0F7FA" }}>
                    <div className="d-flex align-items-center gap-3">
                      <i className="bi bi-clock-history fs-4 text-primary"></i>
                      <div className="small fw-medium text-dark">
                        We typically respond within 24 hours. Our support team is available Mon-Sat, 9 AM - 6 PM.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* ── 3. Bottom Banner ─────────────────────────────────── */}
      <section className="py-5" style={{ backgroundColor: "#D6EAF4" }}>
        <div className="container py-4 text-center">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <h2 className="fw-bold mb-4" style={{ color: "#0A2342" }}>Are you a water product supplier?</h2>
              <Link 
                to="/signup" 
                className="btn btn-teal text-white btn-lg px-5 py-3 fw-bold rounded-pill shadow-sm border-0 transition-all hover-up"
                style={{ backgroundColor: "#1C7293", transition: "all 0.3s ease" }}
              >
                List Your Products Free →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style jsx="true">{`
        .contact-page { font-family: 'Inter', sans-serif; }
        .btn-outline-teal { 
          color: #1C7293; 
          border-color: #1C7293; 
          transition: all 0.2s ease;
        }
        .btn-check:checked + .btn-outline-teal {
          background-color: #1C7293;
          border-color: #1C7293;
          color: white;
        }
        .btn-outline-teal:hover {
          background-color: rgba(28, 114, 147, 0.05);
          color: #1C7293;
          border-color: #1C7293;
        }
        .hover-up:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
        }
        .contact-icon { transition: transform 0.3s ease; }
        .card:hover .contact-icon { transform: scale(1.1); }
      `}</style>
    </div>
  );
}
