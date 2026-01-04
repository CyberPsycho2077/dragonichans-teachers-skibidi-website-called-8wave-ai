"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Container from "@/components/Container";
import OperationalViewPreview from "@/components/previews/OperationalViewPreview";

const cards = [
  {
    id: "understand",
    title: "Understand",
    question: "How do you understand your full set of AI activities?",
    body: [
      "Imagine a software that seamlessly connects all AI stakeholders and provides an overview of all AI installations shared by them.",
      "Picture how you can easily keep updated on the status, targets & performance while being able to monitor, analyse and understand outcomes along with the systems’ strengths & weaknesses.",
    ],
  },
  {
    id: "align",
    title: "Align",
    question: "How do you know your AI reflects your values and follows all the latest laws & regulations?",
    body: [
      "Make sure your AI implementations align with company values as well as current laws & regulatory demands. The EU AI Act took effect in August 2024 and is gradually coming into full operation.",
    ],
  },
  {
    id: "optimise",
    title: "Optimise",
    question: "How do you finally get your AI systems into production and ensure they deliver real business value?",
    body: [
      "Move AI quickly into production through a streamlined, guided process. Stay confident about its performance through solid monitoring in production. Have your AI linked to business KPIs while constantly measuring, analysing & improving its performance.",
    ],
  },
];

export default function OfferingFlowSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const connectorPaths = useMemo(
    () => ({
      understand: "M 170 140 C 260 220, 320 280, 500 360",
      align: "M 500 140 C 500 230, 500 290, 500 360",
      optimise: "M 830 140 C 740 220, 680 280, 500 360",
    }),
    []
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = (event: MediaQueryListEvent | MediaQueryList) => {
      setReducedMotion(event.matches);
    };

    updateMotion(mediaQuery);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", updateMotion);
    } else {
      mediaQuery.addListener(updateMotion);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", updateMotion);
      } else {
        mediaQuery.removeListener(updateMotion);
      }
    };
  }, []);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    let frameId: number | null = null;
    let running = false;
    let viewportWidth = 0;
    let viewportHeight = 0;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }> = [];

    const createParticles = () => {
      const count = viewportWidth < 640 ? 36 : 64;
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * viewportWidth,
        y: Math.random() * viewportHeight,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: 1.4 + Math.random() * 1.6,
      }));
    };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) {
        return;
      }
      const { width, height } = parent.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      viewportWidth = width;
      viewportHeight = height;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      createParticles();
      if (reducedMotion || !isVisible) {
        renderStatic();
      }
    };

    const renderStatic = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      drawScene();
    };

    const drawScene = () => {
      context.clearRect(0, 0, viewportWidth, viewportHeight);

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        for (let j = i + 1; j < particles.length; j += 1) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            const alpha = 0.12 * (1 - dist / 140);
            context.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
            context.lineWidth = 1;
            context.beginPath();
            context.moveTo(p.x, p.y);
            context.lineTo(q.x, q.y);
            context.stroke();
          }
        }
      }

      particles.forEach((p) => {
        context.fillStyle = "rgba(255, 255, 255, 0.6)";
        context.beginPath();
        context.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        context.fill();
      });
    };

    const animate = () => {
      if (!running) {
        return;
      }
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x <= 0 || p.x >= viewportWidth) p.vx *= -1;
        if (p.y <= 0 || p.y >= viewportHeight) p.vy *= -1;
      });
      drawScene();
      frameId = requestAnimationFrame(animate);
    };

    const start = () => {
      if (running) return;
      running = true;
      frameId = requestAnimationFrame(animate);
    };

    const stop = () => {
      running = false;
      if (frameId) {
        cancelAnimationFrame(frameId);
        frameId = null;
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stop();
        return;
      }
      if (!reducedMotion && isVisible) {
        start();
      } else {
        renderStatic();
      }
    };

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", handleVisibility);

    if (!reducedMotion && isVisible) {
      start();
    } else {
      renderStatic();
    }

    return () => {
      stop();
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isVisible, reducedMotion]);

  const wrapperClassName = useMemo(() => {
    return [
      "relative overflow-hidden border-t border-slate-200/70 py-20 sm:py-24",
      "ethereal-section",
      isVisible ? "flow-visible" : "",
      reducedMotion ? "reduced-motion" : "",
    ]
      .filter(Boolean)
      .join(" ");
  }, [isVisible, reducedMotion]);

  return (
    <section ref={sectionRef} className={wrapperClassName}>
      <div className="ethereal-mesh" />
      <div className="liquid-blob-layer">
        <div className="liquid-blob blob-1" />
        <div className="liquid-blob blob-2" />
        <div className="liquid-blob blob-3" />
      </div>
      <div className="bubble-layer">
        {[
          { size: 46, left: "8%", delay: "0s", duration: "14s" },
          { size: 28, left: "22%", delay: "3s", duration: "12s" },
          { size: 36, left: "40%", delay: "1.5s", duration: "16s" },
          { size: 22, left: "58%", delay: "4s", duration: "11s" },
          { size: 40, left: "74%", delay: "2s", duration: "15s" },
          { size: 26, left: "88%", delay: "5s", duration: "13s" },
        ].map((bubble, index) => (
          <span
            key={index}
            className="bubble"
            style={{
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              left: bubble.left,
              animationDelay: bubble.delay,
              animationDuration: bubble.duration,
            }}
          />
        ))}
      </div>
      <div className="particle-layer">
        <canvas ref={canvasRef} className="particle-canvas" />
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-[-120px] h-[420px] bg-gradient-to-b from-sky-100/60 via-white/0 to-transparent" />
      <Container className="relative z-10">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.5em] text-slate-500">HOW IT WORKS</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            A single system that connects everything
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            The platform links your AI initiatives to a shared operational view—so teams move faster with clarity.
          </p>
        </div>

        <div className="relative mt-16">
          <div className="pointer-events-none absolute left-1/2 top-[62%] h-72 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.4),rgba(255,255,255,0))] blur-2xl" />

          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hidden h-full w-full md:block"
            viewBox="0 0 1000 520"
            preserveAspectRatio="none"
          >
            <path
              id="connector-understand"
              d={connectorPaths.understand}
              fill="none"
              strokeWidth="1.5"
              className="connector-line"
            />
            <path
              d={connectorPaths.understand}
              fill="none"
              strokeWidth="2.25"
              className="connector-line-active connector-flow connector-pulse"
              style={{ opacity: activeId === "understand" ? 1 : 0 }}
            />
            <path
              id="connector-align"
              d={connectorPaths.align}
              fill="none"
              strokeWidth="1.5"
              className="connector-line"
            />
            <path
              d={connectorPaths.align}
              fill="none"
              strokeWidth="2.25"
              className="connector-line-active connector-flow connector-pulse"
              style={{ opacity: activeId === "align" ? 1 : 0 }}
            />
            <path
              id="connector-optimise"
              d={connectorPaths.optimise}
              fill="none"
              strokeWidth="1.5"
              className="connector-line"
            />
            <path
              d={connectorPaths.optimise}
              fill="none"
              strokeWidth="2.25"
              className="connector-line-active connector-flow connector-pulse"
              style={{ opacity: activeId === "optimise" ? 1 : 0 }}
            />

            {activeId && !reducedMotion && (
              <circle r="4" className="connector-dot">
                <animateMotion dur="2.6s" repeatCount="indefinite" rotate="auto">
                  <mpath
                    href={`#connector-${activeId}`}
                    xlinkHref={`#connector-${activeId}`}
                  />
                </animateMotion>
              </circle>
            )}
          </svg>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {cards.map((card) => {
              const isActive = activeId === card.id;
              const isDimmed = activeId && !isActive;
              const isUnderstand = card.id === "understand";

              return (
                <div
                  key={card.id}
                  tabIndex={0}
                  onMouseEnter={() => setActiveId(card.id)}
                  onMouseLeave={() => setActiveId(null)}
                  onFocus={() => setActiveId(card.id)}
                  onBlur={() => setActiveId(null)}
                  className={[
                    "group relative overflow-hidden rounded-[22px] p-6 transition-all",
                    "liquid-glass-card",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/60",
                    isActive ? "-translate-y-1 ring-1 ring-sky-200/70" : "",
                    isDimmed ? "opacity-75" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <div className="pointer-events-none absolute inset-0 opacity-80 liquid-glass-sheen" />
                  <div
                    className={[
                      "pointer-events-none absolute -left-24 -top-24 h-56 w-56 rounded-full blur-2xl transition-opacity",
                      "bg-[radial-gradient(circle_at_center,rgba(125,211,252,0.35),transparent)]",
                      isActive ? "opacity-100" : "opacity-60",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  />
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />

                  <div className="relative">
                    <p className="text-sm font-semibold text-slate-900">{card.title}</p>
                    <p className="mt-4 text-base font-medium text-slate-700">{card.question}</p>
                    {card.body.map((line, index) => (
                      <p key={index} className="mt-4 text-sm leading-relaxed text-slate-600">
                        {line}
                      </p>
                    ))}

                    {isUnderstand && (
                      <div className="mt-6">
                        <div className="sr-only">Wireframe preview of shared inventory and status modules.</div>
                        <OperationalViewPreview active={!reducedMotion} embedded />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 flex justify-center">
            <div
              className={[
                "relative overflow-hidden rounded-[22px] px-6 py-5 text-center",
                "liquid-glass-hub",
                activeId ? "hub-active ring-1 ring-sky-200/70" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <div className="pointer-events-none absolute inset-0 liquid-glass-sheen opacity-90" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />
              <div className="relative">
                <div className="text-sm font-semibold text-slate-900">8wave AI</div>
                <div className="text-sm text-slate-600">Operational Intelligence</div>
              </div>
            </div>
          </div>

          <div className="relative mt-10 flex justify-center md:hidden">
            <div className="h-14 w-px bg-gradient-to-b from-transparent via-slate-300/70 to-transparent" />
          </div>
        </div>
      </Container>
    </section>
  );
}
