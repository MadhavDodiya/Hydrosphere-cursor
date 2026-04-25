import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Badge } from '../components/ui';
import Footer from '../components/Footer';
import { Helmet } from 'react-helmet-async';

export default function FreeTrial() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-[#F5F5F7] min-h-screen selection:bg-[#0071E3]/10">
      <Helmet>
        <title>Start Free Trial | HydroSphere — Global Hydrogen Scale</title>
      </Helmet>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10 animate-apple">
          <Badge variant="primary" className="!bg-[#0071E3] !text-white !border-none">Limited Time Offer</Badge>
          <h1 className="text-6xl md:text-8xl font-black text-[#1d1d1f] mt-8 mb-10 tracking-tight leading-[1.05]">
            Experience the <br /> <span className="text-[#0071E3]">Full Power.</span>
          </h1>
          <p className="text-xl md:text-2xl text-[#86868b] font-medium max-w-2xl mx-auto leading-relaxed mb-12">
            Get 7 days of HydroSphere Professional for free. 
            No credit card required. Cancel anytime.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <Link to="/signup?plan=professional&trial=true">
              <Button size="lg" className="px-16 py-6 text-xl">Claim Your Trial</Button>
            </Link>
            <Link to="/pricing" className="text-sm font-bold text-[#86868b] hover:text-[#0071E3] underline transition-colors">
              Compare all plans
            </Link>
          </div>
        </div>

        {/* Cinematic Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none -z-10">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#0071E3]/10 rounded-full blur-[160px] animate-pulse" />
        </div>
      </section>

      {/* Feature Checklist */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: 'bi-box-seam', title: 'Unlimited Listings', desc: 'Add as many hydrogen products as you produce.' },
              { icon: 'bi-patch-check', title: 'Verified Badge', desc: 'Establish instant trust with a verified supplier badge.' },
              { icon: 'bi-bar-chart-line', title: 'Market Insights', desc: 'Access real-time price trends and demand heatmaps.' },
              { icon: 'bi-headset', title: '24/7 Priority', desc: 'Get dedicated support for your industrial operations.' }
            ].map((item, i) => (
              <Card key={i} className="p-10 border-none bg-white/50 backdrop-blur-md">
                <div className="w-12 h-12 rounded-xl bg-[#0071E3]/5 flex items-center justify-center text-xl text-[#0071E3] mb-6">
                  <i className={`bi ${item.icon}`} />
                </div>
                <h3 className="text-lg font-bold text-[#1d1d1f] mb-3">{item.title}</h3>
                <p className="text-sm font-medium text-[#86868b] leading-relaxed">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Banner */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto bg-[#1d1d1f] rounded-[64px] p-16 md:p-24 relative overflow-hidden text-center">
           <div className="relative z-10">
             <h2 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tight">Everything you need to know.</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left mt-16">
               <div className="space-y-3">
                 <h4 className="text-white font-bold text-lg">What happens after 7 days?</h4>
                 <p className="text-white/60 text-sm font-medium leading-relaxed">Your account will automatically move to the Free Starter plan. You won't be charged unless you choose to upgrade.</p>
               </div>
               <div className="space-y-3">
                 <h4 className="text-white font-bold text-lg">Do I need a credit card?</h4>
                 <p className="text-white/60 text-sm font-medium leading-relaxed">No. We believe in our product, so you can explore all Professional features with zero financial commitment.</p>
               </div>
             </div>
             <div className="mt-20">
               <Link to="/signup">
                 <Button size="lg" className="px-16 py-5 bg-white text-[#1d1d1f] hover:bg-white/90">Join 500+ Leaders</Button>
               </Link>
             </div>
           </div>
           {/* Abstract Glow */}
           <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#0071E3]/20 rounded-full blur-[100px]" />
        </div>
      </section>

      <Footer />
    </div>
  );
}
