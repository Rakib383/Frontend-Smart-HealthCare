import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight, Headphones, Star } from "lucide-react"

const heroContent = {
  rating: "4.5 Average Rating",
  reviews: "560 Reviews",
  headline: "Find Trusted Doctors.",
  headlineAccent: "Get Better Care.",
  description:
    "Doctors, appointments and an intelligent assistant, together in one place.",
  primaryAction: "Book an Appointment",
  secondaryAction: "Explore Service",
  supportTitle: "24/7 Support",
  supportCount: "50+",
  supportLabel: "Expert Consultant",
  consultants: ["DR", "AM", "JS"],
}

const Hero = () => (
  <section className="w-full px-3 pt-3 sm:px-5 lg:px-0 lg:pt-0">
    <div className="relative isolate w-full lg:aspect-[35/16]">
      <div className="relative">
        <picture>
          <source
            media="(max-width: 1023px)"
            srcSet="/images/consultation-hero-mobile.png"
          />
          <Image
            src="/images/consultation-hero.jpg"
            alt="A doctor consulting with a patient in a clinic"
            width={1680}
            height={768}
            priority
            sizes="100vw"
            className="block h-auto w-full rounded-[1.75rem] lg:rounded-none"
          />
        </picture>
        <aside className="absolute right-3 bottom-3 z-10 w-auto max-w-[8.75rem] rounded-xl bg-white/95 p-2 text-slate-950 shadow-lg backdrop-blur-sm sm:right-5 sm:bottom-5 lg:right-10 lg:bottom-16 lg:w-full lg:max-w-[18rem] lg:rounded-2xl lg:p-4 lg:shadow-xl">
          <div className="flex items-center gap-1.5 text-xs font-semibold lg:gap-2 lg:text-sm">
            <span className="flex size-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 lg:size-8">
              <Headphones className="size-3.5 lg:size-4" aria-hidden="true" />
            </span>
            {heroContent.supportTitle}
          </div>
          <div className="mt-1.5 flex items-center gap-2 rounded-lg bg-slate-50 p-1.5 lg:mt-3 lg:gap-3 lg:rounded-xl lg:p-3">
            <div aria-hidden="true" className="flex shrink-0 -space-x-2">
              {heroContent.consultants.map((consultant, index) => (
                <span
                  key={consultant}
                  className={`flex size-6 items-center justify-center rounded-full border-2 border-white text-[8px] font-semibold text-white lg:size-8 lg:text-[9px] ${
                    index === 0
                      ? "bg-sky-700"
                      : index === 1
                        ? "bg-emerald-700"
                        : "bg-slate-700"
                  }`}
                >
                  {consultant}
                </span>
              ))}
            </div>
            <p className="text-[10px] leading-3 lg:text-xs lg:leading-4">
              <span className="font-semibold">{heroContent.supportCount}</span>{" "}
              {heroContent.supportLabel}
            </p>
          </div>
        </aside>
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(10,28,27,0.66)_0%,rgba(10,28,27,0.42)_48%,transparent_78%),linear-gradient(0deg,rgba(10,28,27,0.62)_0%,rgba(10,28,27,0.28)_38%,transparent_76%)] lg:block"
      />
      <div className="bg-white p-5 text-slate-950 sm:p-8 lg:absolute lg:inset-0 lg:grid lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-end lg:gap-10 lg:bg-transparent lg:px-10 lg:pt-10 lg:pb-16 lg:text-white">
        <div className="max-w-3xl pb-1">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/90 px-3.5 py-2 text-xs font-medium text-slate-800 shadow-sm backdrop-blur sm:mb-6 sm:text-sm">
            <span className="flex size-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Star className="size-3 fill-current" aria-hidden="true" />
            </span>
            <span>{heroContent.rating}</span>
            <span aria-hidden="true" className="text-slate-400">•</span>
            <span className="font-semibold">{heroContent.reviews}</span>
          </div>

          <h1 className="font-heading text-[30px] font-bold leading-tight tracking-[-0.045em] sm:text-4xl lg:text-[clamp(2.65rem,7vw,4rem)] lg:leading-[1.03]">
            <span className="block">{heroContent.headline}</span>
            <span className="block">{heroContent.headlineAccent}</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7 lg:text-white/90">
            {heroContent.description}
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row">
            <Link
              href="/consultation"
              className="inline-flex min-h-12 w-full items-center justify-between gap-5 rounded-full bg-gradient-to-r from-emerald-700 to-emerald-500 py-1.5 pl-5 pr-1.5 text-sm font-medium text-white shadow-lg transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700 sm:w-auto"
            >
              {heroContent.primaryAction}
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-slate-900">
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </span>
            </Link>
            <Link
              href="/#steps"
              className="inline-flex min-h-12 w-full items-center justify-between gap-5 rounded-full bg-white py-1.5 pl-5 pr-1.5 text-sm font-medium text-slate-900 shadow-lg transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700 sm:w-auto"
            >
              {heroContent.secondaryAction}
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white">
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  </section>
)

export default Hero
