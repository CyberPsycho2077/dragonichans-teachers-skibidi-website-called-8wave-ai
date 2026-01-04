"use client";

import { useEffect, useMemo, useState } from "react";

type OperationalViewPreviewProps = {
  active: boolean;
  theme?: "light";
  embedded?: boolean;
};

type TabKey = "stakeholders" | "installations";

const stakeholderPills = ["AI Owner", "Business Owner", "Legal"] as const;
const installationPills = ["Service A", "Pipeline B", "Model C"] as const;

const barHeights = [8, 14, 10, 18, 12, 20, 9, 16, 11] as const;

type HighlightKey = "aiOwner" | "businessOwner" | "legal" | null;

function clampTab(tab: TabKey) {
  return tab === "installations" ? "installations" : "stakeholders";
}

export default function OperationalViewPreview({ active, theme = "light", embedded = false }: OperationalViewPreviewProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("stakeholders");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highlight, setHighlight] = useState<HighlightKey>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setReducedMotion(event.matches);
    };

    handleChange(mediaQuery);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  const pills = activeTab === "stakeholders" ? stakeholderPills : installationPills;
  const inventoryLabel = activeTab === "stakeholders" ? "Shared inventory" : "Installations inventory";
  const chipLabels = activeTab === "stakeholders" ? ["Monitor", "Analyse", "Understand"] : ["Monitor", "Trace", "Report"];

  const tabLabelStakeholders = "Stakeholders";
  const tabLabelInstallations = embedded ? "Installs" : "Installations";

  const motionClass = reducedMotion ? "" : "transition-all duration-300";
  const thumbMotionClass = reducedMotion ? "" : "transition-transform duration-300";

  const nodes = useMemo(() => {
    const keyOpacity = (key: Exclude<HighlightKey, null>) => (highlight === null ? 0 : highlight === key ? 1 : 0.12);

    return {
      keyOpacity,
    };
  }, [highlight]);

  return (
    <div
      className={[
        // Wireframe-only container (layout + motion; no final visual styling)
        embedded
          ? "relative h-full w-full overflow-hidden"
          : "relative overflow-hidden rounded-[18px] border border-slate-300/60 bg-transparent p-[20px]",
        reducedMotion ? "reduced-motion" : "",
        theme === "light" ? "" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={["relative flex items-start justify-between", embedded ? "gap-3" : "gap-4"].join(" ")}>
        <div className={[
          "min-w-0 text-slate-900",
          embedded ? "text-[13px] font-semibold leading-tight" : "text-sm font-semibold leading-tight",
        ].join(" ")}
        >
          Operational view
        </div>

        <div
          className={[
            "relative inline-flex items-center rounded-full border border-slate-300/60 bg-transparent p-1 font-medium text-slate-700",
            embedded ? "h-8 w-[176px] max-w-[56%] text-[10px]" : "h-9 text-[11px]",
          ].join(" ")}
        >
          <span
            className={[
              "absolute left-1 top-1 w-1/2 rounded-full border border-slate-300/60 bg-transparent",
              embedded ? "h-6" : "h-7",
              thumbMotionClass,
              clampTab(activeTab) === "stakeholders" ? "translate-x-0" : "translate-x-full",
            ]
              .filter(Boolean)
              .join(" ")}
          />
          <button
            type="button"
            aria-pressed={clampTab(activeTab) === "stakeholders"}
            onClick={() => setActiveTab("stakeholders")}
            className={[
              "relative z-10 flex-1 rounded-full text-center",
              embedded ? "h-6 px-2" : "h-7 px-3",
              motionClass,
              clampTab(activeTab) === "stakeholders" ? "text-slate-900" : "text-slate-500 hover:text-slate-700",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {tabLabelStakeholders}
          </button>
          <button
            type="button"
            aria-pressed={clampTab(activeTab) === "installations"}
            onClick={() => setActiveTab("installations")}
            className={[
              "relative z-10 flex-1 rounded-full text-center",
              embedded ? "h-6 px-2" : "h-7 px-3",
              motionClass,
              clampTab(activeTab) === "installations" ? "text-slate-900" : "text-slate-500 hover:text-slate-700",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {tabLabelInstallations}
          </button>
        </div>
      </div>

      <div
        className={[
          embedded ? "mt-3" : "mt-4",
          "grid min-h-0",
          embedded ? "gap-[14px] sm:grid-cols-[55%_45%]" : "gap-[16px] sm:grid-cols-[54%_46%]",
        ].join(" ")}
      >
        <div className={[
          "grid min-h-0",
          embedded ? "gap-[14px]" : "gap-[16px]",
        ].join(" ")}>
          <div
            className={[
              "rounded-[16px] border border-slate-300/60 bg-transparent",
              embedded ? "p-2.5" : "p-3.5",
            ].join(" ")}
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[11px] font-semibold text-slate-700">{inventoryLabel}</p>
              <div className="flex items-center gap-2 text-[11px] font-medium text-slate-600">
                <span className="h-2 w-2 rounded-full border border-slate-300/60" />
                <span>Up to date</span>
              </div>
            </div>

            <div className={[
              "mt-3",
              embedded ? "space-y-1.5" : "space-y-2",
            ].join(" ")}>
              {[
                "w-11/12",
                "w-9/12",
              ].map((width, index) => (
                <div
                  key={`${width}-${index}`}
                  className={[
                    "h-2 rounded-full border border-slate-300/60",
                    width,
                    !reducedMotion && active ? "wf-bar" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={{ animationDelay: `${index * 180}ms` }}
                />
              ))}
            </div>

            <div
              className={[
                embedded ? "mt-3" : "mt-4",
                "flex flex-wrap",
                embedded ? "gap-1.5" : "gap-2",
              ].join(" ")}
            >
              {pills.map((pill) => (
                <span
                  key={pill}
                  className={[
                    "rounded-full border border-slate-300/60 bg-transparent font-medium text-slate-700",
                    embedded ? "px-2.5 py-1 text-[10px]" : "px-2.5 py-1 text-[11px]",
                  ].join(" ")}
                >
                  {pill}
                </span>
              ))}
            </div>
          </div>

          <div className={[
            "rounded-[16px] border border-slate-300/60 bg-transparent",
            embedded ? "p-3" : "p-3.5",
          ].join(" ")}>
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[11px] font-semibold text-slate-700">Status, targets & performance</p>
              <div className="h-2 w-10 rounded-full border border-slate-300/60" />
            </div>
            <div className={[
              "mt-3 flex items-end",
              embedded ? "gap-0.5" : "gap-1",
            ].join(" ")}>
              {(embedded ? barHeights.slice(0, 8) : barHeights).map((height, index) => (
                <div
                  key={`${height}-${index}`}
                  className={[
                    embedded ? "w-1.5 rounded-full border border-slate-300/60" : "w-2 rounded-full border border-slate-300/60",
                    !reducedMotion && active ? "wf-bar" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={{ height: `${height}px`, animationDelay: `${index * 130}ms` }}
                />
              ))}
            </div>
            <div className={[
              "mt-3 flex flex-wrap",
              embedded ? "gap-1.5" : "gap-2",
            ].join(" ")}>
              {chipLabels.map((chip) => (
                <span
                  key={chip}
                  className={[
                    "rounded-full border border-slate-300/60 bg-transparent px-2.5 py-1 font-medium text-slate-700",
                    embedded ? "text-[10px]" : "text-[11px]",
                  ].join(" ")}
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div
          className={[
            "group/connected min-h-0 rounded-[16px] border border-slate-300/60 bg-transparent",
            embedded ? "p-3" : "p-3.5",
          ].join(" ")}
        >
          <p className="text-[11px] font-semibold text-slate-700">CONNECTED STAKEHOLDERS</p>

          <div className={[
            "mt-3 rounded-[14px] border border-slate-300/40 bg-transparent",
            embedded ? "p-2.5" : "p-3",
          ].join(" ")}>
            <div className={[
              "relative",
              embedded ? "h-[120px]" : "h-[150px]",
            ].join(" ")}>
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 300 180" aria-hidden="true">
                <path
                  d="M 150 92 C 150 66, 150 50, 150 34"
                  fill="none"
                  stroke="rgba(148,163,184,0.7)"
                  strokeWidth="1.4"
                  strokeDasharray="3 8"
                  strokeLinecap="round"
                />
                <path
                  d="M 150 92 C 188 82, 210 74, 232 62"
                  fill="none"
                  stroke="rgba(148,163,184,0.6)"
                  strokeWidth="1.4"
                  strokeDasharray="3 8"
                  strokeLinecap="round"
                />
                <path
                  d="M 150 92 C 120 114, 98 128, 74 142"
                  fill="none"
                  stroke="rgba(148,163,184,0.6)"
                  strokeWidth="1.4"
                  strokeDasharray="3 8"
                  strokeLinecap="round"
                />

                <path id="ov-wf-particle" d="M 150 92 C 188 82, 210 74, 232 62" fill="none" />
                {!reducedMotion && active && (
                  <circle r="2" fill="rgba(148,163,184,0.55)">
                    <animateMotion dur="9s" repeatCount="indefinite">
                      <mpath href="#ov-wf-particle" xlinkHref="#ov-wf-particle" />
                    </animateMotion>
                  </circle>
                )}

                <g transform="translate(150 92)">
                  <g>
                    {!reducedMotion && active && (
                      <animateTransform
                        attributeName="transform"
                        type="scale"
                        values="1;1.03;1"
                        dur="5.6s"
                        repeatCount="indefinite"
                      />
                    )}
                    <circle cx="0" cy="0" r="23" fill="none" stroke="rgba(148,163,184,0.7)" strokeWidth="1.2" />
                    <circle cx="0" cy="0" r="14" fill="none" stroke="rgba(148,163,184,0.6)" strokeWidth="1.2" />
                    <text x="0" y="4" textAnchor="middle" fontSize="10" fontWeight="700" fill="rgba(71,85,105,0.9)">
                      AI
                    </text>
                  </g>
                </g>

                <g>
                  <circle cx="150" cy="34" r="9" fill="transparent" stroke="rgba(148,163,184,0.7)" strokeWidth="1.1" />
                  <circle
                    cx="150"
                    cy="34"
                    r="13"
                    fill="none"
                    stroke="rgba(56,189,248,0.95)"
                    strokeWidth="1.2"
                    opacity={nodes.keyOpacity("aiOwner")}
                  />

                  <circle cx="232" cy="62" r="9" fill="transparent" stroke="rgba(148,163,184,0.7)" strokeWidth="1.1" />
                  <circle
                    cx="232"
                    cy="62"
                    r="13"
                    fill="none"
                    stroke="rgba(56,189,248,0.95)"
                    strokeWidth="1.2"
                    opacity={nodes.keyOpacity("businessOwner")}
                  />

                  <circle cx="74" cy="142" r="9" fill="transparent" stroke="rgba(148,163,184,0.7)" strokeWidth="1.1" />
                  <circle
                    cx="74"
                    cy="142"
                    r="13"
                    fill="none"
                    stroke="rgba(56,189,248,0.95)"
                    strokeWidth="1.2"
                    opacity={nodes.keyOpacity("legal")}
                  />

                  <circle cx="226" cy="142" r="9" fill="transparent" stroke="rgba(148,163,184,0.55)" strokeWidth="1.1" opacity="0.8" />
                </g>
              </svg>
            </div>
          </div>

          <div className={[
            "mt-3 flex min-h-0 flex-col",
            embedded ? "gap-1.5" : "gap-2",
          ].join(" ")}>
            {(
              [
                { label: "AI Owner", key: "aiOwner" as const, delayMs: 0 },
                { label: "Business Owner", key: "businessOwner" as const, delayMs: 80 },
                { label: "Legal", key: "legal" as const, delayMs: 160 },
              ] as const
            ).map((pill) => (
              <button
                key={pill.label}
                type="button"
                onMouseEnter={() => setHighlight(pill.key)}
                onMouseLeave={() => setHighlight(null)}
                onFocus={() => setHighlight(pill.key)}
                onBlur={() => setHighlight(null)}
                className={[
                  "w-full rounded-full border border-slate-300/60 bg-transparent px-3 text-left font-medium text-slate-800",
                  embedded ? "py-1.5 text-[10px]" : "py-2 text-[11px]",
                  reducedMotion ? "" : "wf-pill",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/40",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={!reducedMotion ? { transitionDelay: `${pill.delayMs}ms` } : undefined}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .wf-bar {
          animation: wfBar 2.8s ease-in-out infinite;
          will-change: transform;
        }

        .wf-pill {
          transition: transform 300ms ease, opacity 300ms ease, border-color 300ms ease;
        }

        .group\/connected:hover .wf-pill,
        .group\/connected:focus-within .wf-pill {
          transform: translateX(4px);
        }

        @keyframes wfBar {
          0%,
          100% {
            transform: scaleX(1);
          }
          50% {
            transform: scaleX(0.92);
          }
        }
      `}</style>
    </div>
  );
}
