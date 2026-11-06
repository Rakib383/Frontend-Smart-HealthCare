import Link from "next/link"
import { HeartPulse } from "lucide-react"

const PublicFooter = () => (
  <footer id="footer" className="bg-slate-950 text-slate-300">
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm">
          <Link href="/" className="inline-flex items-center gap-2.5 text-white">
            <span className="flex size-10 items-center justify-center rounded-xl bg-teal-600">
              <HeartPulse className="size-5" aria-hidden="true" />
            </span>
            <span className="text-lg font-bold tracking-tight">
              Smart<span className="text-teal-400">HealthCare</span>
            </span>
          </Link>
          <p className="mt-4 text-sm leading-6 text-slate-400">
            Making it easier to find care, connect with doctors, and take the
            next step in your health journey.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-white">Explore</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li><Link href="/#steps" className="transition-colors hover:text-white">How it works</Link></li>
            <li><Link href="/#doctors" className="transition-colors hover:text-white">Top doctors</Link></li>
            <li><Link href="/consultation" className="transition-colors hover:text-white">Consultation</Link></li>
            <li><Link href="/diagnostics" className="transition-colors hover:text-white">Diagnostics</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-white">Your account</h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li><Link href="/login" className="transition-colors hover:text-white">Log in</Link></li>
            <li><Link href="/register" className="transition-colors hover:text-white">Create an account</Link></li>
          </ul>
        </div>
      </div>

      <div className="mt-10 border-t border-slate-800 pt-6 text-xs text-slate-500">
        © {new Date().getFullYear()} Smart HealthCare. All rights reserved.
      </div>
    </div>
  </footer>
)

export default PublicFooter
