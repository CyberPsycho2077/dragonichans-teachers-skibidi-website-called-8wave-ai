export default function AILineageSection() {
  const features = [
    {
      id: "transparency",
      title: "Transparency",
      description: "Understand the structure of your AI, its development history & lineage and its outcomes",
    },
    {
      id: "trustworthiness",
      title: "Trustworthiness",
      description: "Make sure your AI aligns with your values, and applicable laws & regulations while being able to show it.",
    },
    {
      id: "business-value",
      title: "Business Value",
      description: "Get your AI quickly into production. Continuously track & optimise its business performance.",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-cyan-50 to-slate-50 py-24">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Main Heading */}
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-normal leading-tight text-slate-800 sm:text-4xl sm:leading-tight lg:text-[2.75rem] lg:leading-tight">
            Our <span className="font-semibold">AI lineage</span> feature gives
            full data & model traceability. It provides AI systems that are
            transparent & auditable across your AI journey
          </h2>
        </div>

        {/* Three Feature Cards */}
        <div className="mx-auto mt-16 grid max-w-6xl gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.id} className="text-center">
              {/* Green Checkmark Icon */}
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-7 w-7 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-slate-800">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
