import Link from "next/link"
import { ArrowRight, CalendarCheck2, ClipboardList, Stethoscope } from "lucide-react"

const steps = [
  {
    number: "01",
    title: "Explore your care options",
    description:
      "Browse doctors and services to find the support that fits your needs.",
    icon: Stethoscope,
  },
  {
    number: "02",
    title: "Choose a doctor",
    description:
      "Compare specialties and doctor profiles, then pick the right match for you.",
    icon: ClipboardList,
  },
  {
    number: "03",
    title: "Book your appointment",
    description:
      "Select an available time and keep your care plans organized in one place.",
    icon: CalendarCheck2,
  },
]

const Steps = () => (
  <section id="steps" className="scroll-mt-24 bg-white py-16 sm:py-20">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-teal-700">
          Easy from the start
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Care in three simple steps
        </h2>
        <p className="mt-4 text-base leading-7 text-slate-600">
          Get from searching for care to planning your visit without the extra
          hassle.
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {steps.map((step) => {
          const Icon = step.icon

          return (
            <article
              key={step.number}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:p-7"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="text-sm font-bold tracking-widest text-slate-300">
                  {step.number}
                </span>
              </div>
              <h3 className="mt-6 text-lg font-bold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
            </article>
          )
        })}
      </div>

      <div className="mt-9 text-center">
        <Link
          href="/consultation"
          className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 transition-colors hover:text-teal-900"
        >
          Start exploring doctors
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  </section>
)

export default Steps
