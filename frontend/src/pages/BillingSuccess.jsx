import { useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function BillingSuccess() {
  const { updateUser } = useAuth();

  useEffect(() => {
    // Webhook updates are async; best-effort refresh.
    (async () => {
      try {
        const { data } = await api.get("/api/users/me");
        if (data?._id) updateUser(data);
      } catch {
        // ignore
      }
    })();
  }, [updateUser]);

  return (
    <div className="container py-5">
      <div className="bg-white rounded-4 border shadow-sm p-5 text-center">
        <h3 className="fw-bold mb-2">Payment successful</h3>
        <p className="text-muted mb-4">Your subscription is being activated. This can take a few seconds.</p>
        <Link to="/dashboard/billing" className="btn btn-primary rounded-pill px-4">
          Go to Billing
        </Link>
      </div>
    </div>
  );
}

