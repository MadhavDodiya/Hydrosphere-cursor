const categories = [
  {
    icon: "bi bi-droplet",
    title: "Hydrogen Gas",
    desc: "Compressed hydrogen for industrial and mobility use.",
  },
  {
    icon: "bi bi-snow",
    title: "Liquid Hydrogen",
    desc: "Cryogenic hydrogen for large-scale transport.",
  },
  {
    icon: "bi bi-gear",
    title: "Equipment",
    desc: "Electrolyzers, compressors, and dispensers.",
  },
  {
    icon: "bi bi-box-seam",
    title: "Storage",
    desc: "On-site tanks and container solutions.",
  },
];

export default function CategorySection() {
  return (
    <section className="py-20 bg-[#F5F5F7]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <h2 className="text-3xl font-extrabold text-[#1d1d1f] tracking-tight mb-2">Browse by Category</h2>
          <p className="text-[#86868b] text-lg">Explore products and services across the value chain.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((c) => (
            <div 
              key={c.title} 
              className="card group cursor-pointer"
            >
              <div className="flex flex-col h-full">
                <div className="w-14 h-14 rounded-2xl bg-[#0071E3]/5 text-[#0071E3] flex items-center justify-center text-2xl transition-all duration-300 group-hover:scale-110 group-hover:bg-[#0071E3] group-hover:text-white shadow-sm">
                  <i className={c.icon} />
                </div>
                <h3 className="text-lg font-bold text-[#1d1d1f] mt-6 mb-2">{c.title}</h3>
                <p className="text-sm text-[#86868b] leading-relaxed">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

