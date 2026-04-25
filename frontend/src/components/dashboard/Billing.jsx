import { useEffect, useState } from "react";
import api from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function Billing() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [sub, setSub] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(null);

  const [loadTrigger, setLoadTrigger] = useState(0);
  const reload = () => setLoadTrigger(n => n + 1);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const [{ data: plansRes }, { data: subRes }, { data: meRes }] = await Promise.all([
          api.get("/api/billing/plans"),
          api.get("/api/billing/me"),
          api.get("/api/users/me"),
        ]);
        if (cancelled) return;
        setPlans(plansRes?.plans || []);
        setSub(subRes);
        if (meRes?._id) updateUser(meRes);
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        showToast(err?.response?.data?.message || "Failed to load billing");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [loadTrigger]);

  const startCheckout = async (planId) => {
    try {
      setCheckoutLoading(planId);
      const { data: session } = await api.post("/api/billing/create-checkout-session", { planId });
      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId: session.id });
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to start checkout", "error");
    } finally {
      setCheckoutLoading(null);
    }
  };

  if (user?.role !== "supplier") {
    return (
      <div className="bg-white rounded-4 shadow-sm border p-4">
        <h5 className="fw-bold mb-1">Billing</h5>
        <p className="text-muted mb-0">Supplier subscriptions apply only to supplier accounts.</p>
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
            Current plan: <span className="fw-semibold">{user?.plan || "none"}</span>
          </p>
        </div>
      </div>

      <div className="p-4">
        <div className="alert alert-light border d-flex justify-content-between align-items-center mb-4">
          <div>
            <div className="fw-semibold text-dark">Status</div>
            <div className="text-muted small">
              {sub?.subscriptionStatus || user?.subscriptionStatus || "inactive"}
              {sub?.subscriptionCurrentPeriodEnd ? (
                <>
                  {" "}
                  • expires on {new Date(sub.subscriptionCurrentPeriodEnd).toLocaleDateString()}
                </>
              ) : null}
            </div>
          </div>
          <button className="btn btn-sm btn-outline-secondary" onClick={reload}>
            Refresh
          </button>
        </div>

        <div className="row g-4">
          {plans
            .filter((p) => p.id !== "none")
            .map((p) => (
              <div key={p.id} className="col-12 col-lg-4">
                <div className={`border rounded-4 p-4 h-100 ${user?.plan === p.id ? 'border-primary' : ''}`}>
                  <h5 className="fw-bold mb-1">{p.name}</h5>
                  <div className="text-muted small mb-3">
                    Listings: {p.listingsLimit == null ? "Unlimited" : p.listingsLimit} • Leads: {p.leadsLimitPerMonth == null ? "Unlimited" : p.leadsLimitPerMonth}
                  </div>
                  <div className="mb-4">
                    <span className="h3 fw-bold">₹{p.basePrice}</span>
                    <span className="text-muted small"> + 18% GST</span>
                  </div>
                  <button
                    className={`btn w-100 rounded-pill py-2 fw-bold ${user?.plan === p.id ? 'btn-success' : 'btn-primary'}`}
                    onClick={() => startCheckout(p.id)}
                    disabled={user?.plan === p.id || checkoutLoading === p.id}
                  >
                    {checkoutLoading === p.id ? "Processing..." : user?.plan === p.id ? "Current Plan" : `Upgrade`}
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
