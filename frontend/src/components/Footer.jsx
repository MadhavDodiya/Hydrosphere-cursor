import "./Footer.css";

const footerLinks = {
  Marketplace: ["Suppliers", "Categories", "Pricing", "Partner Program"],
  Resources: ["Documentation", "Case Studies", "Support", "Status"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Security"],
};

export default function Footer() {
  return (
    <footer className="hs-footer border-top bg-white">
      <div className="container py-5">
        <div className="row g-4">
          <div className="col-12 col-md-4 mb-4 mb-md-0">
            <div className="fw-bold h5 mb-2" id="about">
              HydroSphere
            </div>
            <p className="text-body-secondary mb-3">
              A modern B2B hydrogen marketplace helping buyers source verified suppliers and scale clean energy adoption.
            </p>
            <div className="d-flex align-items-center gap-2">
              <a className="hs-social" href="#" aria-label="Twitter">
                <span className="bi bi-twitter" aria-hidden="true" />
              </a>
              <a className="hs-social" href="#" aria-label="LinkedIn">
                <span className="bi bi-linkedin" aria-hidden="true" />
              </a>
              <a className="hs-social" href="#" aria-label="YouTube">
                <span className="bi bi-youtube" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="col-6 col-md-2">
            <div className="fw-semibold mb-2">Marketplace</div>
            <ul className="list-unstyled small mb-0">
              {footerLinks.Marketplace.map((t) => (
                <li key={t} className="mb-2">
                  <a className="hs-footer-link" href="#">
                    {t}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-6 col-md-3">
            <div className="fw-semibold mb-2">Resources</div>
            <ul className="list-unstyled small mb-0">
              {footerLinks.Resources.map((t) => (
                <li key={t} className="mb-2">
                  <a className="hs-footer-link" href="#">
                    {t}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-12 col-md-3" id="contact">
            <div className="fw-semibold mb-2">Legal</div>
            <ul className="list-unstyled small mb-0">
              {footerLinks.Legal.map((t) => (
                <li key={t} className="mb-2">
                  <a className="hs-footer-link" href="#">
                    {t}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-2 pt-4 mt-4 border-top">
          <div className="small text-body-secondary">© {new Date().getFullYear()} HydroSphere. All rights reserved.</div>
          <div className="small text-body-secondary">Built for verified hydrogen commerce.</div>
        </div>
      </div>
    </footer>
  );
}
