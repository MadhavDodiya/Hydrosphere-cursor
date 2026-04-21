import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api.js";
import { useToast } from "../context/ToastContext.jsx";

export default function VerifyEmail() {
  const { showToast } = useToast();
  const [params] = useSearchParams();
  const token = params.get("token");
  const email = params.get("email");
  const [status, setStatus] = useState("loading"); // loading | ok | error
  const [message, setMessage] = useState("");
  const [resendEmail, setResendEmail] = useState(email || "");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (!token || !email) {
          setStatus("idle");
          setMessage("");
          return;
        }
        const { data } = await api.get("/api/auth/verify-email", {
          params: { token, email },
        });
        setStatus("ok");
        setMessage(data?.message || "Email verified.");
      } catch (err) {
        setStatus("error");
        setMessage(err?.response?.data?.message || "Email verification failed.");
      }
    })();
  }, [token, email]);

  const resend = async (e) => {
    e.preventDefault();
    try {
      setResending(true);
      const { data } = await api.post("/api/auth/resend-verification", { email: resendEmail });
      showToast(data?.message || "Verification email sent.", "success");
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to resend verification email");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 720 }}>
      <div className="bg-white rounded-4 border shadow-sm p-5 text-center">
        <h3 className="fw-bold mb-2">Verify Email</h3>
        {status === "loading" ? (
          <>
            <div className="spinner-border text-primary mb-3"></div>
            <p className="text-muted mb-0">Verifying your email...</p>
          </>
        ) : status === "idle" ? (
          <>
            <p className="text-muted mb-4">
              Enter your email to resend the verification link.
            </p>
            <form onSubmit={resend} className="d-flex gap-2 justify-content-center flex-wrap">
              <input
                className="form-control"
                style={{ maxWidth: 360 }}
                placeholder="you@company.com"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                type="email"
                required
              />
              <button className="btn btn-primary rounded-pill px-4" disabled={resending}>
                {resending ? "Sending..." : "Resend"}
              </button>
            </form>
            <div className="mt-4">
              <Link to="/login" className="btn btn-outline-primary rounded-pill px-4">
                Back to Login
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="text-muted mb-4">{message}</p>
            <Link to="/login" className="btn btn-primary rounded-pill px-4">
              Go to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
