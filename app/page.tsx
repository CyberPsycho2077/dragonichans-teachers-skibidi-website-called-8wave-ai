import Link from "next/link";
import Container from "@/components/Container";
import HeroBackground from "@/components/hero/HeroBackground";
import HowItWorksSection from "@/components/sections/HowItWorksSection";
import WhySection from "@/components/sections/WhySection";
import SolutionSection from "@/components/sections/SolutionSection";
import UniqueOfferingSection from "@/components/sections/UniqueOfferingSection";
import AILineageSection from "@/components/sections/AILineageSection";
import TeamSection from "@/components/sections/TeamSection";

export default function Home() {
  return (
    <>
      <section className="relative min-h-screen overflow-hidden">
        <HeroBackground />
        <Container className="relative z-10 flex min-h-screen items-center justify-center pb-16 pt-24 text-center sm:pt-28">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.4em] text-slate-500">
              Operational Intelligence
            </p>
            <h1 className="mt-6 text-5xl font-semibold leading-[1.05] text-slate-900 sm:text-6xl lg:text-7xl">
              Understand · Align · Optimise
            </h1>
            <p className="mt-6 text-lg text-slate-600 sm:text-xl">
              The software connecting all your AI activities.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(15,23,42,0.16)] transition-all duration-300 hover:bg-slate-800"
              >
                Book a Demo
              </Link>
              <Link
                href="/features"
                className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition-all duration-300 hover:border-slate-200 hover:bg-white/40"
              >
                Explore Features
              </Link>
            </div>
          </div>
        </Container>
      </section>
      
      <HowItWorksSection />
      
      <WhySection />
      
      <SolutionSection />
      
      <UniqueOfferingSection />
      
      <AILineageSection />
      
      <TeamSection />
    </>
  );
}
