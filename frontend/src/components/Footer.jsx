import { Link } from "react-router-dom";

const footerLinks = {
  Marketplace: [
    { name: "Suppliers", to: "/marketplace" },
    { name: "Categories", to: "/marketplace" },
    { name: "Pricing", to: "/pricing" },
    { name: "Partner Program", to: "/about" }
  ],
  Resources: [
    { name: "Documentation", to: "#" },
    { name: "Case Studies", to: "#" },
    { name: "Support", to: "/contact" },
    { name: "Status", to: "#" }
  ],
  Legal: [
    { name: "Privacy Policy", to: "#" },
    { name: "Terms of Service", to: "#" },
    { name: "Cookie Policy", to: "#" },
    { name: "Security", to: "#" }
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#f5f5f7] border-t border-black/5 py-16 px-6 text-sm font-medium">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-[#0071E3] rounded flex items-center justify-center text-white font-black text-xs">
                H
              </div>
              <span className="text-base font-bold tracking-tight text-[#1d1d1f]">HydroSphere</span>
            </Link>
            <p className="text-[#86868b] leading-relaxed max-w-sm mb-6">
              A modern B2B hydrogen marketplace helping buyers source verified suppliers and scale clean energy adoption globally.
            </p>
            <div className="flex items-center gap-4 text-[#86868b]">
              <a href="#" className="hover:text-[#0071E3] transition-colors text-lg"><i className="bi bi-twitter-x"></i></a>
              <a href="#" className="hover:text-[#0071E3] transition-colors text-lg"><i className="bi bi-linkedin"></i></a>
              <a href="#" className="hover:text-[#0071E3] transition-colors text-lg"><i className="bi bi-youtube"></i></a>
            </div>
          </div>

          <div>
            <div className="font-bold text-[#1d1d1f] mb-4">Marketplace</div>
            <ul className="space-y-3">
              {footerLinks.Marketplace.map((link) => (
                <li key={link.name}>
                  <Link to={link.to} className="text-[#86868b] hover:text-[#1d1d1f] transition-colors">{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="font-bold text-[#1d1d1f] mb-4">Resources</div>
            <ul className="space-y-3">
              {footerLinks.Resources.map((link) => (
                <li key={link.name}>
                  <Link to={link.to} className="text-[#86868b] hover:text-[#1d1d1f] transition-colors">{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="font-bold text-[#1d1d1f] mb-4">Legal</div>
            <ul className="space-y-3">
              {footerLinks.Legal.map((link) => (
                <li key={link.name}>
                  <Link to={link.to} className="text-[#86868b] hover:text-[#1d1d1f] transition-colors">{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-black/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#86868b]">
          <div>© {new Date().getFullYear()} HydroSphere. All rights reserved.</div>
          <div>Designed with precision. Built for global scale.</div>
        </div>
      </div>
    </footer>
  );
}
