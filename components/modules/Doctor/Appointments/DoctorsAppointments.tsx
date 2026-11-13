"use client"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/toast"
import {
  changeAppointmentStatus,
  getMyDoctorAppointments,
  type AppointmentPaymentStatus,
  type AppointmentStatus,
  type IDoctorAppointment,
} from "@/services/appointment.services"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { format } from "date-fns"
import { CalendarClock, CalendarDays, CheckCircle2, Clock3, Search, UserRound, XCircle } from "lucide-react"
import { useMemo, useState } from "react"

const EMPTY_APPOINTMENTS: IDoctorAppointment[] = []

const statusLabels: Record<AppointmentStatus, string> = {
  SCHEDULED: "Scheduled",
  INPROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELED: "Canceled",
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

const formatDate = (value: string | Date) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "Date unavailable" : format(date, "EEE, MMM d, yyyy")
}

const formatTimeRange = (appointment: IDoctorAppointment) => {
  const start = new Date(appointment.schedule.startDateTime)
  const end = new Date(appointment.schedule.endDateTime)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "Time unavailable"
  return `${format(start, "h:mm a")} – ${format(end, "h:mm a")}`
}

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "The request could not be completed. Please try again."
  }
  return error instanceof Error ? error.message : "The request could not be completed. Please try again."
}

const isAppointmentStatus = (value: string | null): value is AppointmentStatus =>
  value === "SCHEDULED"
  || value === "INPROGRESS"
  || value === "COMPLETED"
  || value === "CANCELED"

const DoctorsAppointments = () => {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"ALL" | AppointmentStatus>("ALL")
  const [appointmentToCancel, setAppointmentToCancel] = useState<IDoctorAppointment | null>(null)
  const [actionError, setActionError] = useState("")

  const appointmentsQuery = useQuery({
    queryKey: ["doctor-appointments"],
    queryFn: getMyDoctorAppointments,
  })

  const statusMutation = useMutation({
    mutationFn: async ({
      appointmentId,
      status,
    }: {
      appointmentId: string
      status: AppointmentStatus
    }) => {
      const response = await changeAppointmentStatus(appointmentId, status)
      if (!response.success) throw new Error(response.message || "The appointment could not be updated.")
      return response
    },
    onSuccess: async (_response, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["doctor-appointments"] })
      setAppointmentToCancel(null)
      setActionError("")
      toast.add({
        title: "Appointment updated",
        description: `Status changed to ${statusLabels[variables.status].toLowerCase()}.`,
        type: "success",
      })
    },
    onError: (error) => {
      setActionError(getErrorMessage(error))
      toast.add({
        title: "Could not update appointment",
        description: getErrorMessage(error),
        type: "error",
      })
    },
  })

  const appointments = appointmentsQuery.data?.data ?? EMPTY_APPOINTMENTS
  const counts = useMemo(() => ({
    total: appointments.length,
    scheduled: appointments.filter((appointment) => appointment.status === "SCHEDULED").length,
    inProgress: appointments.filter((appointment) => appointment.status === "INPROGRESS").length,
    completed: appointments.filter((appointment) => appointment.status === "COMPLETED").length,
    canceled: appointments.filter((appointment) => appointment.status === "CANCELED").length,
  }), [appointments])

  const filteredAppointments = useMemo(() => {
    const term = search.trim().toLowerCase()
    return appointments
      .filter((appointment) => statusFilter === "ALL" || appointment.status === statusFilter)
      .filter((appointment) =>
        !term
        || appointment.patient.name.toLowerCase().includes(term)
        || appointment.patient.email.toLowerCase().includes(term),
      )
      .sort((left, right) =>
        new Date(left.schedule.startDateTime).getTime() - new Date(right.schedule.startDateTime).getTime(),
      )
  }, [appointments, search, statusFilter])

  const summary = [
    { label: "Total", value: counts.total, icon: CalendarDays },
    { label: "Scheduled", value: counts.scheduled, icon: CalendarClock },
    { label: "In progress", value: counts.inProgress, icon: Clock3 },
    { label: "Completed", value: counts.completed, icon: CheckCircle2 },
    { label: "Canceled", value: counts.canceled, icon: XCircle },
  ]

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">My appointments</h1>
        <p className="text-sm text-muted-foreground">
          Review your patient appointments and update their visit status.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5" aria-label="Appointment summary">
        {summary.map(({ label, value, icon: Icon }) => (
          <Card key={label} size="sm">
            <CardContent className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
              </div>
              <Icon className="size-5 text-primary" aria-hidden="true" />
            </CardContent>
          </Card>
        ))}
      </section>

      {actionError && (
        <Alert variant="destructive">
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}

      {appointmentsQuery.isError ? (
        <div className="flex flex-col gap-3 rounded-xl border border-destructive/40 p-5 sm:flex-row sm:items-center sm:justify-between" role="alert">
          <p className="text-sm text-destructive">{getErrorMessage(appointmentsQuery.error)}</p>
          <Button type="button" variant="outline" size="sm" onClick={() => void appointmentsQuery.refetch()}>
            Try again
          </Button>
        </div>
      ) : appointmentsQuery.isPending ? (
        <div className="space-y-3" aria-label="Loading appointments">
          {[0, 1, 2].map((item) => (
            <Card key={item}>
              <CardContent className="space-y-3">
                <div className="h-5 w-48 animate-pulse rounded bg-muted" />
                <div className="h-4 w-full max-w-lg animate-pulse rounded bg-muted" />
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.currentTarget.value)}
                placeholder="Search by patient name or email..."
                aria-label="Search appointments by patient"
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                if (value === "ALL" || isAppointmentStatus(value)) setStatusFilter(value)
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

          {filteredAppointments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                <CalendarClock className="size-7 text-muted-foreground" aria-hidden="true" />
                <div>
                  <h2 className="font-semibold">
                    {appointments.length === 0 ? "No appointments yet" : "No matching appointments"}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {appointments.length === 0
                      ? "Patient bookings will appear here."
                      : "Try another patient name or status filter."}
                  </p>
                </div>
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
                          {appointment.patient.name.slice(0, 1).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <h2 className="truncate font-semibold">{appointment.patient.name}</h2>
                          <p className="truncate text-sm text-muted-foreground">{appointment.patient.email}</p>
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
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Appointment date</p>
                        <p className="mt-1 text-sm font-medium">{formatDate(appointment.schedule.startDateTime)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Time</p>
                        <p className="mt-1 text-sm font-medium">{formatTimeRange(appointment)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Appointment ID</p>
                        <p className="mt-1 break-all font-mono text-xs">{appointment.id}</p>
                      </div>
                    </div>

                    {(appointment.status === "SCHEDULED" || appointment.status === "INPROGRESS") && (
                      <div className="flex flex-col gap-2 border-t pt-3 sm:flex-row sm:justify-end">
                        {appointment.status === "SCHEDULED" && (
                          <>
                            <Button
                              type="button"
                              disabled={statusMutation.isPending}
                              onClick={() => {
                                setActionError("")
                                statusMutation.mutate({
                                  appointmentId: appointment.id,
                                  status: "INPROGRESS",
                                })
                              }}
                            >
                              <UserRound aria-hidden="true" />
                              Start visit
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              disabled={statusMutation.isPending}
                              onClick={() => {
                                setActionError("")
                                setAppointmentToCancel(appointment)
                              }}
                            >
                              Cancel appointment
                            </Button>
                          </>
                        )}
                        {appointment.status === "INPROGRESS" && (
                          <Button
                            type="button"
                            disabled={statusMutation.isPending}
                            onClick={() => {
                              setActionError("")
                              statusMutation.mutate({
                                appointmentId: appointment.id,
                                status: "COMPLETED",
                              })
                            }}
                          >
                            <CheckCircle2 aria-hidden="true" />
                            Mark completed
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      <AlertDialog
        open={appointmentToCancel !== null}
        onOpenChange={(open) => {
          if (!open && !statusMutation.isPending) setAppointmentToCancel(null)
        }}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              {appointmentToCancel
                ? `This will cancel the appointment with ${appointmentToCancel.patient.name} on ${formatDate(appointmentToCancel.schedule.startDateTime)}.`
                : "This will cancel the selected appointment."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={statusMutation.isPending}>Keep appointment</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={!appointmentToCancel || statusMutation.isPending}
              onClick={() => {
                if (appointmentToCancel) {
                  statusMutation.mutate({
                    appointmentId: appointmentToCancel.id,
                    status: "CANCELED",
                  })
                }
              }}
            >
              {statusMutation.isPending ? "Canceling..." : "Cancel appointment"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default DoctorsAppointments
