import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Footer from "../components/Footer.jsx";
import "./Pricing.css";

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState("monthly"); // 'weekly', 'monthly', 'yearly'
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCTA = () => {
    if (isAuthenticated) {
      navigate("/dashboard/billing");
    } else {
      navigate("/signup");
    }
  };

  // Prices in INR (₹)
  const plans = [
    {
      id: "free",
      name: "Starter",
      description: "Perfect for testing the platform",
      price: {
        weekly: 0,
        monthly: 0,
        yearly: 0,
      },
      features: [
        "Up to 3 active listings",
        "10 buyer leads per month",
        "Standard support",
        "Basic analytics"
      ],
      notIncluded: [
        "Verified Supplier badge",
        "Unlimited listings",
        "Priority 24/7 support"
      ]
    },
    {
      id: "pro_supplier",
      name: "Pro",
      description: "For growing hydrogen businesses",
      isPopular: true,
      price: {
        weekly: 999,
        monthly: 3999,
        yearly: 39999,
      },
      features: [
        "Up to 50 active listings",
        "Unlimited buyer leads",
        "Verified Supplier badge",
        "Advanced analytics dashboard",
        "Priority email support"
      ],
      notIncluded: [
        "Dedicated account manager",
        "Custom API integration"
      ]
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "Maximum visibility and volume",
      price: {
        weekly: 4999,
        monthly: 14999,
        yearly: 149999,
      },
      features: [
        "Unlimited active listings",
        "Unlimited buyer leads",
        "Verified Supplier badge",
        "Enterprise analytics suite",
        "Priority 24/7 phone support",
        "Dedicated account manager",
        "Custom API integration"
      ],
      notIncluded: []
    }
  ];

  // Helper to calculate slider position
  const getSliderTransform = () => {
    if (billingCycle === "weekly") return "translateX(0%)";
    if (billingCycle === "monthly") return "translateX(100%)";
    return "translateX(200%)";
  };

  return (
    <div className="hs-pricing-page">
      <div className="container">
        <div className="text-center mb-5">
          <div className="badge bg-primary-subtle text-primary mb-3 px-3 py-2 rounded-pill fw-bold" style={{ letterSpacing: '0.1em' }}>
            PRICING PLANS
          </div>
          <h1 className="hs-pricing-title">
            Simple, transparent <span className="hs-accent">pricing</span>
          </h1>
          <p className="text-muted fs-5 mx-auto" style={{ maxWidth: "600px" }}>
            Choose the perfect plan to accelerate your hydrogen business. No hidden fees. Cancel anytime.
          </p>
        </div>

        {/* Toggle Switch */}
        <div className="d-flex justify-content-center mb-5">
          <div className="hs-pricing-toggle">
            <div className="hs-toggle-slider" style={{ transform: getSliderTransform() }}></div>
            <button 
              className={`hs-toggle-btn ${billingCycle === "weekly" ? "active" : ""}`}
              onClick={() => setBillingCycle("weekly")}
            >
              Weekly
            </button>
            <button 
              className={`hs-toggle-btn ${billingCycle === "monthly" ? "active" : ""}`}
              onClick={() => setBillingCycle("monthly")}
            >
              Monthly
            </button>
            <button 
              className={`hs-toggle-btn ${billingCycle === "yearly" ? "active" : ""}`}
              onClick={() => setBillingCycle("yearly")}
            >
              Yearly
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: "0.6rem" }}>
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="row g-4 justify-content-center">
          {plans.map((plan) => (
            <div key={plan.id} className="col-12 col-md-6 col-lg-4">
              <div className={`hs-pricing-card h-100 d-flex flex-column ${plan.isPopular ? "popular" : ""}`}>
                {plan.isPopular && <div className="hs-popular-badge">Most Popular</div>}
                
                <h3 className="h4 fw-bold mb-2">{plan.name}</h3>
                <p className="text-muted small mb-0">{plan.description}</p>
                
                <div className="hs-price">
                  <span className="hs-price-currency">₹</span>
                  {plan.price[billingCycle].toLocaleString("en-IN")}
                  {plan.price[billingCycle] > 0 && (
                    <span className="hs-price-period">/{billingCycle.replace('ly', '')}</span>
                  )}
                </div>

                <button 
                  className={`btn w-100 py-3 rounded-pill fw-bold ${plan.isPopular ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={handleCTA}
                >
                  {plan.price[billingCycle] === 0 ? "Get Started for Free" : "Upgrade to " + plan.name}
                </button>

                <ul className="hs-feature-list flex-grow-1">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="hs-feature-item">
                      <span className="hs-feature-icon">
                        <i className="bi bi-check" style={{ fontSize: "1.2rem" }}></i>
                      </span>
                      {feat}
                    </li>
                  ))}
                  {plan.notIncluded.map((feat, i) => (
                    <li key={`not-${i}`} className="hs-feature-item text-muted">
                      <span className="hs-feature-icon disabled">
                        <i className="bi bi-x" style={{ fontSize: "1.2rem" }}></i>
                      </span>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-5 pt-5">
        <Footer />
      </div>
    </div>
  );
}
