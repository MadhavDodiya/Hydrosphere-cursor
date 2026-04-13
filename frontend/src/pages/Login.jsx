import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getApiErrorMessage } from "../utils/apiError.js";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, "Login failed. Please check your credentials."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0f7ff 0%, #e8f4fd 50%, #f0fdf4 100%)" }} className="d-flex align-items-center justify-content-center p-3">
      <div className="w-100" style={{ maxWidth: "460px" }}>
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
          <h1 className="fw-bold mb-1" style={{ fontSize: "1.6rem", color: "#0f172a" }}>Welcome back</h1>
          <p className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>Sign in to your account to continue</p>

          {error && (
            <div className="alert d-flex align-items-center gap-2 mb-4 py-3 px-3" style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", color: "#dc2626" }}>
              <i className="bi bi-exclamation-circle-fill flex-shrink-0"></i>
              <span style={{ fontSize: "0.875rem" }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-semibold" style={{ fontSize: "0.875rem", color: "#374151" }}>Email address</label>
              <div className="position-relative">
                <i className="bi bi-envelope position-absolute top-50 translate-middle-y ms-3" style={{ color: "#94a3b8" }}></i>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="form-control ps-5"
                  style={{ borderRadius: "12px", border: "1.5px solid #e2e8f0", padding: "0.75rem 1rem 0.75rem 2.75rem", fontSize: "0.9rem" }}
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="form-label fw-semibold" style={{ fontSize: "0.875rem", color: "#374151" }}>Password</label>
              <div className="position-relative">
                <i className="bi bi-lock position-absolute top-50 translate-middle-y ms-3" style={{ color: "#94a3b8" }}></i>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  className="form-control ps-5"
                  style={{ borderRadius: "12px", border: "1.5px solid #e2e8f0", padding: "0.75rem 3rem 0.75rem 2.75rem", fontSize: "0.9rem" }}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" className="btn p-0 border-0 position-absolute top-50 translate-middle-y end-0 me-3" onClick={() => setShowPassword(!showPassword)}>
                  <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`} style={{ color: "#94a3b8" }}></i>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn w-100 fw-semibold"
              style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "white", borderRadius: "12px", padding: "0.8rem", fontSize: "0.95rem", border: "none", boxShadow: "0 4px 15px rgba(37,99,235,0.3)", transition: "all 0.3s ease", opacity: submitting ? 0.7 : 1 }}
            >
              {submitting ? (
                <span><span className="spinner-border spinner-border-sm me-2" role="status"></span>Signing in…</span>
              ) : (
                <span><i className="bi bi-box-arrow-in-right me-2"></i>Sign in</span>
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <span className="text-muted" style={{ fontSize: "0.875rem" }}>Don't have an account? </span>
            <Link to="/signup" className="fw-semibold text-decoration-none" style={{ color: "#2563eb", fontSize: "0.875rem" }}>Create one free</Link>
          </div>
        </div>

        {/* Demo credentials */}
        <div className="text-center mt-4 p-3" style={{ background: "rgba(255,255,255,0.7)", borderRadius: "16px", backdropFilter: "blur(10px)" }}>
          <p className="mb-1 fw-semibold" style={{ fontSize: "0.8rem", color: "#64748b" }}>DEMO CREDENTIALS</p>
          <p className="mb-0" style={{ fontSize: "0.8rem", color: "#475569" }}>
            <strong>Buyer:</strong> buyer@hydrosphere.demo / <strong>Seller:</strong> seller@hydrosphere.demo
          </p>
          <p className="mb-0" style={{ fontSize: "0.8rem", color: "#475569" }}>Password: <code>password123</code></p>
        </div>
      </div>
    </div>
  );
}
