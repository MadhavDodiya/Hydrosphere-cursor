import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/api.js";
import { useToast } from "../context/ToastContext.jsx";

export default function ResetPassword() {
  const { showToast } = useToast();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";
  const email = params.get("email") || "";
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { data } = await api.post("/api/auth/reset-password", { email, token, password });
      showToast(data?.message || "Password reset.", "success");
      navigate("/login");
    } catch (err) {
      showToast(err?.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 520 }}>
      <div className="bg-white rounded-4 border shadow-sm p-5">
        <h3 className="fw-bold mb-2">Reset password</h3>
        <p className="text-muted mb-4">Set a new password for {email || "your account"}.</p>
        <form onSubmit={submit} className="d-flex flex-column gap-3">
          <input
            className="form-control"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            minLength={6}
          />
          <button className="btn btn-primary rounded-pill" disabled={loading || !token || !email}>
            {loading ? "Saving..." : "Reset password"}
          </button>
          {(!token || !email) && (
            <div className="text-danger small">Invalid reset link (missing token/email).</div>
          )}
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

