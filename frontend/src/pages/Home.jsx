import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Hero from "../components/homepage/Hero.jsx";
import CategorySection from "../components/homepage/CategorySection.jsx";
import FeaturedSuppliers from "../components/homepage/FeaturedSuppliers.jsx";
import StepsSection from "../components/homepage/StepsSection.jsx";
import CTASection from "../components/homepage/CTASection.jsx";
import Footer from "../components/Footer.jsx";
import "./Home.css";

export default function Home() {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace("#", "");
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [location.hash]);

  return (
    <div className="hs-home">
      <Hero />
      <div id="categories">
        <CategorySection />
      </div>
      <div id="suppliers">
        <FeaturedSuppliers />
      </div>
      <div id="how-it-works">
        <StepsSection />
      </div>
      <CTASection />
      <Footer />
    </div>
  );
}
