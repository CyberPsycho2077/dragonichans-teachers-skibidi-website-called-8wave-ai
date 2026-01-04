"use client";

const offerings = [
  {
    id: "eu-ai-act",
    title: "Solving The EU AI Act Requirements",
    description: [
      "Our platform continuously monitors your AI systems for compliance with external regulations like the EU AI Act, throughout their entire lifecycle. Internal business requirements & KPIs are tracked in the same way with automated production of evidence for any auditing and business reporting.",
      "Through our policy engine we ensure all AI systems stay within the boundaries of their intended operation.",
    ],
    imagePosition: "right" as const,
  },
  {
    id: "control-hub",
    title: "The Control Hub for your AI",
    description: [
      "Our platform provides a collaborative space where business & tech leaders can define goals and business / technical metrics, track progress in real-time, and ensure AI alignment with business objectives and evolving governance frameworks.",
      "We establish a single source of truth to prevent miscommunication and establish alignment between all stakeholders.",
    ],
    imagePosition: "left" as const,
  },
  {
    id: "ai-lineage",
    title: "Track Your Data & AI Journey",
    description: [
      "Our platform tracks the entire journey of your data and AI - 'AI lineage' to identify and fix problems early, avoid costly mistakes, and to ensure proper behaviour in production. We make sure you can trust your AI to follow your intentions as well as law & regulations while delivering clear business value.",
    ],
    imagePosition: "right" as const,
  },
];

const benefits = [
  {
    id: "business-improvement",
    title: "Business Improvement",
    description: [
      "We help you get your AI systems rapidly into production. By guiding you through all necessary checks and appropriate preparations and by providing capabilities for close monitoring & control after launch, we give you all the confidence you need to move fast with AI.",
      "A key challenge for companies is to reconcile and translate between business & tech requirements while staying within defined regulatory boundaries. We solve this by clearly linking and storing all requirements dimensions and making them available for all through the cross-functional collaboration platform.",
    ],
    icon: "chart" as const,
  },
  {
    id: "trust",
    title: "Trust",
    description: [
      "We give you the tools to prove your trustworthiness to customers & partners.",
      "All the way from development and into production we let you test your data and AI system towards a number of select and widely recognised tests to ensure you are able to project the level of trustwhorthiness you desire.",
    ],
    icon: "shield" as const,
  },
];

export default function UniqueOfferingSection() {
  return (
    <section className="relative overflow-hidden bg-white py-24">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-4xl font-semibold text-slate-900 sm:text-5xl">
            Our Unique Offering
          </h2>
        </div>

        {/* Main Offerings */}
        <div className="mt-20 space-y-32">
          {offerings.map((offering, index) => (
            <div
              key={offering.id}
              className={`grid gap-12 lg:grid-cols-2 lg:gap-16 ${
                offering.imagePosition === "left" ? "lg:grid-flow-dense" : ""
              }`}
            >
              {/* Text Content */}
              <div
                className={`flex flex-col justify-center ${
                  offering.imagePosition === "left" ? "lg:col-start-2" : ""
                }`}
              >
                <h3 className="text-3xl font-semibold text-slate-900">
                  {offering.title}
                </h3>
                <div className="mt-6 space-y-4">
                  {offering.description.map((paragraph, idx) => (
                    <p key={idx} className="text-lg leading-relaxed text-slate-600">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              {/* Image/Placeholder */}
              <div
                className={`flex items-center justify-center ${
                  offering.imagePosition === "left" ? "lg:col-start-1 lg:row-start-1" : ""
                }`}
              >
                <div className="relative h-[400px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 shadow-lg">
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-slate-800 text-white">
                        <svg
                          className="h-10 w-10"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          {offering.id === "eu-ai-act" && (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                            />
                          )}
                          {offering.id === "control-hub" && (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
                            />
                          )}
                          {offering.id === "ai-lineage" && (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                            />
                          )}
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-slate-500">
                        {offering.id === "eu-ai-act" && "AI System Preview"}
                        {offering.id === "control-hub" && "Control Hub Preview"}
                        {offering.id === "ai-lineage" && "AI Lineage Visualization"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Benefits Grid */}
        <div className="mt-32 grid gap-12 lg:grid-cols-2 lg:gap-16">
          {benefits.map((benefit) => (
            <div
              key={benefit.id}
              className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-slate-900 text-white">
                {benefit.icon === "chart" && (
                  <svg
                    className="h-7 w-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                    />
                  </svg>
                )}
                {benefit.icon === "shield" && (
                  <svg
                    className="h-7 w-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                    />
                  </svg>
                )}
              </div>
              <h3 className="text-2xl font-semibold text-slate-900">
                {benefit.title}
              </h3>
              <div className="mt-4 space-y-4">
                {benefit.description.map((paragraph, idx) => (
                  <p key={idx} className="text-base leading-relaxed text-slate-600">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
