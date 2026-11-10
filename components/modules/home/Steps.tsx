"use client"

import { useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  CalendarCheck2,
  ClipboardList,
  Stethoscope,
} from "lucide-react"

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

const Steps = () => {
  const [activeStep, setActiveStep] = useState(0)

  return (
    <section
      id="steps"
      className="scroll-mt-24 bg-white py-12 sm:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-800">
            Easy from the start
          </p>
          <h2 className="mt-3 font-heading text-[28px] font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            Care in three simple steps
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600">
            Get from searching for care to planning your visit without the extra
            hassle.
          </p>
        </div>

        <div
          className="mt-8 overflow-hidden sm:mt-10 md:hidden"
          aria-label="Steps to get care"
        >
          <div
            className="flex transition-transform duration-500 ease-out motion-reduce:transition-none"
            style={{ transform: `translateX(-${activeStep * 100}%)` }}
          >
            {steps.map((step, index) => {
              const Icon = step.icon

              return (
                <article
                  key={step.number}
                  aria-hidden={activeStep !== index}
                  className="w-full shrink-0 rounded-2xl border border-emerald-100 bg-[#f6fbf8] p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <span className="flex size-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="font-heading text-5xl font-extrabold leading-none tracking-tight text-emerald-800/20">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="mt-6 font-heading text-xl font-bold text-slate-950">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-base leading-7 text-slate-700">
                    {step.description}
                  </p>
                </article>
              )
            })}
          </div>
        </div>

        <div className="mt-8 hidden gap-5 md:grid md:grid-cols-3 lg:mt-10">
          {steps.map((step) => {
            const Icon = step.icon

            return (
              <article
                key={step.number}
                className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:p-7"
              >
                <div className="flex items-start justify-between">
                  <span className="flex size-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="font-heading text-5xl font-extrabold leading-none tracking-tight text-emerald-800/20">
                    {step.number}
                  </span>
                </div>
                <h3 className="mt-6 font-heading text-lg font-bold text-slate-950">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {step.description}
                </p>
              </article>
            )
          })}
        </div>

        <div className="mt-4 flex items-center justify-between md:hidden">
          <p className="text-sm font-semibold text-slate-700" aria-live="polite">
            <span className="text-emerald-800">
              {String(activeStep + 1).padStart(2, "0")}
            </span>{" "}
            / {String(steps.length).padStart(2, "0")}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              aria-label="Previous step"
              onClick={() => setActiveStep((current) => Math.max(0, current - 1))}
              disabled={activeStep === 0}
              className="flex size-10 items-center justify-center rounded-full border border-emerald-200 bg-white text-slate-950 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Next step"
              onClick={() =>
                setActiveStep((current) => Math.min(steps.length - 1, current + 1))
              }
              disabled={activeStep === steps.length - 1}
              className="flex size-10 items-center justify-center rounded-full bg-emerald-800 text-white transition-colors hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Steps
