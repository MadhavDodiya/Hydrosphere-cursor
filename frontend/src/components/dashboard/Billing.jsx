import { useEffect, useState } from "react";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";

function planLabel(planId) {
  if (planId === "pro_supplier") return "Pro";
  if (planId === "enterprise") return "Enterprise";
  return "Free";
}

export default function Billing() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [sub, setSub] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const [{ data: plansRes }, { data: subRes }, { data: meRes }] = await Promise.all([
        api.get("/api/billing/plans"),
        api.get("/api/billing/me"),
        api.get("/api/users/me"),
      ]);
      setPlans(plansRes?.plans || []);
      setSub(subRes);
      if (meRes?._id) updateUser(meRes);
    } catch (err) {
      console.error(err);
      showToast(err?.response?.data?.message || "Failed to load billing");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const startCheckout = async (planId) => {
    try {
      const { data } = await api.post("/api/billing/checkout", { planId });
      if (data?.url) window.location.href = data.url;
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to start checkout");
    }
  };

  const openPortal = async () => {
    try {
      const { data } = await api.post("/api/billing/portal");
      if (data?.url) window.location.href = data.url;
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to open billing portal");
    }
  };

  if (user?.role !== "seller") {
    return (
      <div className="bg-white rounded-4 shadow-sm border p-4">
        <h5 className="fw-bold mb-1">Billing</h5>
        <p className="text-muted mb-0">Supplier subscriptions apply only to seller accounts.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center py-5 bg-white rounded-4 border">
        <div className="spinner-border text-primary mb-3"></div>
        <p className="text-secondary small mb-0">Loading billing details...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-4 shadow-sm border overflow-hidden">
      <div className="px-4 py-3 border-bottom bg-light-subtle d-flex justify-content-between align-items-center">
        <div>
          <h6 className="fw-bold mb-0 text-dark">Subscription & Billing</h6>
          <p className="text-secondary mb-0" style={{ fontSize: "0.75rem" }}>
            Current plan: <span className="fw-semibold">{planLabel(user?.plan)}</span>
          </p>
        </div>
        <button className="btn btn-outline-primary btn-sm rounded-pill px-4" onClick={openPortal}>
          Manage Billing
        </button>
      </div>

      <div className="p-4">
        <div className="alert alert-light border d-flex justify-content-between align-items-center">
          <div>
            <div className="fw-semibold text-dark">Status</div>
            <div className="text-muted small">
              {sub?.subscriptionStatus || user?.subscriptionStatus || "inactive"}
              {sub?.subscriptionCurrentPeriodEnd ? (
                <>
                  {" "}
                  • renews on {new Date(sub.subscriptionCurrentPeriodEnd).toLocaleDateString()}
                </>
              ) : null}
            </div>
          </div>
          <button className="btn btn-sm btn-outline-secondary" onClick={load}>
            Refresh
          </button>
        </div>

        <div className="row g-3">
          {plans
            .filter((p) => p.id !== "free")
            // Keep Enterprise hidden unless it is configured server-side.
            .filter((p) => p.id !== "enterprise" || Boolean(p.stripePriceId))
            .map((p) => (
              <div key={p.id} className="col-12 col-lg-6">
                <div className="border rounded-4 p-4 h-100">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h5 className="fw-bold mb-1">{p.name}</h5>
                      <div className="text-muted small mb-2">
                        Listings: {p.listingsLimit == null ? "Unlimited" : p.listingsLimit} • Leads/month:{" "}
                        {p.leadsLimitPerMonth == null ? "Unlimited" : p.leadsLimitPerMonth}
                      </div>
                    </div>
                    {user?.plan === p.id && (
                      <span className="badge bg-success-subtle text-success border rounded-pill px-3 py-2">
                        Active
                      </span>
                    )}
                  </div>
                  <button
                    className="btn btn-primary rounded-pill px-4 mt-3"
                    onClick={() => startCheckout(p.id)}
                    disabled={!p.stripePriceId}
                  >
                    Upgrade to {p.name}
                  </button>
                  {!p.stripePriceId && (
                    <div className="text-muted small mt-2">
                      Stripe price not configured on server.
                    </div>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
