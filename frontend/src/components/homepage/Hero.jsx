import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();
  const productOptions = useMemo(() => ["All Types", "Green", "Blue", "Grey"], []);
  const [location, setLocation] = useState("");
  const [product, setProduct] = useState(productOptions[0]);

  return (
    <section className="relative pt-16 pb-24 overflow-hidden bg-white">
      {/* Background soft glow */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] bg-[#0071E3]/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Content */}
          <div className="flex-1 animate-apple">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F5F5F7] rounded-full text-[11px] font-bold tracking-wider text-[#86868b] uppercase mb-6">
              <i className="bi bi-stars text-[#0071E3]" />
              The Future of Energy
            </div>

            <h1 className="text-5xl md:text-6xl font-extrabold text-[#1d1d1f] leading-[1.1] mb-6 tracking-tight">
              Find Verified <br />
              <span className="text-[#0071E3]">Hydrogen Suppliers</span>
            </h1>

            <p className="text-xl text-[#86868b] font-normal leading-relaxed max-w-xl mb-10">
              Connect with trusted hydrogen providers for your business. 
              Search, compare, and contact suppliers in minutes.
            </p>

            {/* Apple-style Search Bar */}
            <div className="bg-[#F5F5F7] p-2 rounded-[28px] shadow-sm border border-black/[0.03] max-w-2xl">
              <form
                className="flex flex-col md:flex-row items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const params = new URLSearchParams();
                  if (location.trim()) params.set("location", location.trim());
                  if (product && product !== "All Types") params.set("type", product);
                  navigate(`/marketplace?${params.toString()}`);
                }}
              >
                <div className="flex-1 flex items-center gap-3 px-4 w-full">
                  <i className="bi bi-geo-alt text-[#86868b]" />
                  <input
                    className="w-full bg-transparent py-3 text-sm focus:outline-none placeholder:text-[#86868b]"
                    placeholder="Location (e.g. India)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>

                <div className="h-8 w-[1px] bg-black/5 hidden md:block" />

                <div className="flex-1 flex items-center gap-3 px-4 w-full">
                  <i className="bi bi-funnel text-[#86868b]" />
                  <select
                    className="w-full bg-transparent py-3 text-sm focus:outline-none appearance-none cursor-pointer"
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                  >
                    {productOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="btn-primary w-full md:w-auto shadow-lg shadow-blue-500/20">
                  Search
                </button>
              </form>
            </div>
          </div>

          {/* Media */}
          <div className="flex-1 relative animate-apple" style={{ animationDelay: '0.2s' }}>
            <div className="relative rounded-[32px] overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1518152006812-edab29b069ac?q=80&w=2070&auto=format&fit=crop" 
                alt="Industrial hydrogen plant" 
                className="w-full h-auto object-cover aspect-[4/3]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            
            {/* Status Badge */}
            <div className="absolute -bottom-6 -left-6 bg-white/80 backdrop-blur-xl p-4 rounded-3xl shadow-xl border border-white/20 flex items-center gap-3">
               <div className="w-3 h-3 bg-[#00D1B2] rounded-full animate-pulse" />
               <div className="text-sm font-bold text-[#1d1d1f]">99.9% Purity Verified</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-24 pt-10 border-t border-black/5 flex flex-wrap justify-between gap-10">
          {[
            { label: "Verified Suppliers", val: "500+", icon: "bi-patch-check-fill" },
            { label: "Hydrogen Types", val: "3 Variants", icon: "bi-droplet-fill" },
            { label: "Global Reach", val: "24/7 Access", icon: "bi-globe" }
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-[#F5F5F7] flex items-center justify-center text-[#0071E3] text-xl">
                 <i className={`bi ${stat.icon}`} />
               </div>
               <div>
                 <div className="text-xl font-bold text-[#1d1d1f]">{stat.val}</div>
                 <div className="text-xs font-medium text-[#86868b] uppercase tracking-wider">{stat.label}</div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
