"use client"

import Image from "next/image"
import Link from "next/link"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Star,
} from "lucide-react"
import { getDoctors } from "@/services/doctor.services"
import type { IDoctor } from "@/types/doctor.types"

const pageSize = 12
const allSpecialists = "All Specialists"
const doctorPlaceholder = "/images/doctor-placeholder.svg"
const emptyDoctors: IDoctor[] = []

const getSpecialties = (doctor: IDoctor) =>
  (doctor.specialties ?? [])
    .flatMap((entry) => {
      if (typeof entry === "string") return entry.trim() ? [entry.trim()] : []

      const specialty = entry.specialty
      const title =
        entry.title ??
        entry.specialtyName ??
        entry.name ??
        (typeof specialty === "object" ? specialty?.title : specialty)

      return typeof title === "string" && title.trim() ? [title.trim()] : []
    })

const formatFee = (fee: number) =>
  Number.isFinite(fee)
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(fee)
    : "Ask for fee"

const DoctorPhoto = ({ name, src }: { name: string; src?: string }) => {
  const [hasError, setHasError] = useState(false)

  return (
      <Image
        src={hasError ? doctorPlaceholder : src?.trim() || doctorPlaceholder}
        alt={`${name} profile`}
        fill
        sizes="(max-width: 640px) 80px, 88px"
        className="object-cover object-center"
        style={{ objectFit: "cover", objectPosition: "center" }}
        unoptimized
        onError={() => setHasError(true)}
      />
  )
}

const DoctorCard = ({ doctor }: { doctor: IDoctor }) => {
  const specialties = getSpecialties(doctor).slice(0, 2)
  const rating = Number.isFinite(doctor.averageRating)
    ? doctor.averageRating.toFixed(2)
    : "New"
  const profileHref = `/consultation/doctor/${encodeURIComponent(doctor.id)}`

  return (
    <article className="flex h-full flex-col rounded-xl border border-emerald-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-lg sm:p-5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative aspect-square w-20 shrink-0 overflow-hidden rounded-lg bg-emerald-50 sm:w-[5.5rem]">
          <DoctorPhoto
            key={doctor.profilePhoto || doctor.id}
            name={doctor.name}
            src={doctor.profilePhoto}
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-1 font-heading text-base font-bold text-slate-950 sm:text-lg">
            {doctor.name}
          </h3>
          <p className="mt-1 w-fit max-w-full whitespace-normal break-words rounded-sm bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-950">
            {specialties[0] && specialties[0] !== doctor.designation
              ? `${specialties[0]}${doctor.designation ? ` · ${doctor.designation}` : ""}`
              : doctor.designation || specialties[0] || "Clinical specialist"}
          </p>
          <p className="mt-1.5 flex min-w-0 items-center gap-1 text-xs font-medium text-slate-700">
            <MapPin className="size-3.5 shrink-0 text-emerald-800" aria-hidden="true" />
            <span className="line-clamp-1">
              {doctor.currentWorkingPlace || "Practice location not listed"}
            </span>
          </p>
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-3 divide-x divide-emerald-100 rounded-lg bg-emerald-50/80 py-2.5 text-center">
        <div className="px-1">
          <dt className="text-[11px] font-medium text-slate-700">Years exp.</dt>
          <dd className="mt-0.5 font-heading text-lg font-semibold text-slate-950">
            {doctor.experience != null ? `${doctor.experience}+` : "—"}
          </dd>
        </div>
        <div className="px-1">
          <dt className="text-[11px] font-medium text-slate-700">Rating</dt>
          <dd className="mt-0.5 flex items-center justify-center gap-1 font-heading text-lg font-semibold text-emerald-800">
            <Star className="size-3.5 fill-emerald-600 text-emerald-600" aria-hidden="true" />
            {rating}
          </dd>
        </div>
        <div className="min-w-0 px-1">
          <dt className="text-[11px] font-medium text-slate-700">Consultation</dt>
          <dd className="mt-0.5 truncate font-heading text-lg font-semibold text-slate-950">
            {formatFee(doctor.appointmentFee)}
          </dd>
        </div>
      </dl>

      <p className="mt-3 min-h-10 flex-1 line-clamp-3 text-sm leading-5 text-slate-700">
        {doctor.qualification ? `${doctor.qualification}. ` : ""}
        {specialties.length > 0
          ? `Focuses on ${specialties.join(" and ")}.`
          : doctor.designation
            ? `Practices as a ${doctor.designation}.`
            : "View the doctor profile for more information."}
        {doctor.experience != null
          ? ` ${doctor.experience} years of experience.`
          : ""}
      </p>

      <div className="mt-3">
        <Link
          href={profileHref}
          className="inline-flex min-h-10 w-full items-center justify-center rounded-lg bg-emerald-800 px-3 text-xs font-semibold text-white transition-colors hover:bg-emerald-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800"
        >
          View Profile
        </Link>
      </div>
    </article>
  )
}

const TopDoctors = () => {
  const doctorsQuery = useInfiniteQuery({
    queryKey: ["doctors", "home-featured"],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getDoctors(
        `page=${pageParam}&limit=${pageSize}&sortBy=averageRating&sortOrder=desc`,
      ),
    getNextPageParam: (lastPage) =>
      lastPage.meta && lastPage.meta.page < lastPage.meta.totalPages
        ? lastPage.meta.page + 1
        : undefined,
  })
  const carouselRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const { fetchNextPage, hasNextPage, isFetchingNextPage } = doctorsQuery
  const [selectedSpecialty, setSelectedSpecialty] = useState(allSpecialists)
  const [canScrollBackward, setCanScrollBackward] = useState(false)
  const [canScrollForward, setCanScrollForward] = useState(false)
  const [isAutoPaused, setIsAutoPaused] = useState(false)

  const doctors = useMemo(
    () => doctorsQuery.data?.pages.flatMap((page) => page.data) ?? emptyDoctors,
    [doctorsQuery.data],
  )
  const specialties = useMemo(
    () =>
      [...new Set(doctors.flatMap(getSpecialties))]
        .sort((a, b) => a.localeCompare(b))
        .slice(0, 4),
    [doctors],
  )
  const filteredDoctors = useMemo(
    () =>
      selectedSpecialty === allSpecialists
        ? doctors
        : doctors.filter((doctor) =>
            getSpecialties(doctor).includes(selectedSpecialty),
          ),
    [doctors, selectedSpecialty],
  )

  const updateScrollControls = useCallback(() => {
    const carousel = carouselRef.current
    if (!carousel) return

    setCanScrollBackward(carousel.scrollLeft > 1)
    setCanScrollForward(
      carousel.scrollLeft + carousel.clientWidth < carousel.scrollWidth - 1,
    )
  }, [])

  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return

    carousel.scrollTo({ left: 0 })
    updateScrollControls()

    const resizeObserver = new ResizeObserver(updateScrollControls)
    resizeObserver.observe(carousel)
    return () => resizeObserver.disconnect()
  }, [filteredDoctors, updateScrollControls])

  useEffect(() => {
    const section = sectionRef.current
    const carousel = carouselRef.current
    if (!section || !carousel || isAutoPaused) return

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
    if (reducedMotion) return

    let isVisible = false
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting
      },
      { threshold: 0.2 },
    )
    observer.observe(section)

    const intervalId = window.setInterval(async () => {
      const currentCarousel = carouselRef.current
      if (!isVisible || !currentCarousel || isFetchingNextPage) {
        return
      }

      const firstCard =
        currentCarousel.querySelector<HTMLElement>("[data-doctor-card]")
      const gap =
        Number.parseFloat(getComputedStyle(currentCarousel).columnGap) || 0
      const distance = firstCard
        ? firstCard.offsetWidth + gap
        : currentCarousel.clientWidth
      const isAtEnd =
        currentCarousel.scrollLeft + currentCarousel.clientWidth >=
        currentCarousel.scrollWidth - 1

      if (!isAtEnd) {
        currentCarousel.scrollBy({ left: distance, behavior: "smooth" })
      } else if (hasNextPage) {
        const result = await fetchNextPage()
        if (!result.isFetchNextPageError) {
          requestAnimationFrame(() => {
            carouselRef.current?.scrollBy({
              left: distance,
              behavior: "smooth",
            })
          })
        }
      } else {
        currentCarousel.scrollTo({ left: 0, behavior: "smooth" })
      }
    }, 5000)

    return () => {
      observer.disconnect()
      window.clearInterval(intervalId)
    }
  }, [
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    filteredDoctors.length,
    isAutoPaused,
  ])

  const scrollCarousel = async (direction: -1 | 1) => {
    const carousel = carouselRef.current
    if (!carousel) return

    const card = carousel.querySelector<HTMLElement>("[data-doctor-card]")
    const gap = Number.parseFloat(getComputedStyle(carousel).columnGap) || 0
    const distance = card ? card.offsetWidth + gap : carousel.clientWidth

    if (direction === 1 && !canScrollForward && doctorsQuery.hasNextPage) {
      await doctorsQuery.fetchNextPage()
      requestAnimationFrame(() => {
        carouselRef.current?.scrollBy({ left: distance, behavior: "smooth" })
      })
      return
    }

    carousel.scrollBy({ left: direction * distance, behavior: "smooth" })
  }

  const showScrollControls =
    filteredDoctors.length > 1 || doctorsQuery.hasNextPage

  return (
    <section
      ref={sectionRef}
      id="doctors"
      onMouseEnter={() => setIsAutoPaused(true)}
      onMouseLeave={() => setIsAutoPaused(false)}
      onFocusCapture={() => setIsAutoPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsAutoPaused(false)
        }
      }}
      className="scroll-mt-24 bg-emerald-50/80 py-14 sm:py-18 lg:py-20"
    >
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-800">
              Vetted Network
            </p>
            <h2 className="mt-2 font-heading text-3xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-4xl">
              Featured Clinical Specialists
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
              Explore healthcare providers by specialty, experience, and
              consultation fee.
            </p>
          </div>
          <div className="min-w-0 lg:max-w-[58%]">
            <div className="flex snap-x snap-mandatory items-center gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:flex-wrap lg:justify-end lg:overflow-visible lg:pb-0">
              {[allSpecialists, ...specialties].map((specialty) => (
                <button
                  key={specialty}
                  type="button"
                  aria-pressed={selectedSpecialty === specialty}
                  onClick={() => setSelectedSpecialty(specialty)}
                  className={`min-h-10 shrink-0 snap-start rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800 ${
                    selectedSpecialty === specialty
                      ? "bg-slate-950 text-white"
                      : "bg-emerald-100 text-slate-800 hover:bg-emerald-200"
                  }`}
                >
                  {specialty}
                </button>
              ))}
            <Link
              href="/consultation"
              className="inline-flex min-h-10 shrink-0 items-center gap-1 rounded-full px-3 text-sm font-semibold text-emerald-950 transition-colors hover:bg-emerald-100"
            >
              All doctors
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
            </div>
          </div>
        </div>

        {doctorsQuery.isPending ? (
          <div
            className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            aria-label="Loading doctors"
          >
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className="min-h-72 animate-pulse rounded-xl border border-emerald-100 bg-white p-5"
              >
                <div className="flex gap-3">
                  <div className="size-20 rounded-lg bg-emerald-100 sm:size-[5.5rem]" />
                  <div className="flex-1">
                    <div className="mt-2 h-5 w-2/3 rounded bg-emerald-100" />
                    <div className="mt-3 h-4 w-1/2 rounded bg-emerald-100" />
                  </div>
                </div>
                <div className="mt-5 h-16 rounded-lg bg-emerald-50" />
                <div className="mt-5 h-10 rounded-lg bg-emerald-100" />
              </div>
            ))}
          </div>
        ) : doctorsQuery.isError ? (
          <div
            className="mt-8 rounded-xl border border-red-200 bg-white px-5 py-4 text-sm text-red-800"
            role="alert"
          >
            We couldn’t load doctor profiles right now. Please try again later or
            use the All doctors link.
          </div>
        ) : doctors.length === 0 ? (
          <div className="mt-8 rounded-xl border border-emerald-100 bg-white px-5 py-8 text-center text-sm text-slate-700">
            Doctor profiles will appear here as soon as they are available.
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="mt-8 rounded-xl border border-emerald-100 bg-white px-5 py-8 text-center text-sm text-slate-700">
            No featured doctors were found for this specialty.
          </div>
        ) : (
          <>
            <div className="mt-7 flex items-center justify-end gap-2">
              {showScrollControls ? (
                <>
                  <button
                    type="button"
                    aria-label="Show previous doctors"
                    onClick={() => void scrollCarousel(-1)}
                    disabled={!canScrollBackward}
                    className="flex size-10 items-center justify-center rounded-full border border-emerald-200 bg-white text-slate-950 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowLeft className="size-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    aria-label="Show more doctors"
                    onClick={() => void scrollCarousel(1)}
                    disabled={
                      doctorsQuery.isFetchingNextPage ||
                      (!canScrollForward && !doctorsQuery.hasNextPage)
                    }
                    className="flex size-10 items-center justify-center rounded-full border border-emerald-800 bg-emerald-800 text-white transition-colors hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </button>
                </>
              ) : null}
            </div>
            <div
              ref={carouselRef}
              onScroll={updateScrollControls}
              className="mt-4 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              aria-label="Featured doctors"
            >
              {filteredDoctors.map((doctor) => (
                <div
                  key={doctor.id}
                  data-doctor-card
                  className="w-full shrink-0 snap-start sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]"
                >
                  <DoctorCard doctor={doctor} />
                </div>
              ))}
            </div>
            {doctorsQuery.isFetchNextPageError ? (
              <div
                className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-white px-4 py-3 text-sm text-red-800"
                role="alert"
              >
                <span>
                  We couldn’t load more doctor profiles. Use the next arrow to
                  try again.
                </span>
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  )
}

export default TopDoctors
