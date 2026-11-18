"use client"

import AppointmentPieChart from "@/components/shared/AppointmentPieChart"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getMyAppointments, type IPatientAppointment } from "@/services/appointment.services"
import { getMyPrescriptions, type IManagedPrescription } from "@/services/prescription.services"
import { getPatientDashboardData } from "@/services/dashboard.services"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { format } from "date-fns"
import {
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  ExternalLink,
  FileText,
  HeartPulse,
  RefreshCw,
  Star,
} from "lucide-react"
import Link from "next/link"
import { useMemo } from "react"

const EMPTY_APPOINTMENTS: IPatientAppointment[] = []
const EMPTY_PRESCRIPTIONS: IManagedPrescription[] = []

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "We couldn't load this information. Please try again."
  }
  return error instanceof Error ? error.message : "We couldn't load this information. Please try again."
}

const formatDate = (value: string | Date) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "Date unavailable" : format(date, "EEE, MMM d, yyyy")
}

const formatTime = (value: string | Date) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "Time unavailable" : format(date, "h:mm a")
}

const formatFee = (fee: number) =>
  new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(fee)

const getSafePdfUrl = (value: string | null) => {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === "https:" ? url.toString() : null
  } catch {
    return null
  }
}

const PatientDashboardContent = () => {
  const dashboardQuery = useQuery({
    queryKey: ["patient-dashboard-data"],
    queryFn: getPatientDashboardData,
    refetchOnWindowFocus: true,
  })

  const appointmentsQuery = useQuery({
    queryKey: ["patient-appointments"],
    queryFn: getMyAppointments,
  })

  const prescriptionsQuery = useQuery({
    queryKey: ["patient-prescriptions"],
    queryFn: getMyPrescriptions,
  })

  const appointments = appointmentsQuery.data?.data ?? EMPTY_APPOINTMENTS
  const prescriptions = prescriptionsQuery.data?.data ?? EMPTY_PRESCRIPTIONS
  const scheduledAppointments = useMemo(
    () => appointments
      .filter((appointment) => appointment.status === "SCHEDULED")
      .sort((left, right) =>
        new Date(left.schedule.startDateTime).getTime() - new Date(right.schedule.startDateTime).getTime(),
      ),
    [appointments],
  )
  const recentPrescriptions = useMemo(
    () => [...prescriptions]
      .sort((left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
      )
      .slice(0, 3),
    [prescriptions],
  )

  const stats = [
    {
      title: "Appointments",
      value: appointmentsQuery.isPending ? "—" : dashboardQuery.data?.data.appointmentCount ?? appointments.length,
      description: "All your booked visits",
      icon: CalendarDays,
    },
    {
      title: "Upcoming",
      value: appointmentsQuery.isPending ? "—" : scheduledAppointments.length,
      description: "Scheduled visits ahead",
      icon: CalendarClock,
    },
    {
      title: "Prescriptions",
      value: prescriptionsQuery.isPending ? "—" : prescriptions.length,
      description: "Prescriptions from your doctors",
      icon: FileText,
    },
    {
      title: "Reviews",
      value: dashboardQuery.isPending ? "—" : dashboardQuery.isError ? "—" : dashboardQuery.data?.data.reviewCount ?? 0,
      description: "Reviews you've shared",
      icon: Star,
    },
  ]

  const quickLinks = [
    {
      title: "Book an appointment",
      description: "Find a doctor and choose a time that works for you.",
      href: "/dashboard/book-appointments",
      action: "Find a doctor",
      icon: CalendarPlus,
    },
    {
      title: "My appointments",
      description: "Check appointment details and payment status.",
      href: "/dashboard/my-appointments",
      action: "View appointments",
      icon: CalendarClock,
    },
    {
      title: "My prescriptions",
      description: "Review instructions and open your prescription PDFs.",
      href: "/dashboard/my-prescriptions",
      action: "View prescriptions",
      icon: FileText,
    },
    {
      title: "Health records",
      description: "Keep your health information and reports up to date.",
      href: "/dashboard/health-records",
      action: "Manage records",
      icon: HeartPulse,
    },
  ]

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Patient dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Keep track of your appointments, prescriptions, and health records.
        </p>
      </header>

      {dashboardQuery.isError && (
        <Alert variant="destructive">
          <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{getErrorMessage(dashboardQuery.error)}</span>
            <Button type="button" variant="outline" size="sm" onClick={() => void dashboardQuery.refetch()}>
              <RefreshCw aria-hidden="true" />
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Patient overview">
        {stats.map(({ title, value, description, icon: Icon }) => (
          <Card key={title} size="sm">
            <CardContent className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">{title}</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{description}</p>
              </div>
              <Icon className="size-5 shrink-0 text-primary" aria-hidden="true" />
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Next appointment</CardTitle>
            <CardDescription>Your nearest scheduled visit.</CardDescription>
          </CardHeader>
          <CardContent>
            {appointmentsQuery.isError ? (
              <div className="flex flex-col gap-3 rounded-lg border border-destructive/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-destructive">{getErrorMessage(appointmentsQuery.error)}</p>
                <Button type="button" variant="outline" size="sm" onClick={() => void appointmentsQuery.refetch()}>
                  Try again
                </Button>
              </div>
            ) : appointmentsQuery.isPending ? (
              <div className="space-y-3" aria-label="Loading next appointment">
                <div className="h-5 w-48 animate-pulse rounded bg-muted" />
                <div className="h-4 w-64 max-w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
              </div>
            ) : scheduledAppointments[0] ? (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <CalendarClock className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate font-semibold">{scheduledAppointments[0].doctor.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {scheduledAppointments[0].doctor.designation || "Healthcare provider"}
                    </p>
                  </div>
                  <Badge variant="outline" className="ml-auto shrink-0 border-amber-500/30 bg-amber-500/10 text-amber-700">
                    Scheduled
                  </Badge>
                </div>
                <div className="grid gap-3 border-t pt-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Date</p>
                    <p className="mt-1 text-sm font-medium">
                      {formatDate(scheduledAppointments[0].schedule.startDateTime)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Time</p>
                    <p className="mt-1 text-sm font-medium">
                      {formatTime(scheduledAppointments[0].schedule.startDateTime)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Consultation fee</p>
                    <p className="mt-1 text-sm font-medium">
                      {formatFee(scheduledAppointments[0].doctor.appointmentFee)}
                    </p>
                  </div>
                </div>
                <Button render={<Link href="/dashboard/my-appointments" />} variant="outline" size="sm">
                  View appointment details
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed p-5">
                <p className="text-sm text-muted-foreground">
                  You don&apos;t have any upcoming appointments.
                </p>
                <Button render={<Link href="/dashboard/book-appointments" />} size="sm">
                  <CalendarPlus aria-hidden="true" />
                  Book an appointment
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div className="space-y-1">
              <CardTitle>Recent prescriptions</CardTitle>
              <CardDescription>Your latest care instructions.</CardDescription>
            </div>
            <Button
              render={<Link href="/dashboard/my-prescriptions" />}
              variant="ghost"
              size="sm"
              className="shrink-0"
            >
              View all
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {prescriptionsQuery.isError ? (
              <div className="flex flex-col gap-3 rounded-lg border border-destructive/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-destructive">{getErrorMessage(prescriptionsQuery.error)}</p>
                <Button type="button" variant="outline" size="sm" onClick={() => void prescriptionsQuery.refetch()}>
                  Try again
                </Button>
              </div>
            ) : prescriptionsQuery.isPending ? (
              <div className="space-y-3" aria-label="Loading recent prescriptions">
                {[0, 1].map((item) => (
                  <div key={item} className="space-y-2 rounded-lg border p-3">
                    <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-56 max-w-full animate-pulse rounded bg-muted" />
                  </div>
                ))}
              </div>
            ) : recentPrescriptions.length > 0 ? (
              recentPrescriptions.map((prescription) => {
                const pdfUrl = getSafePdfUrl(prescription.pdfUrl)
                return (
                  <div key={prescription.id} className="flex items-center gap-3 rounded-lg border p-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FileText className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{prescription.doctor.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Issued {formatDate(prescription.createdAt)} · Follow-up {formatDate(prescription.followUpDate)}
                      </p>
                    </div>
                    {pdfUrl && (
                      <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open prescription from ${prescription.doctor.name}`}
                        className="flex size-9 shrink-0 items-center justify-center rounded-md text-primary hover:bg-muted"
                      >
                        <ExternalLink className="size-4" aria-hidden="true" />
                      </a>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed p-5">
                <p className="text-sm text-muted-foreground">Your prescriptions will appear here after a doctor issues one.</p>
                <Button render={<Link href="/dashboard/my-prescriptions" />} variant="outline" size="sm">
                  <FileText aria-hidden="true" />
                  View prescriptions
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {dashboardQuery.isError ? (
          <Card>
            <CardHeader>
              <CardTitle>Appointment overview</CardTitle>
              <CardDescription>Your appointment statuses at a glance.</CardDescription>
            </CardHeader>
            <CardContent className="flex h-75 items-center justify-center">
              <p className="text-sm text-muted-foreground">Appointment overview is unavailable.</p>
            </CardContent>
          </Card>
        ) : dashboardQuery.isPending ? (
          <Card className="h-[26rem] animate-pulse">
            <CardContent className="h-full bg-muted/40" />
          </Card>
        ) : (
          <AppointmentPieChart
            data={dashboardQuery.data?.data.appointmentStatusDistribution ?? []}
            title="Appointment overview"
            description="Your appointment statuses at a glance."
          />
        )}

        <Card>
          <CardHeader>
            <CardTitle>Quick actions</CardTitle>
            <CardDescription>Go directly to the tools you use most.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {quickLinks.map(({ title, description, href, action, icon: Icon }) => (
              <Card key={href} className="shadow-none">
                <CardContent className="flex h-full flex-col items-start gap-3 p-4">
                  <span className="inline-flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold">{title}</h3>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                  <Button
                    render={<Link href={href} />}
                    nativeButton={false}
                    variant="outline"
                    size="sm"
                    className="mt-auto"
                  >
                    {action}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

export default PatientDashboardContent
