import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Menu } from "lucide-react"
import { getDefaultDashboardRoute } from "@/lib/authUtils"
import { getUserInfo } from "@/services/auth.services"
import LogoutButton from "@/components/modules/Auth/LogoutButton"

const navigationLinks = [
  { label: "Home", href: "/" },
  { label: "How it works", href: "/#steps" },
  { label: "Doctors", href: "/#doctors" },
  { label: "Diagnostics", href: "/diagnostics" },
]

const PublicNavbar = async () => {
  const userInfo = await getUserInfo()
  const dashboardPath = userInfo ? getDefaultDashboardRoute(userInfo.role) : null

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center" aria-label="Healora home">
          <Image
            src="/images/healora-logo.png"
            alt=""
            width={200}
            height={53}
            priority
            className="h-auto w-40 sm:w-48"
          />
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-7 md:flex">
          {navigationLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-semibold text-[#142b4a] transition-colors hover:text-teal-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {dashboardPath ? (
            <>
              <Link
                href={dashboardPath}
                className="rounded-lg px-4 py-2.5 text-sm font-semibold text-[#142b4a] transition-colors hover:bg-slate-100"
              >
                Dashboard
              </Link>
              <LogoutButton className="border-[#142b4a] text-[#142b4a] hover:bg-slate-100" />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-4 py-2.5 text-sm font-semibold text-[#142b4a] transition-colors hover:bg-slate-100"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-800"
              >
                Get started
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </>
          )}
        </div>

        <details className="group relative md:hidden">
          <summary
            aria-label="Open navigation menu"
            className="flex size-10 cursor-pointer list-none items-center justify-center rounded-lg border border-slate-200 text-[#142b4a] transition-colors hover:bg-slate-50 [&::-webkit-details-marker]:hidden"
          >
            <Menu className="size-5" aria-hidden="true" />
          </summary>
          <nav
            aria-label="Mobile navigation"
            className="absolute right-0 top-12 z-50 w-64 rounded-xl border border-slate-200 bg-white p-3 shadow-xl"
          >
            <div className="flex flex-col">
              {navigationLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="rounded-lg px-3 py-2.5 text-sm font-semibold text-[#142b4a] hover:bg-teal-50 hover:text-teal-800"
                >
                  {link.label}
                </Link>
              ))}
              <div className="my-2 border-t border-slate-100" />
              {dashboardPath ? (
                <>
                  <Link
                    href={dashboardPath}
                    className="rounded-lg px-3 py-2.5 text-sm font-semibold text-[#142b4a] hover:bg-slate-50"
                  >
                    Dashboard
                  </Link>
                  <LogoutButton className="mt-1 w-full justify-center border-[#142b4a] text-[#142b4a] hover:bg-slate-100" />
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="rounded-lg px-3 py-2.5 text-sm font-semibold text-[#142b4a] hover:bg-slate-50"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    className="mt-1 rounded-lg bg-teal-700 px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-teal-800"
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          </nav>
        </details>
      </div>
    </header>
  )
}

export default PublicNavbar
