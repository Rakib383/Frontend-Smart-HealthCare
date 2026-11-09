"use client"

import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ClipboardList,
  Info,
  RotateCw,
  Send,
  ShieldCheck,
  Stethoscope,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"

const benefits = [
  {
    title: "Specialty Routing Precision",
    description:
      "Maps non-specific symptoms to relevant clinical specialties and care teams.",
  },
  {
    title: "Automated Pre-Visit Intake",
    description:
      "Organizes symptom duration and medication history so your doctor has useful context.",
  },
  {
    title: "Clinical Guardrails",
    description:
      "Designed to avoid speculative diagnoses and encourage appropriate clinical review.",
  },
]

const AICareNavigation = () => {
  const sectionRef = useRef<HTMLElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const [isPreviewVisible, setIsPreviewVisible] = useState(false)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsPreviewVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  const openAssistant = () => {
    window.dispatchEvent(new Event("healora:open-assistant"))
  }

  return (
    <section
      ref={sectionRef}
      aria-labelledby="ai-care-navigation-title"
      className="overflow-hidden bg-[#e8f7f1] py-14 sm:py-18 lg:py-24"
    >
      <div className="mx-auto grid max-w-[1600px] items-center gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-14 lg:px-8">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-800">
            AI Care Navigation
          </p>
          <h2
            id="ai-care-navigation-title"
            className="mt-2 max-w-xl font-heading text-3xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-[2.75rem]"
          >
            Preparedness Before Every Consultation.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-700 sm:text-base sm:leading-7">
            Patients often face uncertainty deciding which specialty to book.
            Healix, our AI assistant, helps organize questions and symptoms
            into clear context to discuss with a physician.
          </p>

          <ul className="mt-6 space-y-4 sm:mt-7">
            {benefits.map((benefit) => (
              <li key={benefit.title} className="flex items-start gap-3">
                <CheckCircle2
                  className="mt-0.5 size-5 shrink-0 text-emerald-700"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-950 sm:text-base">
                    {benefit.title}
                  </h3>
                  <p className="mt-0.5 text-sm leading-5 text-slate-700">
                    {benefit.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={openAssistant}
            className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-lg bg-emerald-800 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
          >
            Try Healix Assistant
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div
          ref={previewRef}
          className={`mx-auto w-full max-w-[36rem] min-w-0 overflow-hidden rounded-2xl border border-emerald-950/10 bg-white shadow-xl shadow-emerald-950/10 transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none lg:justify-self-end ${
            isPreviewVisible
              ? "translate-x-0 opacity-100"
              : "translate-x-full opacity-0"
          } motion-reduce:translate-x-0 motion-reduce:opacity-100`}
        >
          <div className="flex min-h-14 items-center justify-between gap-3 bg-[#001c28] px-4 py-3 text-white sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-700">
                <Bot className="size-5" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  Healix
                </p>
                <p className="truncate text-[11px] text-sky-200">
                  Intelligence for Better Healthcare.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1 text-sky-100">
              <Info className="size-4" aria-hidden="true" />
              <RotateCw className="ml-1 size-4" aria-hidden="true" />
            </div>
          </div>

          <div className="space-y-4 px-3 py-5 sm:space-y-5 sm:px-5 sm:py-6">
            <div className="flex items-start justify-end gap-2">
              <div className="max-w-[88%] rounded-2xl rounded-tr-sm bg-[#e3f4ed] px-3.5 py-3 text-xs leading-5 text-slate-800 sm:px-4 sm:text-sm">
                I&apos;ve had a recurring dull ache in my left shoulder after
                playing tennis over the weekend. Who should I consult?
                <p className="mt-1.5 text-right text-[10px] text-slate-500">
                  10:42 AM
                </p>
              </div>
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-semibold text-emerald-900">
                You
              </span>
            </div>

            <div className="flex items-start gap-2">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl bg-emerald-700 text-white">
                <Bot className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm bg-[#e3f4ed] px-3.5 py-3.5 sm:px-4 sm:py-4">
                <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-800">
                  Triage pathway navigation
                </p>
                <p className="mt-1.5 text-xs leading-5 text-slate-800 sm:text-sm sm:leading-6">
                  Based on the activity and discomfort you described, an{" "}
                  <strong className="font-semibold text-slate-950">
                    orthopedic specialist
                  </strong>{" "}
                  may be a useful place to start. A clinician can assess your
                  symptoms and recommend next steps.
                </p>
                <div className="my-3 border-t border-emerald-900/10" />
                <p className="text-[11px] leading-5 text-slate-700 sm:text-xs">
                  Would you like to browse specialists, prepare a visit summary,
                  or check your coverage?
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-emerald-800 px-3 text-[10px] font-semibold text-white sm:text-[11px]">
                    <Stethoscope className="size-3.5" aria-hidden="true" />
                    Browse specialists
                  </span>
                  <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 text-[10px] font-semibold text-slate-800 sm:text-[11px]">
                    <ClipboardList className="size-3.5" aria-hidden="true" />
                    Prepare visit notes
                  </span>
                  <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 text-[10px] font-semibold text-slate-800 sm:text-[11px]">
                    <ShieldCheck className="size-3.5" aria-hidden="true" />
                    Check coverage
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-100 bg-[#f5faf8] px-3 py-3 sm:px-4">
            <div className="flex items-center gap-2">
              <div className="flex min-h-10 min-w-0 flex-1 items-center rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-400 sm:text-sm">
                Type a health question or symptom description...
              </div>
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-800 text-white">
                <Send className="size-4" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-2 text-center text-[9px] leading-4 text-slate-600 sm:text-[10px]">
              Healix offers health navigation and educational insights only.
              In emergencies, contact local emergency services.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AICareNavigation
