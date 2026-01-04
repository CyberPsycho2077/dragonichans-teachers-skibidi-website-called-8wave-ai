"use client";

import { useEffect, useRef } from "react";

declare global {
  var Container: any;
  var Button: any;
}

interface LiquidGlassHubProps {
  centerLabel?: string;
  centerSubLabel?: string;
  nodes: Array<{
    id: string;
    label: string;
  }>;
}

export default function LiquidGlassHub({
  centerLabel = "8wave AI",
  centerSubLabel = "Operational Intelligence",
  nodes,
}: LiquidGlassHubProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const instancesRef = useRef<any[]>([]);

  useEffect(() => {
    // Load scripts if not already loaded
    const loadScripts = async () => {
      if (typeof window !== "undefined" && !window.Container) {
        // Create script tags
        const container = document.createElement("script");
        container.src = "/lib/liquid-glass/container.js";
        const button = document.createElement("script");
        button.src = "/lib/liquid-glass/button.js";

        document.head.appendChild(container);
        document.head.appendChild(button);

        // Wait for scripts to load
        await new Promise((resolve) => {
          setTimeout(resolve, 100);
        });
      }

      // Create the center container
      if (window.Container && containerRef.current && instancesRef.current.length === 0) {
        const centerContainer = new window.Container({
          borderRadius: 50,
          type: "circle",
          tintOpacity: 0.25,
        });

        containerRef.current.appendChild(centerContainer.element);
        instancesRef.current.push(centerContainer);

        // Create nodes
        nodes.forEach((node) => {
          const btn = new window.Button({
            text: node.label,
            size: 20,
            type: "circle",
            tintOpacity: 0.2,
          });

          centerContainer.addChild(btn);
          instancesRef.current.push(btn);
        });
      }
    };

    loadScripts();

    return () => {
      // Cleanup if needed
    };
  }, [nodes]);

  return <div ref={containerRef} className="w-full flex justify-center py-12" />;
}
