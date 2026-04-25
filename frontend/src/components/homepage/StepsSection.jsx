const steps = [
  {
    num: "1",
    title: "Search",
    desc: "Enter your location and product needs to discover verified suppliers nearby.",
  },
  {
    num: "2",
    title: "Compare",
    desc: "Review ratings, pricing, and capabilities side-by-side to choose the right fit.",
  },
  {
    num: "3",
    title: "Contact",
    desc: "Connect directly with suppliers and request quotes with clear delivery timelines.",
  },
];

export default function StepsSection() {
  return (
    <section className="py-24 bg-[#F5F5F7]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-4xl font-extrabold text-[#1d1d1f] tracking-tight mb-4">Streamlined Sourcing</h2>
          <p className="text-[#86868b] text-lg leading-relaxed">
            Connecting green demand with verified supply in three simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {steps.map((s) => (
            <div key={s.title} className="card relative group">
              <div className="absolute -top-6 left-10 w-12 h-12 rounded-2xl bg-[#0071E3] text-white flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                {s.num}
              </div>
              <div className="pt-4 text-left">
                <h3 className="text-xl font-bold text-[#1d1d1f] mb-3">{s.title}</h3>
                <p className="text-[#86868b] leading-relaxed text-sm">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
