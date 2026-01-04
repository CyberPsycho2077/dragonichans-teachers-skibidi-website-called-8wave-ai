import Link from "next/link";
import Container from "./Container";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-brand-200 bg-white">
      <Container>
        <div className="py-12">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Brand */}
            <div>
              <Link href="/" className="text-xl font-bold text-brand-900">
                8wave
              </Link>
              <p className="mt-2 text-sm text-brand-600">
                Building the future of AI-powered solutions.
              </p>
            </div>

            {/* Links */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-brand-900">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/"
                    className="text-sm text-brand-600 transition-colors hover:text-brand-900"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/features"
                    className="text-sm text-brand-600 transition-colors hover:text-brand-900"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-sm text-brand-600 transition-colors hover:text-brand-900"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-brand-900">Contact</h3>
              <p className="text-sm text-brand-600">
                <a
                  href="mailto:hello@8wave.ai"
                  className="transition-colors hover:text-brand-900"
                >
                  hello@8wave.ai
                </a>
              </p>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-8 border-t border-brand-200 pt-8">
            <p className="text-center text-sm text-brand-600">
              &copy; {currentYear} 8wave. All rights reserved.
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
