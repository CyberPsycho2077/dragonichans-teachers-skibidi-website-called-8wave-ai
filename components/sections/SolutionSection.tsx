import Link from "next/link";

export default function SolutionSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-slate-100 py-24">
      <div className="relative mx-auto max-w-4xl px-6 lg:px-8">
        <div className="text-center">
          {/* Green Checkmark Icon */}
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Main Text */}
          <p className="mx-auto max-w-3xl text-2xl leading-relaxed text-slate-700 sm:text-3xl sm:leading-relaxed">
            Our software easily integrates with existing tool chains & puts you in
            control. It allows you to get AI delivering true business value rapidly into
            production, with clear proof of regulatory adherence.
          </p>

          {/* Logo Box */}
          <div className="mx-auto mt-12 flex h-[200px] w-[200px] items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 shadow-xl">
            <svg
              className="h-20 w-20 text-white"
              viewBox="0 0 100 40"
              fill="currentColor"
            >
              {/* Infinity symbol */}
              <path d="M20,20 C20,12 12,8 8,12 C4,16 8,20 12,20 C16,20 20,16 20,20 C20,24 16,28 12,28 C8,32 4,28 8,24 C12,20 20,24 20,20 Z" />
              <path d="M20,20 C20,16 24,12 28,12 C32,12 36,16 32,20 C28,24 20,20 20,20 C20,20 28,24 32,28 C36,32 32,36 28,36 C24,36 20,32 20,28 C20,24 24,20 20,20 Z" transform="translate(60, 0)" />
              <text x="42" y="32" fontSize="18" fontWeight="600" textAnchor="middle" fill="currentColor">∞</text>
            </svg>
          </div>

          {/* CTA Button */}
          <div className="mt-12">
            <Link
              href="/contact"
              className="inline-block rounded-full bg-slate-900 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-slate-800 hover:shadow-xl"
            >
              Book a Demo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
