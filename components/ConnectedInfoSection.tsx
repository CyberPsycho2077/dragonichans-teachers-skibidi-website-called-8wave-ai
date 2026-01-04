import Container from "@/components/Container";

type InfoCard = {
  title: string;
  description: string;
  meta: string;
};

const CARDS: InfoCard[] = [
  {
    title: "Understand",
    meta: "Discover",
    description: "See what’s running, where it lives, and how it performs across teams.",
  },
  {
    title: "Align",
    meta: "Coordinate",
    description: "Connect initiatives to strategy, risk, and delivery—so decisions stay consistent.",
  },
  {
    title: "Optimise",
    meta: "Improve",
    description: "Continuously refine outcomes with feedback loops, metrics, and operational signals.",
  },
];

export default function ConnectedInfoSection() {
  return (
    <section className="relative border-t border-slate-200/70 bg-background py-16 sm:py-20">
      <Container>
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-slate-500">
              How it works
            </p>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              A single system that connects everything
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
              The platform links your AI initiatives to a shared operational view—so teams move faster with
              clarity.
            </p>
          </div>

          <div className="relative mt-12">
            {/* Desktop / tablet connectors */}
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 hidden h-full w-full sm:block"
              viewBox="0 0 1000 420"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="connector" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="rgb(148 163 184)" stopOpacity="0.35" />
                  <stop offset="0.5" stopColor="rgb(100 116 139)" stopOpacity="0.85" />
                  <stop offset="1" stopColor="rgb(148 163 184)" stopOpacity="0.35" />
                </linearGradient>
              </defs>

              {/* Left */}
              <path
                d="M 170 132 C 250 208, 320 250, 500 302"
                fill="none"
                stroke="url(#connector)"
                strokeWidth="2"
                className="connector-flow"
              />
              {/* Middle */}
              <path
                d="M 500 132 C 500 210, 500 246, 500 302"
                fill="none"
                stroke="url(#connector)"
                strokeWidth="2"
                className="connector-flow"
              />
              {/* Right */}
              <path
                d="M 830 132 C 750 208, 680 250, 500 302"
                fill="none"
                stroke="url(#connector)"
                strokeWidth="2"
                className="connector-flow"
              />

              {/* Anchor pulses */}
              <circle cx="500" cy="302" r="6" fill="rgb(51 65 85)" opacity="0.8" />
              <circle cx="500" cy="302" r="14" fill="none" stroke="rgb(51 65 85)" strokeWidth="1.5" className="connector-pulse" />
            </svg>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
              {CARDS.map((card) => (
                <div
                  key={card.title}
                  className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/70 p-6 shadow-[var(--shadow-soft)] backdrop-blur transition-all hover:-translate-y-0.5 hover:border-slate-300/70 hover:shadow-[var(--shadow-soft-lg)]"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-lg font-semibold text-slate-900">{card.title}</h3>
                    <span className="rounded-full border border-slate-200/80 bg-white/70 px-3 py-1 text-[11px] font-medium text-slate-600">
                      {card.meta}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{card.description}</p>

                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="absolute -inset-20 bg-gradient-to-b from-white/0 via-white/35 to-white/0" />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 -z-10 rounded-2xl bg-white/50 blur-xl" />
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 px-6 py-5 shadow-[var(--shadow-soft)] backdrop-blur">
                  <div className="flex items-center gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-slate-900 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)]">
                      8
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">8wave AI</p>
                      <p className="text-sm text-slate-600">Operational Intelligence</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile connector hint */}
            <div className="relative mt-8 flex justify-center sm:hidden">
              <div className="h-14 w-px bg-gradient-to-b from-transparent via-slate-300/70 to-transparent" />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
