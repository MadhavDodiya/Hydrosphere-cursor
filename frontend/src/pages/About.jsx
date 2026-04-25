import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, Badge } from '../components/ui';
import Footer from '../components/Footer';
import { Helmet } from 'react-helmet-async';

export default function About() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-[#F5F5F7] min-h-screen selection:bg-[#0071E3]/10">
      <Helmet>
        <title>About Us | HydroSphere — Digitizing the Hydrogen Economy</title>
      </Helmet>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center animate-apple">
          <Badge variant="primary">Our Mission</Badge>
          <h1 className="text-5xl md:text-7xl font-black text-[#1d1d1f] mt-8 mb-10 tracking-tight">
            Accelerating the world's <br /> <span className="text-[#0071E3]">Energy Transition.</span>
          </h1>
          <p className="text-xl md:text-2xl text-[#86868b] font-medium leading-relaxed">
            HydroSphere was founded to solve the most critical bottleneck in the hydrogen 
            economy: <strong>Transparency in Sourcing.</strong>
          </p>
        </div>
      </section>

      {/* Narrative Section */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-4xl font-black text-[#1d1d1f] mb-8 tracking-tight">The Story Behind the Sphere.</h2>
            <div className="space-y-6 text-[#86868b] font-medium text-lg leading-relaxed">
              <p>
                In 2024, our founders realized that while hydrogen production was scaling, 
                the infrastructure to trade it remained stuck in the 1990s—reliant on 
                scattered emails, unverified brokers, and zero price transparency.
              </p>
              <p>
                We built HydroSphere to bridge this gap. A single, verified, and secure 
                platform where global manufacturing giants can find and source hydrogen 
                from the world's most sustainable producers.
              </p>
              <p>
                Today, we power trade for companies across 14 countries, ensuring 
                that the energy powering our future is safe, clean, and accessible.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-[#f5f5f7] rounded-[42px] h-[300px] flex flex-col justify-end p-8 overflow-hidden relative group">
               <div className="relative z-10">
                 <div className="text-4xl font-black text-[#1d1d1f] mb-2">14</div>
                 <div className="text-sm font-bold text-[#86868b] uppercase tracking-widest">Countries</div>
               </div>
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#0071E3]/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700" />
            </div>
            <div className="bg-[#1d1d1f] rounded-[42px] h-[300px] flex flex-col justify-end p-8 mt-12">
               <div className="text-4xl font-black text-white mb-2">500+</div>
               <div className="text-sm font-bold text-white/40 uppercase tracking-widest">Verified Suppliers</div>
            </div>
            <div className="bg-[#0071E3] rounded-[42px] h-[300px] flex flex-col justify-end p-8 -mt-12">
               <div className="text-4xl font-black text-white mb-2">2.4M</div>
               <div className="text-sm font-bold text-white/40 uppercase tracking-widest">MT Hydrogen Traded</div>
            </div>
            <div className="bg-[#00D1B2] rounded-[42px] h-[300px] flex flex-col justify-end p-8">
               <div className="text-4xl font-black text-white mb-2">99.9%</div>
               <div className="text-sm font-bold text-white/40 uppercase tracking-widest">Purity Verified</div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-black text-[#1d1d1f] text-center mb-24 tracking-tight">Our Core Principles.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: 'Radical Transparency', desc: 'No hidden fees. No unverified claims. Every certificate is logged and auditable.' },
              { title: 'Uncompromising Safety', desc: 'Working with industrial hydrogen requires strict adherence to safety protocols.' },
              { title: 'Global Inclusion', desc: 'Connecting small-scale sustainable producers with global industrial manufacturing.' }
            ].map((value, i) => (
              <div key={i} className="space-y-6">
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#0071E3] font-black text-xl shadow-sm">
                  {i + 1}
                </div>
                <h3 className="text-2xl font-black text-[#1d1d1f] tracking-tight">{value.title}</h3>
                <p className="text-[#86868b] font-medium leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team CTA */}
      <section className="py-32 px-6">
        <Card className="max-w-5xl mx-auto p-20 bg-[#1d1d1f] text-white overflow-hidden relative border-none">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#0071E3]/20 rounded-full blur-[100px]" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
            <div className="flex-grow">
               <h2 className="text-4xl font-black mb-6 tracking-tight leading-tight">Want to join the mission?</h2>
               <p className="text-white/60 font-medium text-lg">We're always looking for passionate people in energy, technology, and trade.</p>
            </div>
            <Button size="lg" className="px-12 py-5 whitespace-nowrap bg-white text-[#1d1d1f] hover:bg-white/90">View Open Positions</Button>
          </div>
        </Card>
      </section>

      <Footer />
    </div>
  );
}
