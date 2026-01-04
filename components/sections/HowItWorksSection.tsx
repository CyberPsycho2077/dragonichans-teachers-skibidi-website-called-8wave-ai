"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";

type CardId = "understand" | "align" | "optimise";

type ProcessCard = {
  id: CardId;
  title: string;
  question: string;
  paragraphs: string[];
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export default function HowItWorksSection() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<CardId, HTMLDivElement | null>>({
    understand: null,
    align: null,
    optimise: null,
  });

  const [activeId, setActiveId] = useState<CardId | null>(null);
  const rafParallaxRef = useRef<number | null>(null);

  const cards: ProcessCard[] = useMemo(
    () => [
      {
        id: "understand",
        title: "Understand",
        question: "How do you understand your full set of AI activities?",
        paragraphs: [
          "Imagine a software that seamlessly connects all AI stakeholders and provides an overview of all AI installations shared by them.",
          "Picture how you can easily keep updated on the status, targets & performance while being able to monitor, analyse and understand outcomes along with the systems strengths & weaknesses.",
        ],
      },
      {
        id: "align",
        title: "Align",
        question: "How do you know your AI reflects your values and follows all the latest laws & regulations?",
        paragraphs: [
          "Make sure your AI implementations align with company values as well as current laws & regulatory demands.",
          "The EU AI Act took effect in August 2024 and is gradually coming into full operation.",
        ],
      },
      {
        id: "optimise",
        title: "Optimise",
        question: "How do you finally get your AI systems into production and ensure they deliver real business value?",
        paragraphs: [
          "Move AI quickly into production through a streamlined, guided process. Stay confident about its performance through solid monitoring in production.",
          "Have your AI linked to business KPIs while constantly measuring, analysing & improving its performance.",
        ],
      },
    ],
    [],
  );

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;
      const px = clamp((nx - 0.5) * 2, -1, 1);
      const py = clamp((ny - 0.5) * 2, -1, 1);
      canvas.style.setProperty("--px", String(px));
      canvas.style.setProperty("--py", String(py));

      if (rafParallaxRef.current) return;
      rafParallaxRef.current = window.requestAnimationFrame(() => {
        rafParallaxRef.current = null;
      });
    };

    const onPointerLeave = () => {
      canvas.style.setProperty("--px", "0");
      canvas.style.setProperty("--py", "0");
    };

    canvas.addEventListener("pointermove", onPointerMove, { passive: true });
    canvas.addEventListener("pointerleave", onPointerLeave, { passive: true });

    return () => {
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      if (rafParallaxRef.current) window.cancelAnimationFrame(rafParallaxRef.current);
      rafParallaxRef.current = null;
    };
  }, []);

  return (
    <section className="relative overflow-hidden py-28">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgb(230,240,250) 0%, rgb(209,230,247) 42%, rgb(184,219,242) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 700px at 55% 50%, rgba(230,245,255,0.55) 0%, rgba(230,245,255,0.0) 62%)",
            opacity: 0.35,
          }}
        />
        <div className="absolute inset-0 opacity-[0.22] [background-image:radial-gradient(rgba(148,163,184,0.22)_0.7px,transparent_0.7px)] [background-size:24px_24px]" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(1200px 900px at 50% 50%, rgba(15,23,42,0.00) 0%, rgba(15,23,42,0.04) 55%, rgba(15,23,42,0.10) 100%)",
          }}
        />
        <div className="grain-overlay absolute inset-0 opacity-[0.03]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.42em] text-slate-600">THE SYSTEM IN MOTION</p>
          <h2 className="mt-4 text-4xl font-semibold text-slate-900 sm:text-5xl lg:text-6xl">
            One intelligence. Many moving parts.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            Your AI doesn’t live in steps.
            <br className="hidden sm:block" />
            It exists as a continuous operational field.
          </p>
        </div>

        <div className="relative mt-16">
          <div
            ref={canvasRef}
            className="relative mx-auto max-w-6xl"
          >
            {/* Diagram-local dotted grid (no outer card) */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.14] [background-image:radial-gradient(rgba(3,58,122,0.12)_0.6px,transparent_0.6px)] [background-size:22px_22px]"
              style={{
                backgroundPosition:
                  "calc(var(--px, 0) * 18px) calc(var(--py, 0) * 18px)",
              }}
            />

            {/* Hub = just the logo (no effects) */}
            <div className="relative z-20 mt-10 flex justify-center">
              <img
                src="/logo-dark.svg"
                alt=""
                className="h-9 w-auto opacity-80"
                draggable={false}
              />
            </div>

            {/* Cards */}
            <div className="relative z-10 grid gap-6 pt-8 sm:pt-10 lg:grid-cols-3">
              {cards.map((card) => {
                const isActive = activeId === card.id;
                const isDim = activeId !== null && activeId !== card.id;
                const parallaxMul =
                  card.id === "understand" ? { x: -1, y: 1 } : card.id === "align" ? { x: 0, y: -1 } : { x: 1, y: 1 };
                const floatClass = card.id === "understand" ? "hw-float-a" : card.id === "align" ? "hw-float-b" : "hw-float-c";

                return (
                  <div
                    key={card.id}
                    ref={(el) => {
                      cardRefs.current[card.id] = el;
                    }}
                    className="h-full"
                  >
                    <button
                      type="button"
                      onMouseEnter={() => setActiveId(card.id)}
                      onMouseLeave={() => setActiveId(null)}
                      onFocus={() => setActiveId(card.id)}
                      onBlur={() => setActiveId(null)}
                      className="group h-full w-full text-left focus:outline-none"
                      aria-label={`${card.title}. ${card.question}`}
                      style={{
                        opacity: isDim ? 0.55 : 1,
                        transition: "opacity 200ms ease-out",
                      }}
                    >
                      <div
                        className={`relative h-full rounded-[28px] p-8 sm:min-h-[360px] ${floatClass}`}
                        style={{
                          background:
                            "radial-gradient(420px 320px at 35% 20%, rgba(245,251,255,0.92) 0%, rgba(217,242,255,0.26) 40%, rgba(255,255,255,0.14) 72%, rgba(255,255,255,0.20) 100%)",
                          boxShadow:
                            "0 0 0 1px rgba(15,23,42,0.08) inset, 0 34px 110px rgba(15,23,42,0.12), 0 0 110px rgba(49,197,232,0.14)",
                          border: `1px solid ${isActive ? "rgba(49,197,232,0.52)" : "rgba(15,23,42,0.06)"}`,
                          backdropFilter: "blur(12px) saturate(125%)",
                          transform: `translate3d(calc(var(--px, 0) * ${parallaxMul.x * 10}px), calc(var(--py, 0) * ${
                            parallaxMul.y * 10
                          }px), 0) ${isActive ? "translate3d(0,-3px,0)" : "translate3d(0,0,0)"}`,
                          transition: "transform 260ms ease-out, border-color 200ms ease-out",
                        }}
                      >
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 rounded-[28px]"
                          style={{
                            background:
                              "radial-gradient(circle at 55% 45%, rgba(49,197,232,0.18) 0%, rgba(3,58,122,0.09) 44%, rgba(255,255,255,0) 72%), radial-gradient(260px 180px at 85% 30%, rgba(49,197,232,0.22) 0%, rgba(49,197,232,0.0) 72%)",
                            opacity: isActive ? 0.92 : 0.62,
                            transition: "opacity 200ms ease-out",
                          }}
                        />

                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 rounded-[28px]"
                          style={{
                            background:
                              "radial-gradient(380px 240px at 20% 25%, rgba(245,251,255,0.22) 0%, rgba(245,251,255,0.0) 68%), radial-gradient(420px 280px at 82% 72%, rgba(49,197,232,0.16) 0%, rgba(49,197,232,0.0) 70%)",
                            opacity: isActive ? 0.85 : 0.55,
                            filter: "blur(0px)",
                          }}
                        />

                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 rounded-[28px]"
                          style={{
                            background:
                              "radial-gradient(circle at 50% 50%, rgba(15,23,42,0) 0%, rgba(15,23,42,0) 46%, rgba(15,23,42,0.08) 80%, rgba(15,23,42,0.14) 100%)",
                            opacity: 0.55,
                          }}
                        />

                        <div className="relative">
                          <div className="text-lg font-semibold tracking-tight text-slate-900">{card.title}</div>
                          <div className="mt-3 text-sm font-medium leading-snug text-slate-700/85">{card.question}</div>
                          <div className="mt-5 space-y-4 text-sm leading-relaxed text-slate-600">
                            {card.paragraphs.map((p, idx) => (
                              <p key={idx}>{p}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes hw-float {
          0% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -10px, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        @keyframes hw-float-soft {
          0% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -7px, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        @keyframes hw-glow {
          0% { filter: saturate(1) brightness(1); }
          50% { filter: saturate(1.06) brightness(1.02); }
          100% { filter: saturate(1) brightness(1); }
        }
        .hw-float-a { animation: hw-float 9.5s ease-in-out infinite, hw-glow 7.5s ease-in-out infinite; }
        .hw-float-b { animation: hw-float-soft 11.5s ease-in-out infinite, hw-glow 8.5s ease-in-out infinite; }
        .hw-float-c { animation: hw-float 10.5s ease-in-out infinite, hw-glow 9.0s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .hw-float-a, .hw-float-b, .hw-float-c { animation: none; }
        }
      `}</style>
    </section>
  );
}