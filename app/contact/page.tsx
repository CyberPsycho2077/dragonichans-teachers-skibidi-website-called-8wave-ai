import { Metadata } from "next";
import Container from "@/components/Container";
import Section from "@/components/Section";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with 8wave. Book a demo, ask questions, or learn more about our AI-powered solutions.",
};

export default function ContactPage() {
  return (
    <>
      {/* Header */}
      <Section className="bg-gradient-to-b from-brand-50 to-white">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-5xl font-bold tracking-tight text-brand-900 sm:text-6xl">
              Get in Touch
            </h1>
            <p className="mt-6 text-lg leading-8 text-brand-600">
              Ready to transform your business with AI? We'd love to hear from you. Book a demo or
              reach out with any questions.
            </p>
          </div>
        </Container>
      </Section>

      {/* Contact Form */}
      <Section>
        <Container>
          <div className="mx-auto max-w-2xl">
            <div className="rounded-2xl border border-brand-200 bg-white p-8 shadow-soft lg:p-12">
              <form className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-brand-900">
                      First name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      className="mt-2 block w-full rounded-lg border border-brand-300 px-4 py-2.5 text-brand-900 placeholder-brand-400 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-20"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-brand-900">
                      Last name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      className="mt-2 block w-full rounded-lg border border-brand-300 px-4 py-2.5 text-brand-900 placeholder-brand-400 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-20"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-brand-900">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="mt-2 block w-full rounded-lg border border-brand-300 px-4 py-2.5 text-brand-900 placeholder-brand-400 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-20"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-brand-900">
                    Company
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    className="mt-2 block w-full rounded-lg border border-brand-300 px-4 py-2.5 text-brand-900 placeholder-brand-400 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-20"
                    placeholder="Acme Inc."
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-brand-900">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    className="mt-2 block w-full rounded-lg border border-brand-300 px-4 py-2.5 text-brand-900 placeholder-brand-400 transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-opacity-20"
                    placeholder="Tell us about your project..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-accent px-6 py-3 text-base font-semibold text-white shadow-soft transition-all hover:bg-blue-600 hover:shadow-soft-lg"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="mt-12 text-center">
              <h2 className="text-2xl font-bold text-brand-900">Other Ways to Reach Us</h2>
              <div className="mt-6 space-y-3">
                <p className="text-brand-600">
                  Email:{" "}
                  <a
                    href="mailto:hello@8wave.ai"
                    className="font-medium text-accent hover:underline"
                  >
                    hello@8wave.ai
                  </a>
                </p>
                <p className="text-brand-600">
                  We typically respond within 24 hours during business days.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
