"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getDoctors } from "@/services/doctor.services"
import type { IDoctor } from "@/types/doctor.types"
import { useQuery } from "@tanstack/react-query"
import { ArrowRight, Star } from "lucide-react"
import Link from "next/link"

const queryString = "page=1&limit=3&sortBy=averageRating&sortOrder=desc"

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
    .slice(0, 2)

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase()

const formatFee = (fee: number) =>
  Number.isFinite(fee)
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(fee)
    : "Ask for fee"

const DoctorCard = ({ doctor }: { doctor: IDoctor }) => {
  const specialties = getSpecialties(doctor)
  const rating = Number.isFinite(doctor.averageRating)
    ? doctor.averageRating.toFixed(1)
    : "New"

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <Avatar size="lg" className="size-16 border-2 border-teal-50 bg-teal-50 sm:size-[4.5rem]">
          {doctor.profilePhoto ? (
            <AvatarImage src={doctor.profilePhoto} alt={doctor.name} />
          ) : null}
          <AvatarFallback className="bg-teal-50 text-lg font-bold text-teal-800">
            {getInitials(doctor.name)}
          </AvatarFallback>
        </Avatar>
        <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-sm font-semibold text-amber-800">
          <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
          <span>{rating}</span>
        </div>
      </div>

      <div className="mt-5 flex-1">
        <h3 className="text-lg font-bold text-slate-900">{doctor.name}</h3>
        <p className="mt-1 text-sm font-medium text-teal-700">{doctor.designation}</p>
        <p className="mt-2 text-sm text-slate-500">{doctor.qualification}</p>
        <p className="mt-1 text-sm text-slate-500">{doctor.currentWorkingPlace}</p>

        <div className="mt-4 flex min-h-7 flex-wrap gap-2">
          {specialties.map((specialty) => (
            <span
              key={specialty}
              className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600"
            >
              {specialty}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <div>
          <p className="text-xs text-slate-500">Appointment fee</p>
          <p className="mt-0.5 font-bold text-slate-900">{formatFee(doctor.appointmentFee)}</p>
        </div>
        <Link
          href={`/consultation/doctor/${encodeURIComponent(doctor.id)}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-900"
        >
          View profile
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  )
}

const TopDoctors = () => {
  const doctorsQuery = useQuery({
    queryKey: ["doctors", "home-featured"],
    queryFn: () => getDoctors(queryString),
  })

  const doctors = doctorsQuery.data?.data ?? []

  return (
    <section id="doctors" className="scroll-mt-24 bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-teal-700">
              Meet your care team
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Top doctors for your health
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              Explore experienced doctors and find the right specialist for your
              needs.
            </p>
          </div>
          <Link
            href="/consultation"
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800 sm:self-auto"
          >
            Show all doctors
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        {doctorsQuery.isPending ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading doctors">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className="min-h-72 animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
              >
                <div className="size-16 rounded-full bg-slate-100" />
                <div className="mt-5 h-5 w-2/3 rounded bg-slate-100" />
                <div className="mt-3 h-4 w-1/2 rounded bg-slate-100" />
                <div className="mt-8 h-4 w-full rounded bg-slate-100" />
                <div className="mt-3 h-4 w-4/5 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : doctorsQuery.isError ? (
          <div
            className="mt-10 rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4 text-sm text-destructive"
            role="alert"
          >
            We couldn’t load doctor profiles right now. Please try again later or
            use the Show all doctors link.
          </div>
        ) : doctors.length > 0 ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {doctors.slice(0, 3).map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-xl border border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-600">
            Doctor profiles will appear here as soon as they are available.
          </div>
        )}
      </div>
    </section>
  )
}

export default TopDoctors
