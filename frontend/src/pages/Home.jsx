import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Badge } from '../components/ui';
import Footer from '../components/Footer';
import { Helmet } from 'react-helmet-async';

export default function Home() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-[#F5F5F7] min-h-screen selection:bg-[#0071E3]/10">
      <Helmet>
        <title>HydroSphere | The Global Hydrogen Marketplace</title>
        <meta name="description" content="Connect with verified hydrogen suppliers globally. The world's most advanced B2B marketplace for green, blue, and grey hydrogen." />
      </Helmet>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10 animate-apple">
          <Badge variant="primary">The Future of Energy Sourcing</Badge>
          <h1 className="text-6xl md:text-8xl font-black text-[#1d1d1f] mt-8 mb-10 tracking-tight leading-[1.05]">
            Powering the <br /> <span className="text-[#0071E3]">Hydrogen Economy.</span>
          </h1>
          <p className="text-xl md:text-2xl text-[#86868b] font-medium max-w-3xl mx-auto leading-relaxed mb-12">
            The world's most advanced B2B marketplace for industrial hydrogen. 
            Source verified green, blue, and grey hydrogen from global producers.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <Link to="/free-trial">
              <Button size="lg" className="px-12 py-5 text-lg">Start Free Trial</Button>
            </Link>
            <Link to="/marketplace">
              <Button variant="secondary" size="lg" className="px-12 py-5 text-lg">Explore Marketplace</Button>
            </Link>
          </div>
        </div>

        {/* Abstract Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none -z-10">
          <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-[#0071E3]/5 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 -right-20 w-[500px] h-[500px] bg-[#00D1B2]/5 rounded-full blur-[100px]" />
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-12 border-y border-black/5 bg-white/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-[11px] font-black text-[#86868b] uppercase tracking-[0.3em] mb-8">
            Trusted by Industrial Leaders
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale">
            {['Siemens', 'Linde', 'AirLiquide', 'Shell', 'Adani', 'Reliance'].map(brand => (
              <span key={brand} className="text-2xl font-black tracking-tighter text-[#1d1d1f]">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-black text-[#1d1d1f] tracking-tight mb-6">
              Built for Global Scale.
            </h2>
            <p className="text-[#86868b] font-medium text-lg max-w-2xl mx-auto">
              We've digitized the hydrogen supply chain to provide transparency, 
              safety, and efficiency for global energy firms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                icon: 'bi-shield-check',
                title: 'PESO Verified',
                desc: 'Every supplier undergoes a rigorous 14-point safety and compliance audit before listing.',
                color: 'text-blue-500 bg-blue-50'
              },
              {
                icon: 'bi-graph-up-arrow',
                title: 'Real-time Analytics',
                desc: 'Track price trends, MOQ fluctuations, and supply chain bottlenecks in real-time.',
                color: 'text-green-500 bg-green-50'
              },
              {
                icon: 'bi-lightning-charge',
                title: 'Instant RFQ',
                desc: 'Send requests to hundreds of verified producers and receive quotes within hours.',
                color: 'text-orange-500 bg-orange-50'
              }
            ].map((feature, i) => (
              <Card key={i} className="p-10 group">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-8 transition-transform group-hover:scale-110 ${feature.color}`}>
                  <i className={`bi ${feature.icon}`} />
                </div>
                <h3 className="text-xl font-bold text-[#1d1d1f] mb-4">{feature.title}</h3>
                <p className="text-[#86868b] font-medium leading-relaxed">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section className="py-32 px-6 bg-[#1d1d1f] text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
          <div>
            <Badge variant="primary" className="!bg-[#0071E3] !text-white !border-none">Enterprise Ready</Badge>
            <h2 className="text-5xl md:text-6xl font-black tracking-tight mt-8 mb-8 leading-[1.1]">
              The Operating System for <br /> <span className="text-[#0071E3]">Hydrogen Trade.</span>
            </h2>
            <p className="text-white/60 font-medium text-lg mb-12 leading-relaxed">
              HydroSphere provides the infrastructure for seamless cross-border trade, 
              multi-currency support, and purity certification management.
            </p>
            <ul className="space-y-6">
              {[
                'Blockchain-backed Purity Certificates',
                'MOQ & Logistics Management',
                'Custom API for ERP Integration',
                'Dedicated Account Management'
              ].map(item => (
                <li key={item} className="flex items-center gap-4">
                  <div className="w-6 h-6 bg-[#0071E3] rounded-full flex items-center justify-center text-[10px]">
                    <i className="bi bi-check-lg" />
                  </div>
                  <span className="font-bold text-white/90">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
             <div className="aspect-square bg-gradient-to-tr from-[#0071E3] to-[#00D1B2] rounded-[64px] shadow-2xl rotate-3 flex items-center justify-center p-1 overflow-hidden group">
               <div className="w-full h-full bg-[#1d1d1f] rounded-[60px] p-8 flex flex-col justify-center">
                  <div className="space-y-6">
                    <div className="h-4 bg-white/10 rounded-full w-3/4 animate-pulse" />
                    <div className="h-4 bg-white/10 rounded-full w-1/2 animate-pulse" />
                    <div className="h-24 bg-[#0071E3]/20 rounded-3xl w-full border border-[#0071E3]/30" />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-16 bg-white/5 rounded-2xl" />
                      <div className="h-16 bg-white/5 rounded-2xl" />
                    </div>
                  </div>
               </div>
             </div>
             {/* Decorative Elements */}
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#0071E3]/20 rounded-full blur-[60px]" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 px-6">
        <div className="max-w-5xl mx-auto bg-white rounded-[64px] p-16 md:p-24 text-center shadow-2xl shadow-black/[0.05] relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#0071E3]/5 to-transparent pointer-events-none" />
           <h2 className="text-5xl md:text-6xl font-black text-[#1d1d1f] tracking-tight mb-10 relative z-10">
             Ready to source?
           </h2>
           <p className="text-xl text-[#86868b] font-medium mb-12 max-w-xl mx-auto relative z-10">
             Join 500+ industrial companies already trading on HydroSphere.
           </p>
           <div className="flex flex-col md:flex-row items-center justify-center gap-6 relative z-10">
             <Link to="/signup">
               <Button size="lg" className="px-16 py-6 text-lg">Create Account</Button>
             </Link>
             <Link to="/contact">
               <Button variant="secondary" size="lg" className="px-16 py-6 text-lg">Talk to Sales</Button>
             </Link>
           </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
