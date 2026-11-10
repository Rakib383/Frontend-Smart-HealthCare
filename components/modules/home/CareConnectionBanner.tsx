import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ShieldCheck } from "lucide-react"

const CareConnectionBanner = () => (
  <section
    aria-labelledby="care-connection-title"
    className="px-3 py-14 sm:px-5 sm:py-16 lg:py-20"
  >
    <div className="relative mx-auto min-h-[26rem] max-w-[1600px] overflow-hidden rounded-3xl bg-emerald-950 sm:min-h-[30rem] lg:min-h-[34rem]">
      <picture className="absolute inset-0">
        <source
          media="(max-width: 767px)"
          srcSet="/images/care-connection-banner-mobile.png"
        />
        <Image
          src="/images/care-connection-banner.jpg"
          alt="A doctor and an older patient smiling together"
          fill
          sizes="(max-width: 767px) 100vw, (max-width: 1600px) 100vw, 1600px"
          className="object-cover object-[62%_center] md:object-center"
        />
      </picture>

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-transparent md:bg-gradient-to-r md:from-emerald-950/65 md:via-emerald-950/30 md:to-transparent"
      />

      <div className="relative z-10 flex min-h-[26rem] items-end px-5 py-7 sm:min-h-[30rem] sm:px-8 sm:py-9 md:items-center md:px-10 lg:min-h-[34rem] lg:px-14">
        <div className="max-w-2xl text-white">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-emerald-950/45 px-3 py-1.5 text-xs font-semibold tracking-wide text-emerald-50 backdrop-blur-sm">
            <ShieldCheck className="size-4 text-emerald-300" aria-hidden="true" />
            Your Health, Our Priority
          </div>
          <h2
            id="care-connection-title"
            className="mt-4 max-w-xl font-heading text-[1.65rem] font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl"
          >
            Better Care Begins with the Right Connection.
          </h2>
          <p className="mt-4 hidden max-w-xl text-base leading-7 text-white/95 sm:block sm:text-lg sm:leading-8">
            Connect with trusted doctors, book appointments with ease, and
            experience a smarter, more connected healthcare journey with
            Healora.
          </p>
          <Link
            href="/consultation"
            className="mt-6 inline-flex min-h-12 items-center justify-between gap-5 rounded-full bg-gradient-to-r from-emerald-700 to-emerald-500 py-1.5 pl-5 pr-1.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Find a Doctor
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-emerald-900">
              <ArrowRight className="size-4" aria-hidden="true" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  </section>
)

export default CareConnectionBanner
