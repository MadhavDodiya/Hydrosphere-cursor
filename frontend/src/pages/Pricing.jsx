import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { loadStripe } from "@stripe/stripe-js";
import api from "../api/axiosInstance.js";
import Footer from "../components/Footer.jsx";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function Pricing() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [billingCycle, setBillingCycle] = useState("monthly"); // "monthly" or "yearly"
  const [loading, setLoading] = useState(null);

  const plans = [
    {
      id: "Starter",
      name: "Starter",
      description: "For new buyers and independent agents to explore the market.",
      price: { monthly: 0, yearly: 0 },
      features: [
        { text: "2 Active Listings", included: true },
        { text: "Basic RFQ Viewing", included: true },
        { text: "Safety/PESO Document Upload", included: true },
        { text: "3% Transaction Fee", included: true },
        { text: "Purity Certification Badges", included: false },
        { text: "Hydrosphere Verified Badge", included: false },
        { text: "Custom API Access", included: false },
      ],
      cta: "Start for Free",
      color: "slate",
    },
    {
      id: "Professional",
      name: "Professional",
      description: "For active traders and industrial suppliers looking to scale.",
      price: { monthly: 4999, yearly: 3999 },
      features: [
        { text: "Unlimited Listings", included: true },
        { text: "Advanced RFQ Management", included: true },
        { text: "Safety/PESO Document Verification", included: true },
        { text: "1.5% Transaction Fee", included: true },
        { text: "Purity Certification Badges", included: true },
        { text: "Hydrosphere Verified Badge", included: true },
        { text: "Dedicated Support", included: true },
        { text: "Custom API Access", included: false },
      ],
      cta: "Go Professional",
      color: "blue",
      popular: true,
    },
    {
      id: "Enterprise",
      name: "Enterprise",
      description: "Custom solutions for global energy firms and large plants.",
      price: { monthly: "Custom", yearly: "Custom" },
      features: [
        { text: "Multi-Region Trading", included: true },
        { text: "PESO Compliance Audit Support", included: true },
        { text: "Custom Transaction Fees", included: true },
        { text: "Custom API & ERP Integration", included: true },
        { text: "Dedicated Account Manager", included: true },
        { text: "White-label Trading Portal", included: true },
      ],
      cta: "Contact Sales",
      color: "slate-dark",
    },
  ];

  const comparisonFeatures = [
    { category: "Marketplace", name: "Active Listings", starter: "2", pro: "Unlimited", enterprise: "Unlimited" },
    { category: "Marketplace", name: "RFQ System", starter: "Basic", pro: "Advanced", enterprise: "Full Control" },
    { category: "Compliance", name: "PESO Verification", starter: "Self-upload", pro: "Verified Badge", enterprise: "Full Audit Support" },
    { category: "Compliance", name: "Purity Badges", starter: "❌", pro: "✅", enterprise: "✅" },
    { category: "Financial", name: "Transaction Fee", starter: "3%", pro: "1.5%", enterprise: "Custom" },
    { category: "Technical", name: "API Access", starter: "❌", pro: "Read-only", enterprise: "Full Access" },
  ];

  const handleSubscribe = async (planId) => {
    if (planId === "Starter") {
       navigate("/free-trial");
       return;
    }
    if (planId === "Enterprise") {
       navigate("/contact");
       return;
    }

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user?.role !== "supplier") {
      alert("Only suppliers can subscribe to trading plans.");
      return;
    }

    try {
      setLoading(planId);
      const response = await api.post("/api/billing/create-checkout-session", { 
        planId,
        interval: billingCycle === "monthly" ? "month" : "year"
      });
      
      const stripe = await stripePromise;
      // Extract from { success, data: { id, url }, message }
      await stripe.redirectToCheckout({ sessionId: response.data.id });
    } catch (err) {
      console.error("Subscription error:", err);
      alert("Failed to initiate checkout. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-[#F5F5F7] min-h-screen font-inter selection:bg-[#0071E3]/10 selection:text-[#0071E3]">
      {/* 1. Refined Hero Section */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Apple-style background blur blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] pointer-events-none overflow-hidden">
           <div className="absolute -top-24 -left-24 w-[500px] h-[500px] bg-[#0071E3]/5 rounded-full blur-[120px]"></div>
           <div className="absolute top-0 -right-24 w-[400px] h-[400px] bg-[#00D1B2]/5 rounded-full blur-[100px]"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="inline-block px-4 py-1.5 mb-8 text-[11px] font-black tracking-[0.2em] text-[#0071E3] uppercase bg-[#0071E3]/5 rounded-full border border-[#0071E3]/10">
            HydroSphere Enterprise
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-[#1d1d1f] mb-8 tracking-tight leading-[1.05]">
            Trading hydrogen <br className="hidden md:block" />
            at the speed of <span className="text-[#0071E3]">trust.</span>
          </h1>
          <p className="text-xl text-[#86868b] font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
            Scalable infrastructure for global energy firms, industrial producers, 
            and independent traders. No hidden fees. Just pure scale.
          </p>

          {/* Monthly/Yearly Toggle (Apple Style) */}
          <div className="inline-flex items-center p-1.5 bg-black/[0.03] rounded-full border border-black/[0.02]">
             <button 
                onClick={() => setBillingCycle('monthly')}
                className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all ${billingCycle === 'monthly' ? 'bg-white text-[#1d1d1f] shadow-md' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}
             >
                Monthly
             </button>
             <button 
                onClick={() => setBillingCycle('yearly')}
                className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-white text-[#1d1d1f] shadow-md' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}
             >
                Yearly
                <span className="text-[10px] bg-[#00D1B2] text-white px-2 py-0.5 rounded-full">Save 20%</span>
             </button>
          </div>
        </div>
      </section>

      {/* 2. Pricing Cards Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={`relative bg-white rounded-[42px] p-10 flex flex-col transition-all duration-500 shadow-2xl shadow-black/[0.03] border border-black/[0.02] hover:shadow-black/[0.06] hover:-translate-y-2 ${
                plan.popular ? 'ring-4 ring-[#0071E3]/5' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#0071E3] text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-xl shadow-blue-500/20">
                  Most Preferred
                </div>
              )}

              <div className="mb-10">
                <h3 className="text-2xl font-black text-[#1d1d1f] mb-3">{plan.name}</h3>
                <p className="text-sm text-[#86868b] font-medium leading-relaxed min-h-[48px]">{plan.description}</p>
              </div>

              <div className="mb-10">
                {typeof plan.price[billingCycle] === 'number' ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-[#1d1d1f] tracking-tighter">₹{plan.price[billingCycle].toLocaleString()}</span>
                    <span className="text-[#86868b] font-bold">/mo</span>
                  </div>
                ) : (
                  <div className="text-5xl font-black text-[#1d1d1f] tracking-tighter">{plan.price[billingCycle]}</div>
                )}
                <p className="text-[11px] font-bold text-[#86868b] uppercase tracking-wider mt-4">
                  {typeof plan.price[billingCycle] === 'number' ? "+18% GST included at checkout" : "Customized for global firms"}
                </p>
              </div>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading === plan.id}
                className={`w-full py-4 rounded-[20px] font-black text-sm transition-all mb-10 ${
                  plan.popular 
                  ? 'bg-[#0071E3] text-white hover:bg-[#0077ED] shadow-xl shadow-blue-500/20' 
                  : 'bg-[#F5F5F7] text-[#1d1d1f] hover:bg-[#e8e8ed]'
                } flex justify-center items-center gap-2 active:scale-95`}
              >
                {loading === plan.id ? (
                  <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {plan.cta}
                    <i className="bi bi-arrow-right text-[10px]" />
                  </>
                )}
              </button>

              <div className="space-y-5 flex-grow">
                <p className="text-[10px] font-black text-[#1d1d1f] uppercase tracking-[0.2em] opacity-40 mb-6">Capabilities</p>
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center ${feature.included ? 'text-[#00D1B2]' : 'text-black/10'}`}>
                      <i className={`bi ${feature.included ? 'bi-check-circle-fill' : 'bi-x-circle'} text-lg`} />
                    </div>
                    <span className={`text-sm font-medium ${feature.included ? 'text-[#1d1d1f]' : 'text-[#86868b] opacity-50'}`}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Refined Feature Matrix */}
      <section className="max-w-5xl mx-auto px-6 pb-40">
         <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-[#1d1d1f] mb-4 tracking-tight">Full Platform Matrix</h2>
            <p className="text-lg text-[#86868b] font-medium">Deep dive into the compliance and trading features.</p>
         </div>

         <div className="bg-white rounded-[48px] overflow-hidden shadow-2xl shadow-black/[0.03] border border-black/[0.02]">
            <table className="w-full text-left border-collapse">
               <thead>
                  <tr className="bg-black/[0.01]">
                     <th className="p-8 text-[11px] font-black text-[#86868b] uppercase tracking-widest border-b border-black/5">Platform Feature</th>
                     <th className="p-8 text-sm font-black text-[#1d1d1f] border-b border-black/5">Starter</th>
                     <th className="p-8 text-sm font-black text-[#0071E3] border-b border-black/5">Professional</th>
                     <th className="p-8 text-sm font-black text-[#1d1d1f] border-b border-black/5">Enterprise</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-black/[0.02]">
                  {comparisonFeatures.map((row, i) => (
                     <tr key={i} className="group transition-colors hover:bg-black/[0.01]">
                        <td className="p-8">
                           <span className="text-[9px] font-black text-[#0071E3] uppercase tracking-widest block mb-1 opacity-50">{row.category}</span>
                           <span className="text-sm font-bold text-[#1d1d1f]">{row.name}</span>
                        </td>
                        <td className="p-8 text-sm text-[#86868b] font-medium">{row.starter}</td>
                        <td className="p-8 text-sm font-black text-[#1d1d1f] bg-[#0071E3]/[0.02]">{row.pro}</td>
                        <td className="p-8 text-sm text-[#86868b] font-medium">{row.enterprise}</td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>

         {/* 4. Trust Pillars (Apple Style Icons) */}
         <div className="mt-32 grid grid-cols-1 md:grid-cols-4 gap-12">
            {[
               { icon: "bi-shield-check", title: "PESO Verified", desc: "India's highest safety standard integration." },
               { icon: "bi-graph-up-arrow", title: "Real-time RFQ", desc: "Direct negotiation with Tier-1 energy buyers." },
               { icon: "bi-patch-check", title: "Purity Ledger", desc: "Transparent gas purity certification storage." },
               { icon: "bi-headset", title: "Scale Support", desc: "Expert traders at your service 24/7." }
            ].map((item, i) => (
               <div key={i} className="text-center group">
                  <div className="w-16 h-16 bg-white shadow-xl shadow-black/[0.02] rounded-[24px] flex items-center justify-center mx-auto mb-6 text-[#0071E3] transition-transform group-hover:scale-110">
                     <i className={`bi ${item.icon} text-2xl`}></i>
                  </div>
                  <h4 className="text-base font-black text-[#1d1d1f] mb-3">{item.title}</h4>
                  <p className="text-sm text-[#86868b] font-medium leading-relaxed">{item.desc}</p>
               </div>
            ))}
         </div>
      </section>

      <Footer />
    </div>
  );
}
