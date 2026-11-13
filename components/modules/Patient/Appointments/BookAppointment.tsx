"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  bookAppointment,
  bookAppointmentWithPayLater,
  type IBookAppointmentPayload,
} from "@/services/appointment.services"
import { getDoctors } from "@/services/doctor.services"
import { getAvailableDoctorSchedules } from "@/services/schedule.services"
import { UserStatus, type IDoctor } from "@/types/doctor.types"
import type { IDoctorSchedule } from "@/types/schedule.types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { format } from "date-fns"
import { CalendarClock, CalendarDays, CheckCircle2, CreditCard, MapPin, Search, Star, Wallet } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

type PaymentChoice = "PAY_NOW" | "PAY_LATER"
const EMPTY_DOCTORS: IDoctor[] = []
const EMPTY_SLOTS: IDoctorSchedule[] = []

const formatFee = (fee: number) =>
  new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(fee)

const getAllDoctors = async () => {
  const doctors: IDoctor[] = []
  let page = 1

  while (true) {
    const response = await getDoctors(`page=${page}&limit=100`)
    doctors.push(...response.data)
    if (!response.meta || page >= response.meta.totalPages) return doctors
    page += 1
  }
}

const formatSlot = (slot: IDoctorSchedule) => {
  const start = new Date(slot.schedule.startDateTime)
  const end = new Date(slot.schedule.endDateTime)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null

  return {
    date: format(start, "EEEE, MMMM d, yyyy"),
    time: `${format(start, "h:mm a")} – ${format(end, "h:mm a")}`,
  }
}

const getBookingErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    const message = error.response?.data?.message
    if (message?.toLowerCase().includes("no longer available")) {
      return "That time was just booked. Please choose another available slot."
    }
    return message ?? "We couldn't book this appointment. Please try again."
  }
  return error instanceof Error ? error.message : "We couldn't book this appointment. Please try again."
}

const DoctorChoice = ({
  doctor,
  selected,
  onSelect,
}: {
  doctor: IDoctor
  selected: boolean
  onSelect: () => void
}) => (
  <button
    type="button"
    aria-pressed={selected}
    onClick={onSelect}
    className={`w-full rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${
      selected
        ? "border-primary bg-primary/5"
        : "border-border bg-background hover:bg-muted/50"
    }`}
  >
    <div className="flex items-start gap-3">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
        {doctor.name.slice(0, 1).toUpperCase()}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{doctor.name}</p>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">
          {doctor.designation || doctor.qualification}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {doctor.experience !== undefined && <span>{doctor.experience} years of experience</span>}
          <span className="inline-flex items-center gap-1">
            <Star className="size-3.5 fill-amber-400 text-amber-500" aria-hidden="true" />
            {Number.isFinite(doctor.averageRating) ? doctor.averageRating.toFixed(1) : "New"}
          </span>
        </div>
      </div>
      <span className="shrink-0 text-sm font-semibold">{formatFee(doctor.appointmentFee)}</span>
    </div>
  </button>
)

const BookAppointment = () => {
  const queryClient = useQueryClient()
  const [doctorSearch, setDoctorSearch] = useState("")
  const [selectedDoctorId, setSelectedDoctorId] = useState("")
  const [selectedScheduleId, setSelectedScheduleId] = useState("")
  const [paymentChoice, setPaymentChoice] = useState<PaymentChoice>("PAY_NOW")
  const [bookingError, setBookingError] = useState("")
  const [bookingSuccess, setBookingSuccess] = useState("")

  const doctorsQuery = useQuery({
    queryKey: ["appointment-booking-doctors"],
    queryFn: getAllDoctors,
    staleTime: 60_000,
  })

  const doctors = doctorsQuery.data ?? EMPTY_DOCTORS
  const availableDoctors = useMemo(() => {
    const query = doctorSearch.trim().toLowerCase()
    return doctors
      .filter((doctor) => doctor.user?.status === UserStatus.ACTIVE)
      .filter((doctor) => !query || [
        doctor.name,
        doctor.designation,
        doctor.qualification,
        doctor.currentWorkingPlace,
      ].some((value) => value?.toLowerCase().includes(query)))
      .sort((left, right) => right.averageRating - left.averageRating)
  }, [doctors, doctorSearch])

  const selectedDoctor = doctors.find((doctor) => doctor.id === selectedDoctorId)

  const slotsQuery = useQuery({
    queryKey: ["available-doctor-schedules", selectedDoctorId],
    queryFn: () => getAvailableDoctorSchedules(selectedDoctorId),
    enabled: Boolean(selectedDoctorId),
    staleTime: 30_000,
  })

  const slots = slotsQuery.data?.data ?? EMPTY_SLOTS
  const selectedSlot = slots.find((slot) => slot.scheduleId === selectedScheduleId)

  const bookingMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDoctorId || !selectedScheduleId) {
        throw new Error("Choose a doctor and an available time slot.")
      }

      const payload: IBookAppointmentPayload = {
        doctorId: selectedDoctorId,
        scheduleId: selectedScheduleId,
      }
      const result = paymentChoice === "PAY_NOW"
        ? await bookAppointment(payload)
        : await bookAppointmentWithPayLater(payload)

      if (!result.success) throw new Error(result.message || "We couldn't book this appointment.")
      return result
    },
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({ queryKey: ["patient-appointments"] })
      await queryClient.invalidateQueries({ queryKey: ["available-doctor-schedules", selectedDoctorId] })

      if (paymentChoice === "PAY_NOW" && result.data.paymentUrl) {
        window.location.assign(result.data.paymentUrl)
        return
      }

      if (paymentChoice === "PAY_NOW") {
        setBookingSuccess("Your appointment is booked. Payment checkout wasn't available, but you can pay from My Appointments.")
      } else {
        setBookingSuccess("Your appointment is booked. You can pay later from My Appointments.")
      }
      setSelectedScheduleId("")
    },
    onError: async (error) => {
      setBookingError(getBookingErrorMessage(error))
      await queryClient.invalidateQueries({ queryKey: ["available-doctor-schedules", selectedDoctorId] })
    },
  })

  const chooseDoctor = (doctorId: string) => {
    setSelectedDoctorId(doctorId)
    setSelectedScheduleId("")
    setBookingError("")
    setBookingSuccess("")
  }

  const chooseSlot = (scheduleId: string) => {
    setSelectedScheduleId(scheduleId)
    setBookingError("")
    setBookingSuccess("")
  }

  const canBook = Boolean(selectedDoctor && selectedSlot && !bookingMutation.isPending)

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Book an appointment</h1>
        <p className="text-sm text-muted-foreground">
          Choose a doctor, select an available time, and confirm your visit.
        </p>
      </header>

      {bookingError && (
        <Alert variant="destructive">
          <AlertDescription>{bookingError}</AlertDescription>
        </Alert>
      )}
      {bookingSuccess && (
        <Alert>
          <CheckCircle2 aria-hidden="true" />
          <AlertDescription className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>{bookingSuccess}</span>
            <Link href="/dashboard/my-appointments" className="font-medium underline underline-offset-4">
              View my appointments
            </Link>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(20rem,0.9fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Search className="size-4" aria-hidden="true" />
              </span>
              Choose a doctor
            </CardTitle>
            <CardDescription>Browse active doctors and select who you would like to see.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                type="search"
                placeholder="Search name or qualification..."
                value={doctorSearch}
                onChange={(event) => setDoctorSearch(event.target.value)}
                className="pl-9"
                aria-label="Search doctors"
              />
            </div>

            {doctorsQuery.isError ? (
              <Alert variant="destructive">
                <AlertDescription>
                  We couldn&apos;t load doctors right now. Refresh the page and try again.
                </AlertDescription>
              </Alert>
            ) : doctorsQuery.isPending ? (
              <div className="space-y-3" aria-label="Loading doctors">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="h-24 animate-pulse rounded-xl bg-muted" />
                ))}
              </div>
            ) : availableDoctors.length === 0 ? (
              <div className="rounded-xl border border-dashed p-6 text-center">
                <p className="font-medium">No doctors found</p>
                <p className="mt-1 text-sm text-muted-foreground">Try a different search.</p>
              </div>
            ) : (
              <div className="max-h-[34rem] space-y-3 overflow-y-auto pr-1">
                {availableDoctors.map((doctor) => (
                  <DoctorChoice
                    key={doctor.id}
                    doctor={doctor}
                    selected={doctor.id === selectedDoctorId}
                    onSelect={() => chooseDoctor(doctor.id)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CalendarDays className="size-4" aria-hidden="true" />
                </span>
                Select a time
              </CardTitle>
              <CardDescription>
                {selectedDoctor
                  ? `Available appointments with ${selectedDoctor.name}.`
                  : "Choose a doctor first to see available appointment times."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedDoctor ? (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  Select a doctor to view their upcoming availability.
                </div>
              ) : slotsQuery.isError ? (
                <Alert variant="destructive">
                  <AlertDescription>
                    We couldn&apos;t load this doctor&apos;s availability. Please try selecting the doctor again.
                  </AlertDescription>
                </Alert>
              ) : slotsQuery.isPending ? (
                <div className="grid grid-cols-2 gap-2" aria-label="Loading appointment times">
                  {[0, 1, 2, 3].map((item) => (
                    <div key={item} className="h-16 animate-pulse rounded-lg bg-muted" />
                  ))}
                </div>
              ) : slots.length === 0 ? (
                <div className="rounded-xl border border-dashed p-6 text-center">
                  <CalendarClock className="mx-auto size-6 text-muted-foreground" aria-hidden="true" />
                  <p className="mt-2 font-medium">No upcoming times available</p>
                  <p className="mt-1 text-sm text-muted-foreground">Choose another doctor or check back later.</p>
                </div>
              ) : (
                <div className="grid max-h-80 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                  {slots.map((slot) => {
                    const display = formatSlot(slot)
                    if (!display) return null

                    const selected = slot.scheduleId === selectedScheduleId
                    return (
                      <button
                        key={slot.scheduleId}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => chooseSlot(slot.scheduleId)}
                        className={`rounded-lg border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${
                          selected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-muted/50"
                        }`}
                      >
                        <span className="block text-xs font-medium text-muted-foreground">{display.date}</span>
                        <span className="mt-1 block text-sm font-semibold">{display.time}</span>
                      </button>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Confirm your appointment</CardTitle>
              <CardDescription>Choose how you would like to pay for your visit.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedDoctor && selectedSlot && (
                <div className="rounded-xl bg-muted/50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{selectedDoctor.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatSlot(selectedSlot)?.date} · {formatSlot(selectedSlot)?.time}
                      </p>
                    </div>
                    <Badge variant="outline">{formatFee(selectedDoctor.appointmentFee)}</Badge>
                  </div>
                  {selectedDoctor.currentWorkingPlace && (
                    <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="size-3.5" aria-hidden="true" />
                      {selectedDoctor.currentWorkingPlace}
                    </p>
                  )}
                </div>
              )}

              <fieldset className="space-y-2" disabled={bookingMutation.isPending}>
                <legend className="mb-2 text-sm font-medium">Payment</legend>
                <label className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${
                  paymentChoice === "PAY_NOW" ? "border-primary bg-primary/5" : "border-border"
                }`}>
                  <input
                    type="radio"
                    name="paymentChoice"
                    value="PAY_NOW"
                    checked={paymentChoice === "PAY_NOW"}
                    onChange={() => setPaymentChoice("PAY_NOW")}
                    className="mt-1 accent-primary"
                  />
                  <span>
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <CreditCard className="size-4 text-primary" aria-hidden="true" />
                      Pay online now
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      Continue to secure card checkout.
                    </span>
                  </span>
                </label>
                <label className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${
                  paymentChoice === "PAY_LATER" ? "border-primary bg-primary/5" : "border-border"
                }`}>
                  <input
                    type="radio"
                    name="paymentChoice"
                    value="PAY_LATER"
                    checked={paymentChoice === "PAY_LATER"}
                    onChange={() => setPaymentChoice("PAY_LATER")}
                    className="mt-1 accent-primary"
                  />
                  <span>
                    <span className="flex items-center gap-2 text-sm font-medium">
                      <Wallet className="size-4 text-primary" aria-hidden="true" />
                      Pay later
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      Reserve the slot now and pay from My Appointments.
                    </span>
                  </span>
                </label>
              </fieldset>

              <Button
                type="button"
                className="h-11 w-full"
                disabled={!canBook}
                onClick={() => {
                  setBookingError("")
                  setBookingSuccess("")
                  bookingMutation.mutate()
                }}
              >
                {bookingMutation.isPending
                  ? "Booking appointment..."
                  : paymentChoice === "PAY_NOW"
                    ? "Continue to payment"
                    : "Book appointment"}
              </Button>
              {!selectedSlot && selectedDoctor && (
                <p className="text-center text-xs text-muted-foreground">
                  Select an available time to continue.
                </p>
              )}
              <p className="text-center text-xs text-muted-foreground">
                You can view appointment details and payment status in{" "}
                <Link href="/dashboard/my-appointments" className="font-medium underline underline-offset-4">
                  My Appointments
                </Link>.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default BookAppointment
