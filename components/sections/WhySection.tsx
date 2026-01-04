"use client";

const challenges = [
  "Is your use of AI, its effects & outcomes well understood by all stakeholders?",
  "Do you find it challenging to get your AI applications fast into production?",
  "Is uncertainty around legal or regulatory aspects of your AI stopping you or slowing you down?",
  "How do you effectively prove to customers & partners that your AI follows relevant rules & regulations?",
  "Do you have a hard time ensuring lasting business value & ROI from your AI initiatives?",
  "How do you collaborate across business functions when innovating & building AI?",
  "How do you track & ensure your AI represents & reflects your values?",
  "Do you know your data & how it flows through your AI system?",
];

export default function WhySection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white py-24">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-16">
          <h2 className="text-4xl font-semibold text-slate-900 sm:text-5xl">
            Why 8wave?
          </h2>
        </div>

        <div className="relative">
          {/* Desktop Layout */}
          <div className="hidden lg:block">
            <div className="relative mx-auto h-[600px] max-w-5xl">
              {/* Central Circle */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="flex h-[280px] w-[280px] items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-orange-50 p-12 text-center shadow-lg">
                  <p className="text-2xl font-semibold leading-tight text-slate-800">
                    Do you face these challenges?
                  </p>
                </div>
              </div>

              {/* Question Bubbles */}
              {challenges.map((challenge, index) => {
                const angle = (index / challenges.length) * 2 * Math.PI - Math.PI / 2;
                const radius = 320;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                  <div
                    key={index}
                    className="absolute left-1/2 top-1/2"
                    style={{
                      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                    }}
                  >
                    <div className="flex w-[280px] items-start gap-3 rounded-2xl bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm ring-1 ring-slate-200/60 transition-all hover:shadow-md">
                      <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 text-white">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-700">{challenge}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mobile/Tablet Layout */}
          <div className="lg:hidden">
            <div className="mb-12 flex justify-center">
              <div className="flex h-[240px] w-[240px] items-center justify-center rounded-full bg-gradient-to-br from-orange-100 to-orange-50 p-10 text-center shadow-lg">
                <p className="text-xl font-semibold leading-tight text-slate-800">
                  Do you face these challenges?
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {challenges.map((challenge, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-2xl bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm ring-1 ring-slate-200/60"
                >
                  <div className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 text-white">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-700">{challenge}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
