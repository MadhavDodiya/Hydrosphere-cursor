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
    <section className="hs-section">
      <div className="container">
        <div className="text-center mx-auto hs-max-760">
          <h2 className="h3 fw-bold mb-2">Streamlined Sourcing</h2>
          <p className="hs-muted mb-0">
            Connecting green demand with verified supply in three simple steps.
          </p>
        </div>

        <div className="row g-3 g-lg-4 mt-4">
          {steps.map((s) => (
            <div className="col-12 col-md-4" key={s.title}>
              <div className="hs-step h-100 p-4 text-center hs-shadow-soft">
                <div className="hs-step-number mx-auto">{s.num}</div>
                <h3 className="h6 fw-bold mt-3 mb-2">{s.title}</h3>
                <p className="small hs-muted mb-0">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
