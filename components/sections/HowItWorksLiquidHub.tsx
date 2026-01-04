"use client";

import React from "react";

interface Node {
  id: string;
  angle: number;
  label: string;
}

export default function HowItWorksLiquidHub() {
  const nodes: Node[] = [
    { id: "left", angle: -120, label: "Understand" },
    { id: "top", angle: 90, label: "Align" },
    { id: "right", angle: -30, label: "Optimise" },
  ];

  const radius = 140; // distance from center to nodes
  const centerSize = 100; // center circle diameter

  // Calculate node positions
  const getNodePosition = (angle: number) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: Math.cos(rad) * radius,
      y: Math.sin(rad) * radius,
    };
  };

  return (
    <div className="relative w-full flex justify-center items-center py-12">
      {/* SVG Connector Lines */}
      <svg
        className="absolute inset-0 w-full h-96"
        style={{ pointerEvents: "none" }}
        viewBox={`${-radius - 120} ${-radius - 120} ${(radius + 120) * 2} ${(radius + 120) * 2}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {nodes.map((node) => {
          const pos = getNodePosition(node.angle);
          return (
            <line
              key={`line-${node.id}`}
              x1="0"
              y1="0"
              x2={pos.x}
              y2={pos.y}
              stroke="rgba(148, 163, 184, 0.3)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
          );
        })}
      </svg>

      {/* Container for nodes and center */}
      <div className="relative w-full h-96 flex justify-center items-center">
        {/* Center Liquid Glass Hub */}
        <div
          className="absolute liquid-premium-card rounded-full shadow-lg flex items-center justify-center text-center"
          style={{
            width: `${centerSize}px`,
            height: `${centerSize}px`,
            zIndex: 10,
          }}
        >
          <div className="relative z-1">
            <p className="text-lg font-semibold text-slate-900">8wave AI</p>
            <p className="text-xs text-slate-600">Operational</p>
            <p className="text-xs text-slate-600">Intelligence</p>
          </div>
        </div>

        {/* Three Node Circles */}
        {nodes.map((node) => {
          const pos = getNodePosition(node.angle);
          return (
            <div
              key={node.id}
              className="absolute liquid-premium-card rounded-full shadow-lg p-6 w-32 h-32 flex flex-col items-center justify-center text-center transition-transform duration-300 hover:-translate-y-1"
              style={{
                transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
                zIndex: 5,
              }}
            >
              <div className="relative z-1">
                <p className="text-sm font-semibold text-slate-900">{node.label}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
