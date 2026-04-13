import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer.jsx";

/* ─── Intersection‑observer hook for reveal animations ─────── */
function useReveal(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, visible];
}

/* ─── Animated counter ──────────────────────────────────────── */
function Counter({ end, suffix = "", duration = 1800 }) {
  const [count, setCount] = useState(0);
  const [ref, visible] = useReveal();
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const steps = 60;
    const step = end / steps;
    const interval = duration / steps;
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); } else { setCount(Math.floor(start)); }
    }, interval);
    return () => clearInterval(timer);
  }, [visible, end, duration]);
  return <span ref={ref}>{count}{suffix}</span>;
}

/* ─── Section wrapper with reveal ──────────────────────────── */
function Section({ children, className = "" }) {
  const [ref, visible] = useReveal();
  return (
    <section
      ref={ref}
      className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
    >
      {children}
    </section>
  );
}

/* ─── Chip label ────────────────────────────────────────────── */
function Chip({ children, color = "blue" }) {
  const colors = {
    blue:  "bg-blue-50  text-blue-600  ring-blue-200",
    green: "bg-green-50 text-green-600 ring-green-200",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ring-1 ${colors[color]} mb-4`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
      {children}
    </span>
  );
}

/* ─── 1. Hero ───────────────────────────────────────────────── */
function HeroSection() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 min-h-[92vh] flex items-center">
      {/* Decorative blobs */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-32 w-[500px] h-[500px] rounded-full bg-green-500/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-blue-600/5 blur-3xl pointer-events-none" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 text-center w-full">
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            B2B Hydrogen Marketplace · Est. 2024
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight tracking-tight mb-6">
          Powering the Future<br />
          <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
            with Hydrogen
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          Hydrosphere is a smart hydrogen marketplace connecting buyers and verified suppliers through AI-driven solutions — making clean energy sourcing fast, transparent, and scalable.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/marketplace"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold text-base hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-1">
            Explore Marketplace →
          </Link>
          <Link to="/signup"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white font-semibold text-base hover:bg-white/20 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm">
            Become a Supplier
          </Link>
        </div>

        {/* Floating stat pills */}
        <div className="flex flex-wrap justify-center gap-4 mt-16">
          {[
            { v: "100+", l: "Verified Suppliers" },
            { v: "500+", l: "Leads Generated" },
            { v: "3",    l: "H₂ Types Listed" },
            { v: "24/7", l: "Platform Uptime" },
          ].map(s => (
            <div key={s.l} className="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-center">
              <div className="text-xl font-black text-white">{s.v}</div>
              <div className="text-xs text-slate-400 mt-0.5">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── 2. Stats ──────────────────────────────────────────────── */
function StatsSection() {
  const stats = [
    { end: 100, suffix: "+", label: "Verified Suppliers",  icon: "🏭" },
    { end: 500, suffix: "+", label: "Leads Generated",     icon: "📈" },
    { end: 12,  suffix: "",  label: "Countries Covered",   icon: "🌍" },
    { end: 99,  suffix: "%", label: "Platform Uptime",     icon: "⚡" },
  ];
  return (
    <Section className="py-16 bg-gradient-to-r from-blue-600 to-cyan-600">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          {stats.map(s => (
            <div key={s.label} className="group">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">{s.icon}</div>
              <div className="text-4xl font-black mb-1">
                <Counter end={s.end} suffix={s.suffix} />
              </div>
              <div className="text-blue-100 text-sm font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ─── 3. Who We Are ─────────────────────────────────────────── */
function WhoWeAre() {
  return (
    <Section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <Chip color="blue">Who We Are</Chip>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-6">
              The Smart Bridge Between Hydrogen Buyers & Suppliers
            </h2>
            <p className="text-slate-600 text-lg leading-relaxed mb-6">
              Hydrosphere is a B2B SaaS marketplace purpose-built for the hydrogen economy. We connect industrial buyers with verified green, blue, and grey hydrogen suppliers — eliminating fragmented directories, cold calls, and endless email chains.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Our platform brings clarity, speed, and intelligence to hydrogen procurement. Whether you're sourcing 500 kg or 50,000 kg, Hydrosphere gives you real-time visibility into suppliers, pricing, and availability.
            </p>
          </div>
          {/* Visual card */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/10 to-green-500/10 rounded-3xl blur-2xl" />
            <div className="relative grid grid-cols-2 gap-4">
              {[
                { icon: "🔬", title: "Green H₂", desc: "Electrolysis-based, zero emission" },
                { icon: "💙", title: "Blue H₂",  desc: "Gas reforming + CCS capture" },
                { icon: "⚙️", title: "Grey H₂",  desc: "Industrial-scale steam methane" },
                { icon: "🤝", title: "Verified",  desc: "All suppliers are vetted" },
              ].map(c => (
                <div key={c.title} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-300 hover:-translate-y-1">
                  <div className="text-2xl mb-2">{c.icon}</div>
                  <div className="font-bold text-slate-900 text-sm mb-1">{c.title}</div>
                  <div className="text-slate-500 text-xs">{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ─── 4. Mission & Vision ───────────────────────────────────── */
function MissionVision() {
  return (
    <Section className="py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <Chip color="green">Our Purpose</Chip>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900">Mission & Vision</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              icon: "🎯",
              label: "Our Mission",
              gradient: "from-blue-500 to-cyan-500",
              bg: "from-blue-50 to-cyan-50",
              border: "border-blue-100",
              title: "Accelerate Clean Energy Adoption",
              body: "We're on a mission to make hydrogen procurement effortless. By connecting buyers directly with verified suppliers, we reduce sourcing time from weeks to minutes — accelerating the global transition to clean energy.",
            },
            {
              icon: "🌍",
              label: "Our Vision",
              gradient: "from-green-500 to-emerald-500",
              bg: "from-green-50 to-emerald-50",
              border: "border-green-100",
              title: "The World's Leading H₂ Ecosystem",
              body: "We envision a world where every hydrogen molecule is traceable, every supplier is accountable, and every buyer has access to the cleanest, most cost-effective hydrogen — regardless of geography or company size.",
            },
          ].map(card => (
            <div key={card.label} className={`p-8 rounded-3xl bg-gradient-to-br ${card.bg} border ${card.border} hover:shadow-xl transition-all duration-300 hover:-translate-y-2`}>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r ${card.gradient} text-white text-xs font-bold mb-4`}>
                {card.icon} {card.label}
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-4">{card.title}</h3>
              <p className="text-slate-600 leading-relaxed">{card.body}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ─── 5. What We Offer ──────────────────────────────────────── */
function WhatWeOffer() {
  const features = [
    { icon: "🔍", title: "Smart Supplier Discovery", desc: "Search and filter verified hydrogen suppliers by type, location, and price. Real-time availability data at your fingertips.", color: "blue" },
    { icon: "🤖", title: "AI-Powered Chatbot", desc: "Get instant answers, supplier recommendations, and pricing guidance from our intelligent hydrogen procurement assistant.", color: "violet" },
    { icon: "📊", title: "Lead Generation System", desc: "Sellers receive qualified buyer inquiries with full contact details. Buyers get tailored matches — automated, not manual.", color: "cyan" },
    { icon: "✅", title: "Verified Suppliers", desc: "Every supplier on Hydrosphere undergoes a verification process. Trade with confidence using our trust framework.", color: "green" },
    { icon: "💰", title: "Transparent Pricing",  desc: "No hidden fees, no opaque markups. See real market pricing and request quotes directly from suppliers.", color: "amber" },
    { icon: "🌐", title: "Global Reach",         desc: "Access suppliers across 12+ countries. Whether you need local or international sourcing, we have you covered.", color: "rose" },
  ];

  const colorMap = {
    blue:   "bg-blue-50   text-blue-600   group-hover:bg-blue-100",
    violet: "bg-violet-50 text-violet-600 group-hover:bg-violet-100",
    cyan:   "bg-cyan-50   text-cyan-600   group-hover:bg-cyan-100",
    green:  "bg-green-50  text-green-600  group-hover:bg-green-100",
    amber:  "bg-amber-50  text-amber-600  group-hover:bg-amber-100",
    rose:   "bg-rose-50   text-rose-600   group-hover:bg-rose-100",
  };

  return (
    <Section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <Chip color="blue">Platform Features</Chip>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">What We Offer</h2>
          <p className="text-slate-500 max-w-xl mx-auto">Everything you need to source, list, and transact hydrogen — in one intelligent platform.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(f => (
            <div key={f.title} className="group p-6 rounded-2xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4 transition-colors duration-300 ${colorMap[f.color]}`}>
                {f.icon}
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ─── 6. Why Choose Us ──────────────────────────────────────── */
function WhyChooseUs() {
  const usps = [
    { icon: "⚡", title: "Hydrogen-Focused",      desc: "The only marketplace built exclusively for hydrogen. Not a generic commodity platform — purpose-built for H₂." },
    { icon: "🤝", title: "Direct Connections",    desc: "Skip the middlemen. Buyers and suppliers connect directly, negotiate terms, and close deals faster." },
    { icon: "🧠", title: "AI-Based Matching",     desc: "Our AI analyzes buyer needs and supplier profiles to recommend the best matches — reducing search time by 80%." },
    { icon: "📈", title: "SaaS Scalability",      desc: "From startups to enterprises, our platform scales with your business. Pay for what you use, grow at your pace." },
  ];

  return (
    <Section className="py-24 bg-gradient-to-br from-slate-950 to-blue-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <Chip color="green">Why Hydrosphere</Chip>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Why Choose Us?</h2>
          <p className="text-slate-400 max-w-xl mx-auto">Built for the hydrogen economy. Designed for the modern buyer and supplier.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          {usps.map(u => (
            <div key={u.title} className="group p-7 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm">
              <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">{u.icon}</div>
              <h3 className="font-bold text-white text-lg mb-2">{u.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{u.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ─── 7. Our Story ──────────────────────────────────────────── */
function OurStory() {
  const timeline = [
    { year: "2023", icon: "💡", title: "The Idea",       desc: "A developer in India struggling to find hydrogen suppliers online asked: why is there no Airbnb for hydrogen? The seed of Hydrosphere was planted." },
    { year: "2024", icon: "🛠️", title: "Building the MVP", desc: "Using React, Node.js, and MongoDB, the first version was built in 90 days — a clean listing marketplace with JWT auth, buyer/seller roles, and inquiry system." },
    { year: "2024", icon: "🚀", title: "First Suppliers",  desc: "The platform onboarded its first batch of verified hydrogen suppliers across India and Europe, generating 100+ qualified leads." },
    { year: "2025", icon: "🌍", title: "Going Global",    desc: "Hydrosphere expands with AI-driven supplier matching, multi-tier pricing, and a roadmap for the world's leading clean hydrogen ecosystem." },
  ];

  return (
    <Section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <Chip color="blue">Our Story</Chip>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Built with Purpose</h2>
          <p className="text-slate-500 max-w-2xl mx-auto">Hydrosphere started as a passion project to solve a real-world gap in the hydrogen supply chain. Here's how we got here.</p>
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500 via-cyan-500 to-green-500 md:-translate-x-1/2" />

          <div className="space-y-12">
            {timeline.map((t, i) => (
              <div key={t.year} className={`relative flex flex-col md:flex-row gap-6 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                {/* Dot */}
                <div className="absolute left-6 md:left-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 border-4 border-white shadow-lg md:-translate-x-1/2 -translate-y-0.5 z-10" />

                {/* Year label */}
                <div className={`flex-1 flex ${i % 2 === 0 ? "md:justify-end md:pr-10" : "md:justify-start md:pl-10"} pl-16 md:pl-0`}>
                  <div className="md:hidden flex-1" />
                </div>

                {/* Card */}
                <div className={`flex-1 pl-16 md:pl-0 ${i % 2 === 0 ? "md:pl-10" : "md:pr-10"}`}>
                  <div className="group p-6 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xl group-hover:scale-110 transition-transform duration-300">{t.icon}</span>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{t.year}</span>
                      <h3 className="font-bold text-slate-900">{t.title}</h3>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed">{t.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ─── 8. Tech Stack ─────────────────────────────────────────── */
function TechStack() {
  const techs = [
    { name: "React.js",    icon: "⚛️",  desc: "Frontend UI",          color: "from-blue-400 to-cyan-400" },
    { name: "Node.js",     icon: "🟢",  desc: "REST API backend",      color: "from-green-400 to-emerald-400" },
    { name: "Express",     icon: "⚡",  desc: "API framework",         color: "from-slate-400 to-slate-600" },
    { name: "MongoDB",     icon: "🍃",  desc: "NoSQL database",        color: "from-green-500 to-teal-500" },
    { name: "JWT Auth",    icon: "🔐",  desc: "Secure authentication", color: "from-amber-400 to-orange-400" },
    { name: "AI / NLP",    icon: "🤖",  desc: "Smart matching",        color: "from-violet-400 to-purple-400" },
    { name: "Tailwind CSS",icon: "🎨",  desc: "Utility-first CSS",    color: "from-cyan-400 to-sky-500" },
    { name: "Vite",        icon: "⚡",  desc: "Lightning build tool",  color: "from-yellow-400 to-amber-400" },
  ];

  return (
    <Section className="py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <Chip color="blue">Under the Hood</Chip>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Our Technology Stack</h2>
          <p className="text-slate-500 max-w-xl mx-auto">Built with modern, production-grade technologies designed for scale and performance.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {techs.map(t => (
            <div key={t.name} className="group p-5 rounded-2xl bg-white border border-slate-100 hover:border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-2 text-center">
              <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-content-center text-2xl mb-3 group-hover:scale-110 transition-transform duration-300 flex items-center justify-center`}>
                {t.icon}
              </div>
              <div className="font-bold text-slate-900 text-sm">{t.name}</div>
              <div className="text-slate-400 text-xs mt-0.5">{t.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ─── 9. Team / Founder ─────────────────────────────────────── */
function FounderSection() {
  return (
    <Section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <Chip color="green">The Founder</Chip>
        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-12">Built by a Passionate Developer</h2>
        <div className="relative inline-block">
          <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/20 to-green-500/20 rounded-3xl blur-2xl" />
          <div className="relative p-8 md:p-12 rounded-3xl bg-gradient-to-br from-slate-50 to-blue-50 border border-blue-100 text-left">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-content-center text-2xl font-black text-white flex items-center justify-center shadow-lg">
                MD
              </div>
              <div>
                <div className="font-black text-slate-900 text-lg">Madhav Dodiya</div>
                <div className="text-blue-600 text-sm font-medium">Founder & Full-Stack Developer</div>
                <div className="text-slate-400 text-xs mt-0.5">India · Open to Collaboration</div>
              </div>
            </div>
            <blockquote className="text-slate-600 text-lg leading-relaxed italic border-l-4 border-blue-400 pl-5">
              "I built Hydrosphere because I saw a real gap — hydrogen is the future of energy, but sourcing it was stuck in the past. Cold calls, scattered directories, no price transparency. I decided to fix that."
            </blockquote>
            <p className="text-slate-500 text-sm leading-relaxed mt-5">
              Hydrosphere was brought to life as a capstone SaaS project, combining full-stack engineering (React · Node · MongoDB), product thinking, and a genuine passion for clean energy. It's not just a portfolio project — it's a real marketplace built for a real-world problem.
            </p>
            <div className="flex flex-wrap gap-2 mt-6">
              {["React.js", "Node.js", "MongoDB", "JWT", "Clean Energy", "SaaS"].map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold border border-blue-100">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ─── 10. CTA ───────────────────────────────────────────────── */
function CTASection() {
  return (
    <Section className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 p-12 md:p-16 text-center">
          {/* Decorative circles */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5 blur-2xl" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-green-400/10 blur-2xl" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              Now accepting new suppliers & buyers
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4">
              Join the Hydrogen Revolution
            </h2>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto mb-10">
              Whether you're buying hydrogen for your industrial process or a supplier ready to scale — Hydrosphere is your platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup" className="px-8 py-4 rounded-xl bg-white text-blue-700 font-bold text-base hover:bg-blue-50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                Get Started Free →
              </Link>
              <Link to="/marketplace" className="px-8 py-4 rounded-xl bg-white/10 border border-white/30 text-white font-bold text-base hover:bg-white/20 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm">
                Explore Marketplace
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ─── Main About Page ───────────────────────────────────────── */
export default function About() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.title = "About Hydrosphere — The H₂ Marketplace";
  }, []);

  return (
    <div className="bg-white">
      <HeroSection />
      <StatsSection />
      <WhoWeAre />
      <MissionVision />
      <WhatWeOffer />
      <WhyChooseUs />
      <OurStory />
      <TechStack />
      <FounderSection />
      <CTASection />
      <Footer />
    </div>
  );
}
