export default function TeamSection() {
  const teamMembers = [
    {
      id: "jukka",
      name: "Jukka Remes",
      title: "CTO",
      description: "Dr Tech, Computer Science, R&D leader, Expert SW Dev, AI/MLOps & regulatory",
      imagePlaceholder: "JR",
    },
    {
      id: "tiina",
      name: "Tiina Lappalainen",
      title: "CEO Finland",
      description: "20+ years of tech entrepreneur & C-level exec roles across Europe, Asia & the US",
      imagePlaceholder: "TL",
    },
    {
      id: "eyo",
      name: "Eyo Eyoma",
      title: "CEO Sweden",
      description: "Tech exec & entrepreneur - builder of innovative products & thriving teams for 20+ yrs",
      imagePlaceholder: "EE",
    },
    {
      id: "ana",
      name: "Ana Paula Gonzalez Torres",
      title: "AI Risk and Regulation Specialist, AI Standards Specialist",
      description: "Doctoral researcher",
      imagePlaceholder: "AG",
    },
  ];

  const regulations = [
    {
      category: "AI Regulations & Standards",
      items: [
        "EU AI Act",
        "ISO and ETSI AI standards",
        "Harmonized European AI standards",
      ],
    },
    {
      category: "Medical regulations",
      items: [
        "MDR (Medical Device Regulation)",
        "IVDR (In Vitro Diagnostic Regulation)",
        "HIPAA (Health Insurance Portability and Accountability Act)",
      ],
    },
    {
      category: "Data Protection & Information Security",
      items: [
        "GDPR (General Data Protection Regulation)",
        "ISO 27001 (Information Security Management)",
        "TISAX (Trusted Information Security Assessment Exchange)",
      ],
    },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-slate-50 py-24">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header with Icon */}
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <svg
              className="h-8 w-8 text-slate-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
              />
            </svg>
          </div>

          <p className="mx-auto max-w-3xl text-xl leading-relaxed text-slate-700 sm:text-2xl">
            8wave is founded by seasoned tech and business leaders from Silo AI, Futurice, Ericsson, IBM and Nokia
          </p>
        </div>

        {/* Team Members Grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="rounded-2xl bg-gradient-to-br from-cyan-50 to-blue-50 p-6 text-center transition-transform hover:-translate-y-1"
            >
              {/* Profile Image Placeholder */}
              <div className="mx-auto mb-6 h-32 w-32 overflow-hidden rounded-full bg-gradient-to-br from-slate-300 to-slate-400">
                <div className="flex h-full w-full items-center justify-center text-3xl font-semibold text-white">
                  {member.imagePlaceholder}
                </div>
              </div>

              {/* Name */}
              <h3 className="text-lg font-semibold text-slate-900">
                {member.name}
              </h3>

              {/* Title */}
              <p className="mt-1 text-sm font-medium text-slate-700">
                {member.title}
              </p>

              {/* Description */}
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {member.description}
              </p>
            </div>
          ))}
        </div>

        {/* Regulations Section */}
        <div className="mt-20">
          <div className="text-center">
            <p className="text-xl font-medium text-slate-800">
              Our team has extensive experience with a wide range of regulations and standards.
            </p>
            <p className="mt-2 text-lg text-slate-600">
              We are familiar with:
            </p>
          </div>

          {/* Regulations Grid */}
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {regulations.map((regulationGroup, index) => (
              <div
                key={index}
                className="rounded-xl bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm ring-1 ring-slate-200/60"
              >
                {/* Category Header with Checkmark */}
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                    <svg
                      className="h-4 w-4 text-green-600"
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
                  <h4 className="text-base font-semibold text-slate-800">
                    {regulationGroup.category}
                  </h4>
                </div>

                {/* Regulation Items */}
                <ul className="space-y-3">
                  {regulationGroup.items.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-slate-600"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
