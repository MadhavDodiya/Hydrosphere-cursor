import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getApiErrorMessage } from "../utils/apiError.js";

export default function Signup() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("buyer");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError("Please enter your full name (at least 2 characters).");
      return;
    }
    setSubmitting(true);
    try {
      await register(trimmed, email, password, role);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Registration failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0f7ff 0%, #e8f4fd 50%, #f0fdf4 100%)" }} className="d-flex align-items-center justify-content-center p-3">
      <div className="w-100" style={{ maxWidth: "500px" }}>
        {/* Logo */}
        <div className="text-center mb-4">
          <Link to="/" className="text-decoration-none">
            <span style={{ fontSize: "1.6rem", fontWeight: 800, background: "linear-gradient(135deg, #2563eb, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              HydroSphere
            </span>
          </Link>
          <p className="text-muted small mt-1">B2B Hydrogen Marketplace</p>
        </div>

        {/* Card */}
        <div className="card border-0 shadow-lg p-4 p-md-5" style={{ borderRadius: "24px", background: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)" }}>
          <h1 className="fw-bold mb-1" style={{ fontSize: "1.6rem", color: "#0f172a" }}>Create your account</h1>
          <p className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>Join the hydrogen marketplace today</p>

          {error && (
            <div className="alert d-flex align-items-center gap-2 mb-4 py-3 px-3" style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", color: "#dc2626" }}>
              <i className="bi bi-exclamation-circle-fill flex-shrink-0"></i>
              <span style={{ fontSize: "0.875rem" }}>{error}</span>
            </div>
          )}

          {/* Role Selector */}
          <div className="mb-4">
            <label className="form-label fw-semibold mb-2" style={{ fontSize: "0.875rem", color: "#374151" }}>I want to</label>
            <div className="d-flex gap-3">
              {[
                { value: "buyer", label: "Buyer", icon: "bi-cart3", desc: "Search listings & send inquiries" },
                { value: "seller", label: "Supplier", icon: "bi-shop", desc: "Add & manage hydrogen listings" },
              ].map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className="flex-fill text-start p-3 border-0"
                  style={{
                    borderRadius: "14px",
                    background: role === r.value ? "linear-gradient(135deg, #eff6ff, #dbeafe)" : "#f8fafc",
                    border: role === r.value ? "2px solid #3b82f6 !important" : "2px solid #e2e8f0",
                    outline: role === r.value ? "2px solid #3b82f6" : "2px solid transparent",
                    transition: "all 0.2s ease",
                    cursor: "pointer"
                  }}
                >
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <i className={`bi ${r.icon}`} style={{ color: role === r.value ? "#2563eb" : "#64748b", fontSize: "1.1rem" }}></i>
                    <span className="fw-semibold" style={{ fontSize: "0.9rem", color: role === r.value ? "#1d4ed8" : "#374151" }}>{r.label}</span>
                  </div>
                  <p className="mb-0" style={{ fontSize: "0.75rem", color: "#64748b" }}>{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="su-name" className="form-label fw-semibold" style={{ fontSize: "0.875rem", color: "#374151" }}>Full name</label>
              <div className="position-relative">
                <i className="bi bi-person position-absolute top-50 translate-middle-y ms-3" style={{ color: "#94a3b8" }}></i>
                <input id="su-name" type="text" required minLength={2} maxLength={120} autoComplete="name"
                  className="form-control ps-5"
                  style={{ borderRadius: "12px", border: "1.5px solid #e2e8f0", padding: "0.75rem 1rem 0.75rem 2.75rem", fontSize: "0.9rem" }}
                  placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="su-email" className="form-label fw-semibold" style={{ fontSize: "0.875rem", color: "#374151" }}>Email address</label>
              <div className="position-relative">
                <i className="bi bi-envelope position-absolute top-50 translate-middle-y ms-3" style={{ color: "#94a3b8" }}></i>
                <input id="su-email" type="email" required autoComplete="email"
                  className="form-control ps-5"
                  style={{ borderRadius: "12px", border: "1.5px solid #e2e8f0", padding: "0.75rem 1rem 0.75rem 2.75rem", fontSize: "0.9rem" }}
                  placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="su-password" className="form-label fw-semibold" style={{ fontSize: "0.875rem", color: "#374151" }}>Password <span className="text-muted fw-normal">(min 6 characters)</span></label>
              <div className="position-relative">
                <i className="bi bi-lock position-absolute top-50 translate-middle-y ms-3" style={{ color: "#94a3b8" }}></i>
                <input id="su-password" type={showPassword ? "text" : "password"} required minLength={6} autoComplete="new-password"
                  className="form-control ps-5"
                  style={{ borderRadius: "12px", border: "1.5px solid #e2e8f0", padding: "0.75rem 3rem 0.75rem 2.75rem", fontSize: "0.9rem" }}
                  placeholder="Create a strong password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" className="btn p-0 border-0 position-absolute top-50 translate-middle-y end-0 me-3" onClick={() => setShowPassword(!showPassword)}>
                  <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} style={{ color: "#94a3b8" }}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn w-100 fw-semibold"
              style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "white", borderRadius: "12px", padding: "0.8rem", fontSize: "0.95rem", border: "none", boxShadow: "0 4px 15px rgba(37,99,235,0.3)", opacity: submitting ? 0.7 : 1 }}
            >
              {submitting ? (
                <span><span className="spinner-border spinner-border-sm me-2" role="status"></span>Creating account…</span>
              ) : (
                <span><i className="bi bi-person-plus me-2"></i>Create account</span>
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <span className="text-muted" style={{ fontSize: "0.875rem" }}>Already have an account? </span>
            <Link to="/login" className="fw-semibold text-decoration-none" style={{ color: "#2563eb", fontSize: "0.875rem" }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
