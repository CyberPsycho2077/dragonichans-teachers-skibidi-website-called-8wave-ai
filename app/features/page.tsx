import { Metadata } from "next";
import Container from "@/components/Container";
import Section from "@/components/Section";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Discover the powerful features of 8wave's AI-powered platform. Advanced automation, analytics, and integration capabilities.",
};

export default function FeaturesPage() {
  const features = [
    {
      title: "Intelligent Automation",
      description:
        "Automate complex workflows with AI-driven decision making. Reduce manual tasks and increase efficiency across your organization.",
      highlights: [
        "Smart workflow orchestration",
        "Adaptive learning algorithms",
        "Custom automation rules",
        "Real-time optimization",
      ],
    },
    {
      title: "Advanced Analytics",
      description:
        "Transform raw data into actionable insights with our powerful analytics engine. Make data-driven decisions with confidence.",
      highlights: [
        "Real-time data processing",
        "Predictive analytics",
        "Custom dashboards",
        "Export and reporting tools",
      ],
    },
    {
      title: "Seamless Integration",
      description:
        "Connect 8wave with your existing tools and platforms. Our flexible API and pre-built connectors make integration simple.",
      highlights: [
        "RESTful API",
        "Webhook support",
        "Pre-built integrations",
        "Custom connector development",
      ],
    },
    {
      title: "Enterprise Security",
      description:
        "Bank-level security to protect your data. Compliance with industry standards and best practices built-in.",
      highlights: [
        "End-to-end encryption",
        "SOC 2 Type II certified",
        "GDPR compliant",
        "Role-based access control",
      ],
    },
    {
      title: "Scalable Infrastructure",
      description:
        "Built to grow with your business. Handle increasing workloads without compromising performance or reliability.",
      highlights: [
        "Auto-scaling architecture",
        "99.9% uptime SLA",
        "Global CDN",
        "Load balancing",
      ],
    },
    {
      title: "24/7 Support",
      description:
        "Expert support when you need it. Our team is available around the clock to help you succeed.",
      highlights: [
        "24/7 technical support",
        "Dedicated account manager",
        "Onboarding assistance",
        "Training resources",
      ],
    },
  ];

  return (
    <>
      {/* Header */}
      <Section className="bg-gradient-to-b from-brand-50 to-white">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-5xl font-bold tracking-tight text-brand-900 sm:text-6xl">
              Powerful Features for Modern Business
            </h1>
            <p className="mt-6 text-lg leading-8 text-brand-600">
              Everything you need to transform your operations with AI. Explore our comprehensive
              suite of features designed to drive growth and innovation.
            </p>
          </div>
        </Container>
      </Section>

      {/* Features Grid */}
      <Section>
        <Container>
          <div className="grid gap-12 lg:gap-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className="grid gap-8 rounded-2xl border border-brand-200 bg-white p-8 shadow-soft lg:grid-cols-2 lg:p-12"
              >
                <div>
                  <h2 className="text-3xl font-bold text-brand-900">{feature.title}</h2>
                  <p className="mt-4 text-lg text-brand-600">{feature.description}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-900">
                    Key Capabilities
                  </h3>
                  <ul className="mt-4 space-y-3">
                    {feature.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start">
                        <svg
                          className="mr-3 h-6 w-6 flex-shrink-0 text-accent"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-brand-700">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
