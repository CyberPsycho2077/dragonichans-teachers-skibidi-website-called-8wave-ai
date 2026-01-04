"use client";

import GrainOverlay from "@/components/hero/GrainOverlay";
import HeroSceneCanvas from "@/components/hero/HeroSceneCanvas";

export default function HeroBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <HeroSceneCanvas className="z-0" />
      <GrainOverlay className="z-20" />
      <div className="absolute inset-0 z-[5] bg-gradient-to-b from-white/8 via-white/0 to-white/12" />
    </div>
  );
}
