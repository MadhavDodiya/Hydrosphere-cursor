import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import Footer from "../components/Footer.jsx";
import "./Pricing.css";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function Pricing() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);

  const calculatePrice = (basePrice) => {
    const gst = basePrice * 0.18;
    const total = basePrice + gst;
    return { basePrice, gst, total };
  };

  const plans = [
    {
      id: "Basic",
      name: "Basic",
      basePrice: 1000,
      description: "Essential features for small suppliers",
      features: [
        "10 Active Listings",
        "20 Inquiries per month",
        "Email Support",
        "Basic Profile Visibility"
      ],
    },
    {
      id: "Pro",
      name: "Pro",
      basePrice: 5000,
      description: "Advanced tools for growing suppliers",
      isPopular: true,
      features: [
        "50 Active Listings",
        "Unlimited Inquiries",
        "Priority Support",
        "Verified Supplier Badge",
        "Featured in Search Results"
      ],
    },
    {
      id: "Enterprise",
      name: "Enterprise",
      basePrice: 15000,
      description: "Full power for large hydrogen plants",
      features: [
        "Unlimited Listings",
        "Unlimited Inquiries",
        "Dedicated Account Manager",
        "API Access",
        "Custom Branding"
      ],
    },
  ];

  const handleSubscribe = async (planId) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user?.role !== "supplier") {
      alert("Only suppliers can subscribe to plans.");
      return;
    }

    try {
      setLoading(planId);
      const response = await axios.post("/api/billing/create-checkout-session", { planId });
      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId: response.data.id });
    } catch (err) {
      console.error("Subscription error:", err);
      alert("Failed to initiate checkout. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="hs-pricing-page">
      <div className="container py-5">
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold mb-3">Simple, Transparent <span className="text-primary">Pricing</span></h1>
          <p className="lead text-muted">Accelerate your hydrogen business with the right plan.</p>
        </div>

        <div className="row g-4 justify-content-center">
          {plans.map((plan) => {
            const { basePrice, gst, total } = calculatePrice(plan.basePrice);
            return (
              <div key={plan.id} className="col-lg-4">
                <div className={`card h-100 border-0 shadow-sm ${plan.isPopular ? 'border-primary border-top border-4' : ''}`}>
                  <div className="card-body p-5">
                    {plan.isPopular && <div className="badge bg-primary mb-3">Most Popular</div>}
                    <h3 className="card-title fw-bold">{plan.name}</h3>
                    <p className="text-muted small">{plan.description}</p>
                    
                    <div className="my-4">
                      <div className="d-flex align-items-baseline">
                        <span className="h4 mb-0">₹</span>
                        <span className="display-5 fw-bold">{basePrice}</span>
                        <span className="text-muted ms-2">/ month</span>
                      </div>
                      <div className="small text-muted mt-2">
                        + ₹{gst} GST (18%)
                      </div>
                      <div className="h5 fw-bold text-primary mt-1">
                        Total: ₹{total}
                      </div>
                    </div>

                    <button 
                      className={`btn w-100 py-3 rounded-pill fw-bold ${plan.isPopular ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={loading === plan.id}
                    >
                      {loading === plan.id ? "Processing..." : `Upgrade to ${plan.name}`}
                    </button>

                    <ul className="list-unstyled mt-4 mb-0">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="mb-3 d-flex align-items-center">
                          <i className="bi bi-check-circle-fill text-success me-3"></i>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
}
