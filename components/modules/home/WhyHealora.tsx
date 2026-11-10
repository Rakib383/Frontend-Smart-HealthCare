"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import {
  ArrowRight,
  ChevronDown,
  HeartHandshake,
  Lightbulb,
  Target,
} from "lucide-react"

const principles = [
  {
    title: "Our Vision",
    heading: "A Healthier Future Through Smarter Healthcare",
    description:
      "We envision a future where everyone can access quality healthcare without unnecessary complexity. Through innovation and connected healthcare services, we aim to make better care more accessible to all.",
    icon: Lightbulb,
    image: "/images/why-healora-team.jpg",
    imageAlt: "A team of healthcare professionals",
  },
  {
    title: "Our Mission",
    heading: "Making Healthcare Simple and Accessible",
    description:
      "Our mission is to simplify the healthcare journey by connecting patients with trusted doctors, streamlining appointments, and providing intelligent assistance when it matters.",
    icon: Target,
    image: "/images/why-healora-family.jpg",
    imageAlt: "A mother and child visiting a healthcare professional",
  },
  {
    title: "Our Commitment",
    heading: "Putting People at the Heart of Healthcare",
    description:
      "We are committed to creating a secure, reliable, and user-friendly healthcare experience. Every feature we build is designed to support patients, empower healthcare professionals, and make healthcare management easier.",
    icon: HeartHandshake,
    image: "/images/why-healora-care.jpg",
    imageAlt: "A doctor listening to and caring for an older patient",
  },
]

const WhyHealora = () => {
  const [activePrinciple, setActivePrinciple] = useState(0)
  const [isTabsPaused, setIsTabsPaused] = useState(false)

  useEffect(() => {
    if (isTabsPaused) return

    const intervalId = window.setInterval(() => {
      setActivePrinciple((current) => (current + 1) % principles.length)
    }, 5000)

    return () => window.clearInterval(intervalId)
  }, [isTabsPaused])

  return (
    <section
      id="why-healora"
      aria-labelledby="why-healora-title"
      className="scroll-mt-24 bg-white px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-5"
    >
      <div className="mx-auto grid max-w-[1600px] gap-8 rounded-2xl bg-[#e8f7f1] p-5 sm:gap-10 sm:p-8 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1fr)] lg:items-center lg:gap-10 lg:p-10 xl:gap-14 xl:p-12">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-800">
            Why Healora
          </p>
          <h2
            id="why-healora-title"
            className="mt-2 font-heading text-[28px] font-extrabold leading-tight tracking-tight text-slate-950 sm:text-4xl"
          >
            Building a Healthier Future, Together.
          </h2>
          <p className="mt-3 text-[15px] leading-7 text-slate-700 sm:text-base">
            At Healora, we believe healthcare should be accessible, connected,
            and centered around people. We&apos;re bringing patients, doctors,
            and intelligent technology together to create a simpler and more
            convenient healthcare experience.
          </p>

          <div
            className="mt-5 space-y-2"
            aria-label="Our values"
            onMouseEnter={() => setIsTabsPaused(true)}
            onMouseLeave={() => setIsTabsPaused(false)}
            onFocusCapture={() => setIsTabsPaused(true)}
            onBlurCapture={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setIsTabsPaused(false)
              }
            }}
          >
            {principles.map((principle, index) => {
              const isActive = activePrinciple === index
              const Icon = principle.icon

              return (
                <article
                  key={principle.title}
                  className={`overflow-hidden rounded-xl transition-colors ${
                    isActive
                      ? "bg-gradient-to-br from-emerald-300 via-emerald-500 to-emerald-800 text-white"
                      : "bg-white text-slate-950 shadow-sm"
                  }`}
                >
                  <h3>
                    <button
                      type="button"
                      aria-expanded={isActive}
                      aria-controls={`why-healora-panel-${index}`}
                      onClick={() => setActivePrinciple(index)}
                      className="flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3 text-left text-base font-semibold focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-emerald-800"
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <Icon className="size-4 shrink-0" aria-hidden="true" />
                        <span className="truncate">{principle.title}</span>
                      </span>
                      <ChevronDown
                        className={`size-4 shrink-0 transition-transform ${
                          isActive ? "rotate-180" : ""
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  </h3>
                  {isActive ? (
                    <div
                      id={`why-healora-panel-${index}`}
                      className="px-4 pb-4 pl-[2.875rem]"
                    >
                      <p className="text-base font-semibold leading-6 text-white">
                        {principle.heading}
                      </p>
                      <p className="mt-1.5 text-[15px] leading-6 text-white/95 sm:text-base">
                        {principle.description}
                      </p>
                    </div>
                  ) : null}
                </article>
              )
            })}
          </div>

          <div className="mt-5 border-t border-emerald-900/10 pt-4">
            <h3 className="font-heading text-lg font-bold text-slate-950">
              Ready to Experience Better Healthcare?
            </h3>
            <p className="mt-1 text-base leading-6 text-slate-700">
              Take control of your healthcare journey with Healora. Discover
              doctors and manage appointments in one place.
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-3 min-[420px]:flex-row">
            <Link
              href="/#steps"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-700 to-emerald-500 px-4 text-sm font-semibold text-white transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
            >
              Explore Healora
              <span className="flex size-7 items-center justify-center rounded-full bg-white text-emerald-900">
                <ArrowRight className="size-4" aria-hidden="true" />
              </span>
            </Link>
            <Link
              href="/consultation"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-emerald-800 px-5 text-sm font-semibold text-emerald-950 transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
            >
              Find a Doctor
            </Link>
          </div>
        </div>

        <div className="relative min-h-64 overflow-hidden rounded-2xl sm:min-h-80 lg:min-h-0 lg:aspect-[1/1.03]">
          {principles.map((principle, index) => (
            <Image
              key={principle.image}
              src={principle.image}
              alt={principle.imageAlt}
              fill
              priority={index === 0}
              sizes="(max-width: 1023px) 100vw, 50vw"
              className={`object-cover object-center transition-opacity duration-700 ease-in-out motion-reduce:transition-none ${
                activePrinciple === index ? "opacity-100" : "opacity-0"
              }`}
              aria-hidden={activePrinciple !== index}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default WhyHealora
