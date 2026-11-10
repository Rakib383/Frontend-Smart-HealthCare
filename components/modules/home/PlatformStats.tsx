"use client"

import { useEffect, useRef, useState } from "react"
import {
  Bot,
  CalendarCheck2,
  Stethoscope,
  Tags,
} from "lucide-react"

const stats = [
  {
    value: 250,
    suffix: "+",
    label: "Verified Doctors",
    icon: Stethoscope,
  },
  {
    value: 30,
    suffix: "+",
    label: "Medical Specialties",
    icon: Tags,
  },
  {
    value: 5000,
    suffix: "+",
    label: "Appointments Booked",
    icon: CalendarCheck2,
  },
  {
    value: 24,
    suffix: "/7",
    label: "AI Assistance",
    icon: Bot,
  },
]

const animationDuration = 1600

const PlatformStats = () => {
  const sectionRef = useRef<HTMLElement>(null)
  const [hasStarted, setHasStarted] = useState(false)
  const [selectedStat, setSelectedStat] = useState<number | null>(null)
  const [counts, setCounts] = useState(() => stats.map(() => 0))

  useEffect(() => {
    const section = sectionRef.current
    if (!section || hasStarted) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true)
          observer.disconnect()
        }
      },
      { threshold: 0.25 },
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [hasStarted])

  useEffect(() => {
    if (!hasStarted) return

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches

    if (prefersReducedMotion) {
      const frameId = window.requestAnimationFrame(() => {
        setCounts(stats.map((stat) => stat.value))
      })
      return () => window.cancelAnimationFrame(frameId)
    }

    let frameId = 0
    let startTime: number | undefined

    const animateCounts = (timestamp: number) => {
      startTime ??= timestamp
      const progress = Math.min((timestamp - startTime) / animationDuration, 1)
      const easedProgress = 1 - (1 - progress) ** 4

      setCounts(
        stats.map((stat) => Math.round(stat.value * easedProgress)),
      )

      if (progress < 1) {
        frameId = window.requestAnimationFrame(animateCounts)
      }
    }

    frameId = window.requestAnimationFrame(animateCounts)
    return () => window.cancelAnimationFrame(frameId)
  }, [hasStarted])

  return (
    <section
      ref={sectionRef}
      aria-label="Healora platform statistics"
      className="bg-white px-4 pt-14 pb-3 sm:px-6 sm:pt-18 sm:pb-4 lg:px-8 lg:pt-20 lg:pb-5"
    >
      <div className="mx-auto max-w-[1600px]">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 items-stretch gap-3 sm:grid-cols-4 sm:gap-4 lg:gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon

            return (
              <div
                key={stat.label}
                role="button"
                tabIndex={0}
                aria-label={`${stat.label}: ${counts[index]}${stat.suffix}`}
                aria-pressed={selectedStat === index}
                onClick={() => setSelectedStat(index)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    setSelectedStat(index)
                  }
                }}
                className={`group relative isolate flex min-h-36 cursor-pointer flex-col items-start justify-between overflow-hidden rounded-2xl border p-4 shadow-sm transition-colors duration-300 before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.3),transparent_58%)] before:opacity-0 before:transition-opacity before:duration-300 hover:border-emerald-800 hover:bg-emerald-800 hover:text-white hover:before:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 sm:min-h-40 sm:p-4 lg:min-h-44 lg:p-6 ${
                  selectedStat === index
                    ? "border-emerald-800 bg-emerald-800 text-white before:opacity-100"
                    : "border-emerald-900/10 bg-white text-slate-950"
                }`}
              >
                <span
                  className={`relative z-10 flex size-9 items-center justify-center rounded-lg transition-colors duration-300 group-hover:bg-white/15 group-hover:text-white sm:size-10 ${
                    selectedStat === index
                      ? "bg-white/15 text-white"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  <Icon className="size-4 sm:size-[1.125rem]" aria-hidden="true" />
                </span>
                <div className="relative z-10 mt-5">
                  <dd
                    className="font-heading text-2xl font-extrabold leading-none tracking-tight transition-colors duration-300 group-hover:text-white sm:text-3xl lg:text-4xl"
                  >
                    <span aria-live="off">
                      {stat.label === "Appointments Booked"
                        ? counts[index].toLocaleString("en-US")
                        : counts[index]}
                      {stat.suffix}
                    </span>
                  </dd>
                  <dt
                    className={`mt-2 text-xs font-medium transition-colors duration-300 group-hover:text-emerald-50 sm:text-sm ${
                      selectedStat === index
                        ? "text-emerald-50"
                        : "text-slate-700"
                    }`}
                  >
                    {stat.label}
                  </dt>
                </div>
              </div>
            )
          })}
        </dl>
      </div>
    </section>
  )
}

export default PlatformStats
