import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";
import { useToast } from "../context/ToastContext.jsx";

export default function ForgotPassword() {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await api.post("/api/auth/forgot-password", { email });
      showToast(data?.message || "If the email exists, a reset link was sent.", "success");
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to start reset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 520 }}>
      <div className="bg-white rounded-4 border shadow-sm p-5">
        <h3 className="fw-bold mb-2">Forgot password</h3>
        <p className="text-muted mb-4">We will email you a reset link.</p>
        <form onSubmit={submit} className="d-flex flex-column gap-3">
          <input
            className="form-control"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
          <button className="btn btn-primary rounded-pill" disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link to="/login" className="text-decoration-none">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}

