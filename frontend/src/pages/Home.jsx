import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Hero from "../components/homepage/Hero.jsx";
import CategorySection from "../components/homepage/CategorySection.jsx";
import FeaturedSuppliers from "../components/homepage/FeaturedSuppliers.jsx";
import StepsSection from "../components/homepage/StepsSection.jsx";
import CTASection from "../components/homepage/CTASection.jsx";
import Footer from "../components/Footer.jsx";
import { Helmet } from "react-helmet-async";
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
      <Helmet>
        <title>HydroSphere | The B2B Hydrogen Marketplace</title>
        <meta name="description" content="Find verified green, blue, and grey hydrogen suppliers globally. HydroSphere is the leading SaaS platform for hydrogen procurement and lead generation." />
        <meta name="keywords" content="hydrogen, green hydrogen, b2b marketplace, hydrogen suppliers, clean energy, renewable energy" />
      </Helmet>
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
