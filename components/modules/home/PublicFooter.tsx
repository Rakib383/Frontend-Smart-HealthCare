import Link from "next/link"
import Image from "next/image"
import { MapPin, Phone } from "lucide-react"

const footerLinkClass =
  "transition-colors hover:text-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"

const PublicFooter = () => (
  <footer id="footer" className="border-t border-slate-200 bg-white text-slate-600">
    <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-[1.5fr_0.8fr_0.8fr_1.2fr]">
        <div className="max-w-sm">
          <Link href="/" className="inline-flex items-center">
            <Image
              src="/images/healora-logo.png"
              alt="Healora"
              width={200}
              height={53}
              className="h-auto w-40 sm:w-48"
            />
          </Link>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            Making it easier to find care, connect with doctors, and take the
            next step in your health journey.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-950">Explore</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li><Link href="/#steps" className={footerLinkClass}>How it works</Link></li>
            <li><Link href="/#doctors" className={footerLinkClass}>Top doctors</Link></li>
            <li><Link href="/consultation" className={footerLinkClass}>Consultation</Link></li>
            <li><Link href="/diagnostics" className={footerLinkClass}>Diagnostics</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-950">Policies</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li><Link href="/privacy-policy" className={footerLinkClass}>Privacy Policy</Link></li>
            <li><Link href="/terms-of-service" className={footerLinkClass}>Terms of Service</Link></li>
            <li><Link href="/cookie-policy" className={footerLinkClass}>Cookie Policy</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-950">Contact &amp; Address</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a href="tel:12345678" className={`inline-flex items-start gap-2 ${footerLinkClass}`}>
                <Phone className="mt-0.5 size-4 shrink-0 text-emerald-800" aria-hidden="true" />
                <span>12345678</span>
              </a>
            </li>
            <li className="flex items-start gap-2 leading-6">
              <MapPin className="mt-1 size-4 shrink-0 text-emerald-800" aria-hidden="true" />
              <address className="not-italic">
                House 42, Road 7, Dhanmondi,
                <br />
                Dhaka 1205, Bangladesh
              </address>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-10 border-t border-slate-200 pt-6 text-xs text-slate-500">
        © {new Date().getFullYear()} Healora. All rights reserved.
      </div>
    </div>
  </footer>
)

export default PublicFooter
