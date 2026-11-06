import Link from "next/link"
import {
  ArrowRight,
  CalendarCheck2,
  Check,
  HeartPulse,
  ShieldCheck,
  Stethoscope,
} from "lucide-react"

const Hero = () => (
  <section className="relative isolate overflow-hidden bg-gradient-to-br from-teal-50 via-white to-cyan-50/70">
    <div
      aria-hidden="true"
      className="absolute -right-32 -top-32 -z-10 size-96 rounded-full bg-teal-100/60 blur-3xl"
    />
    <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8 lg:py-24">
      <div className="max-w-2xl">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-100 bg-white/80 px-3.5 py-2 text-sm font-semibold text-teal-800 shadow-sm">
          <HeartPulse className="size-4" aria-hidden="true" />
          Better care starts here
        </div>
        <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
          Your health, cared for{" "}
          <span className="text-teal-700">with confidence.</span>
        </h1>
        <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
          Find trusted doctors, book appointments, and manage your care in one
          simple place. Support that fits your life, whenever you need it.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/consultation"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-teal-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-800"
          >
            Find a doctor
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
          <Link
            href="/#steps"
            className="inline-flex min-h-12 items-center justify-center rounded-lg border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-teal-200 hover:bg-teal-50"
          >
            See how it works
          </Link>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-600">
          <span className="inline-flex items-center gap-2">
            <ShieldCheck className="size-4 text-teal-700" aria-hidden="true" />
            Care you can trust
          </span>
          <span className="inline-flex items-center gap-2">
            <Check className="size-4 text-teal-700" aria-hidden="true" />
            Simple appointment booking
          </span>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-lg">
        <div
          aria-hidden="true"
          className="absolute inset-8 rounded-[2.5rem] bg-teal-200/50 blur-2xl"
        />
        <div className="relative rounded-[2rem] border border-white bg-white/90 p-5 shadow-[0_24px_80px_-32px_rgba(15,118,110,0.35)] sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-teal-700">Your care, connected</p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                A healthier day starts with a plan.
              </h2>
            </div>
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 sm:size-14">
              <HeartPulse className="size-6 sm:size-7" aria-hidden="true" />
            </div>
          </div>

          <div className="mt-7 space-y-3">
            <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                <Stethoscope className="size-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">Find the right specialist</p>
                <p className="mt-1 text-sm text-slate-500">Explore doctors by specialty</p>
              </div>
              <ArrowRight className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
            </div>
            <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <CalendarCheck2 className="size-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-900">Plan your next visit</p>
                <p className="mt-1 text-sm text-slate-500">Book a time that works for you</p>
              </div>
              <ArrowRight className="size-4 shrink-0 text-slate-400" aria-hidden="true" />
            </div>
          </div>

          <div className="mt-5 rounded-2xl bg-teal-700 p-4 text-white sm:p-5">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-white/15">
                <ShieldCheck className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold">Your care journey, all in one place</p>
                <p className="mt-1 text-xs text-teal-100">Discover. Connect. Feel better.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
)

export default Hero
