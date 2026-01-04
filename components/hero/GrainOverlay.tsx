"use client";

type GrainOverlayProps = {
  className?: string;
};

export default function GrainOverlay({ className = "" }: GrainOverlayProps) {
  return <div className={`absolute inset-0 grain-overlay ${className}`} />;
}
