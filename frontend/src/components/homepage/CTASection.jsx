import { Link } from "react-router-dom";

export default function CTASection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-[#1d1d1f] rounded-[32px] p-12 md:p-20 text-center relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#0071E3]/20 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-6 leading-tight">
              Scale Your <br className="md:hidden" />
              <span className="text-[#0071E3]">Hydrogen Reach</span>
            </h2>
            <p className="text-[#86868b] text-lg md:text-xl mb-12">
              Join as a supplier today and connect with premium buyers in the world's leading hydrogen marketplace.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link to="/free-trial" className="btn-primary w-full sm:w-auto px-8 py-4 text-lg">
                Start Free Trial
              </Link>
              <Link to="/contact" className="text-white hover:text-[#0071E3] font-medium transition-colors px-6 py-4">
                Request a Demo <i className="bi bi-chevron-right text-xs ms-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

