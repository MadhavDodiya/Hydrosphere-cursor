import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Badge } from '../components/ui';
import Footer from '../components/Footer';
import { Helmet } from 'react-helmet-async';

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'yearly'

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const plans = [
    {
      name: 'Starter',
      price: billingCycle === 'monthly' ? 'Free' : 'Free',
      description: 'Perfect for new buyers exploring the market.',
      features: [
        'Up to 2 active listings',
        'Basic RFQ viewing',
        'Standard Email support',
        'Public purity badges'
      ],
      cta: 'Get Started',
      variant: 'secondary'
    },
    {
      name: 'Professional',
      price: billingCycle === 'monthly' ? '₹9,999' : '₹7,999',
      period: '/mo',
      badge: 'Most Popular',
      description: 'For active traders and scaling suppliers.',
      features: [
        'Unlimited active listings',
        'Priority RFQ access',
        'MOQ & Logistics management',
        'Verified Seller badge',
        'Analytics dashboard',
        'Phone support'
      ],
      cta: 'Start 7-Day Trial',
      variant: 'primary'
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For global energy firms and governments.',
      features: [
        'PESO compliance audit support',
        'Custom API & ERP integration',
        'Dedicated account manager',
        'Multi-currency trade support',
        'SLA guaranteed uptime',
        'White-label certificates'
      ],
      cta: 'Contact Sales',
      variant: 'secondary'
    }
  ];

  return (
    <div className="bg-[#F5F5F7] min-h-screen selection:bg-[#0071E3]/10">
      <Helmet>
        <title>Pricing Plans | HydroSphere — Scaling Hydrogen Trade</title>
      </Helmet>

      {/* Header */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center animate-apple">
          <Badge variant="primary">Simple Pricing</Badge>
          <h1 className="text-5xl md:text-7xl font-black text-[#1d1d1f] mt-8 mb-8 tracking-tight">
            Plans for every <br /> <span className="text-[#0071E3]">Scale.</span>
          </h1>
          <p className="text-lg md:text-xl text-[#86868b] font-medium mb-12">
            No hidden fees. 18% GST applicable on all paid plans.
          </p>

          {/* Billing Switch */}
          <div className="inline-flex p-1 bg-black/[0.03] rounded-full border border-black/[0.02]">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${billingCycle === 'monthly' ? 'bg-white text-[#1d1d1f] shadow-md' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all ${billingCycle === 'yearly' ? 'bg-white text-[#1d1d1f] shadow-md' : 'text-[#86868b] hover:text-[#1d1d1f]'}`}
            >
              Yearly <span className="text-[#0071E3] ml-1">-20%</span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Grid */}
      <section className="pb-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 items-stretch">
          {plans.map((plan, i) => (
            <Card key={i} className={`p-12 flex flex-col ${plan.badge ? 'ring-4 ring-[#0071E3]/5 relative z-10' : ''}`} hover={true}>
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                   <Badge variant="primary" className="!bg-[#0071E3] !text-white !border-none px-4 py-1.5 shadow-lg shadow-blue-500/20">{plan.badge}</Badge>
                </div>
              )}
              <div className="mb-10">
                <h3 className="text-2xl font-black text-[#1d1d1f] mb-2">{plan.name}</h3>
                <p className="text-sm font-medium text-[#86868b] leading-relaxed">{plan.description}</p>
              </div>
              <div className="mb-10 flex items-baseline gap-1">
                <span className="text-5xl font-black text-[#1d1d1f] tracking-tighter">{plan.price}</span>
                {plan.period && <span className="text-[#86868b] font-bold text-lg">{plan.period}</span>}
              </div>
              <div className="flex-grow space-y-5 mb-12">
                {plan.features.map(feature => (
                  <div key={feature} className="flex items-center gap-4 group">
                    <div className="w-5 h-5 rounded-full bg-[#0071E3]/10 flex items-center justify-center text-[#0071E3] text-[10px] group-hover:bg-[#0071E3] group-hover:text-white transition-colors">
                      <i className="bi bi-check-lg" />
                    </div>
                    <span className="text-sm font-bold text-[#1d1d1f] opacity-80">{feature}</span>
                  </div>
                ))}
              </div>
              <Link to={plan.cta === 'Contact Sales' ? '/contact' : '/signup'} className="w-full">
                <Button variant={plan.variant} className="w-full" size="lg">{plan.cta}</Button>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* Comparison Table / FAQ Section */}
      <section className="py-32 px-6 bg-white border-y border-black/5">
        <div className="max-w-4xl mx-auto">
           <h2 className="text-3xl font-black text-[#1d1d1f] text-center mb-16 tracking-tight">Frequently Asked Questions</h2>
           <div className="space-y-12">
              {[
                { q: 'Is there a long-term commitment?', a: 'No, you can cancel your subscription at any time from your billing dashboard. Pro-rated refunds are available within the first 48 hours.' },
                { q: 'What is the 18% GST?', a: 'As per Indian tax regulations, an 18% Goods and Services Tax is mandatory for all B2B SaaS services provided in India.' },
                { q: 'Can I upgrade my plan later?', a: 'Absolutely. You can switch between plans instantly. The price difference will be automatically pro-rated.' }
              ].map((item, i) => (
                <div key={i} className="group cursor-pointer">
                   <h3 className="text-xl font-bold text-[#1d1d1f] mb-4 group-hover:text-[#0071E3] transition-colors flex items-center gap-3">
                     <div className="w-1.5 h-6 bg-[#0071E3] rounded-full opacity-0 group-hover:opacity-100 transition-all -ml-6" />
                     {item.q}
                   </h3>
                   <p className="text-[#86868b] font-medium leading-relaxed pl-3">{item.a}</p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Trust Signal */}
      <section className="py-24 text-center px-6">
        <p className="text-sm font-bold text-[#86868b] mb-10 uppercase tracking-widest">Industry Leading Security & Compliance</p>
        <div className="flex flex-wrap justify-center gap-12 grayscale opacity-40">
           <span className="font-black text-xl italic">ISO 27001</span>
           <span className="font-black text-xl italic">PESO AUDITED</span>
           <span className="font-black text-xl italic">GDPR READY</span>
        </div>
      </section>

      <Footer />
    </div>
  );
}
