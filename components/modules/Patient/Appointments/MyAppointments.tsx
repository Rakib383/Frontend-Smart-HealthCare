"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  getMyAppointments,
  initiateAppointmentPayment,
  type AppointmentPaymentStatus,
  type AppointmentStatus,
  type IPatientAppointment,
} from "@/services/appointment.services"
import { useMutation, useQuery } from "@tanstack/react-query"
import axios from "axios"
import { format } from "date-fns"
import { CalendarClock, CalendarPlus, CheckCircle2, Clock3, CreditCard, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useMemo, useState } from "react"

const EMPTY_APPOINTMENTS: IPatientAppointment[] = []

const statusLabels: Record<AppointmentStatus, string> = {
  SCHEDULED: "Scheduled",
  INPROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELED: "Canceled",
}

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    const message = error.response?.data?.message
    if (message?.toLowerCase().includes("already completed")) {
      return "This appointment can no longer be paid online."
    }
    return message ?? "We couldn't complete the request. Please try again."
  }
  return "We couldn't complete the request. Please try again."
}

const getStatusClassName = (status: AppointmentStatus) => {
  if (status === "COMPLETED") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
  if (status === "INPROGRESS") return "border-blue-500/30 bg-blue-500/10 text-blue-700"
  if (status === "CANCELED") return "border-muted-foreground/30 bg-muted text-muted-foreground"
  return "border-amber-500/30 bg-amber-500/10 text-amber-700"
}

const getPaymentClassName = (status: AppointmentPaymentStatus) =>
  status === "PAID"
    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700"
    : "border-amber-500/30 bg-amber-500/10 text-amber-700"

const formatAppointmentDate = (value: string | Date) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "Date unavailable" : format(date, "EEE, MMM d, yyyy")
}

const formatAppointmentTime = (appointment: IPatientAppointment) => {
  const start = new Date(appointment.schedule.startDateTime)
  const end = new Date(appointment.schedule.endDateTime)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "Time unavailable"
  return `${format(start, "h:mm a")} – ${format(end, "h:mm a")}`
}

const formatFee = (fee: number) =>
  new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(fee)

const MyAppointments = ({ paymentCancelled }: { paymentCancelled: boolean }) => {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"ALL" | AppointmentStatus>("ALL")
  const [paymentError, setPaymentError] = useState("")
  const appointmentsQuery = useQuery({
    queryKey: ["patient-appointments"],
    queryFn: getMyAppointments,
  })

  const appointments = appointmentsQuery.data?.data ?? EMPTY_APPOINTMENTS
  const counts = useMemo(() => ({
    total: appointments.length,
    upcoming: appointments.filter(
      (appointment) =>
        appointment.status === "SCHEDULED",
    ).length,
    completed: appointments.filter((appointment) => appointment.status === "COMPLETED").length,
    unpaid: appointments.filter(
      (appointment) =>
        appointment.paymentStatus === "UNPAID"
        && appointment.status !== "CANCELED",
    ).length,
  }), [appointments])

  const filteredAppointments = useMemo(() => {
    const term = search.trim().toLowerCase()
    return appointments
      .filter((appointment) => statusFilter === "ALL" || appointment.status === statusFilter)
      .filter((appointment) => !term || appointment.doctor.name.toLowerCase().includes(term))
      .sort((left, right) =>
        new Date(left.schedule.startDateTime).getTime() - new Date(right.schedule.startDateTime).getTime(),
      )
  }, [appointments, search, statusFilter])

  const paymentMutation = useMutation({
    mutationFn: initiateAppointmentPayment,
    onSuccess: (result) => {
      if (!result.success || !result.data?.paymentUrl) {
        setPaymentError(result.message || "A payment link is not available right now.")
        return
      }
      window.location.assign(result.data.paymentUrl)
    },
    onError: (error) => setPaymentError(getErrorMessage(error)),
  })

  const summary = [
    { label: "All appointments", value: counts.total, icon: CalendarClock },
    { label: "Scheduled", value: counts.upcoming, icon: Clock3 },
    { label: "Completed", value: counts.completed, icon: CheckCircle2 },
    { label: "Awaiting payment", value: counts.unpaid, icon: CreditCard },
  ]

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">My appointments</h1>
          <p className="text-sm text-muted-foreground">
            View your upcoming visits, appointment history, and payment status.
          </p>
        </div>
        <Button render={<Link href="/dashboard/book-appointments" />} className="w-full sm:w-auto">
          <CalendarPlus aria-hidden="true" />
          Book an appointment
        </Button>
      </header>

      {paymentCancelled && (
        <Alert>
          <AlertDescription>
            Checkout was canceled. Your appointment is still listed below, and you can try paying again.
          </AlertDescription>
        </Alert>
      )}
      {paymentError && (
        <Alert variant="destructive">
          <AlertDescription>{paymentError}</AlertDescription>
        </Alert>
      )}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Appointment summary">
        {summary.map(({ label, value, icon: Icon }) => (
          <Card key={label} size="sm">
            <CardContent className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-2xl font-semibold tabular-nums">{value}</p>
              </div>
              <Icon className="size-5 text-primary" aria-hidden="true" />
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            type="search"
            aria-label="Search appointments by doctor"
            placeholder="Search by doctor..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="min-w-0 flex-1"
          />
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              if (value === "ALL" || value === "SCHEDULED" || value === "INPROGRESS" || value === "COMPLETED" || value === "CANCELED") {
                setStatusFilter(value)
              }
            }}
          >
            <SelectTrigger aria-label="Filter appointments by status" className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="SCHEDULED">Scheduled</SelectItem>
              <SelectItem value="INPROGRESS">In progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELED">Canceled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {appointmentsQuery.isError ? (
          <div className="flex flex-col gap-3 rounded-xl border border-destructive/40 p-5 sm:flex-row sm:items-center sm:justify-between" role="alert">
            <p className="text-sm text-destructive">{getErrorMessage(appointmentsQuery.error)}</p>
            <Button type="button" variant="outline" size="sm" onClick={() => void appointmentsQuery.refetch()}>
              <RefreshCw aria-hidden="true" />
              Try again
            </Button>
          </div>
        ) : appointmentsQuery.isPending ? (
          <div className="space-y-3" aria-label="Loading appointments">
            {[0, 1, 2].map((item) => (
              <Card key={item}>
                <CardContent className="space-y-3">
                  <div className="h-5 w-48 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-full max-w-md animate-pulse rounded bg-muted" />
                  <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredAppointments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CalendarClock className="size-6" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-semibold">
                  {appointments.length === 0 ? "No appointments yet" : "No matching appointments"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {appointments.length === 0
                    ? "Book a visit with a doctor to see it here."
                    : "Try changing the search or status filter."}
                </p>
              </div>
              {appointments.length === 0 && (
                <Button render={<Link href="/dashboard/book-appointments" />}>
                  Find a doctor
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredAppointments.map((appointment) => (
              <Card key={appointment.id}>
                <CardContent className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                        {appointment.doctor.name.slice(0, 1).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <h2 className="truncate font-semibold">{appointment.doctor.name}</h2>
                        <p className="truncate text-sm text-muted-foreground">
                          {appointment.doctor.designation || appointment.doctor.qualification || "Healthcare professional"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className={getStatusClassName(appointment.status)}>
                        {statusLabels[appointment.status]}
                      </Badge>
                      <Badge variant="outline" className={getPaymentClassName(appointment.paymentStatus)}>
                        {appointment.paymentStatus === "PAID" ? "Paid" : "Unpaid"}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid gap-3 border-t pt-4 sm:grid-cols-3">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Date</p>
                      <p className="text-sm font-medium">{formatAppointmentDate(appointment.schedule.startDateTime)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Time</p>
                      <p className="text-sm font-medium">{formatAppointmentTime(appointment)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Appointment fee</p>
                      <p className="text-sm font-medium">{formatFee(appointment.doctor.appointmentFee)}</p>
                    </div>
                  </div>

                  {appointment.paymentStatus === "UNPAID" && appointment.status !== "CANCELED" && (
                    <div className="flex justify-end border-t pt-3">
                      <Button
                        type="button"
                        size="sm"
                        disabled={paymentMutation.isPending}
                        onClick={() => {
                          setPaymentError("")
                          paymentMutation.mutate(appointment.id)
                        }}
                      >
                        <CreditCard aria-hidden="true" />
                        {paymentMutation.isPending ? "Starting checkout..." : "Pay online"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default MyAppointments
