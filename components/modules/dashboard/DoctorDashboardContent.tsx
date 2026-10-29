"use client"

import AppointmentPieChart from "@/components/shared/AppointmentPieChart"
import StatsCard from "@/components/shared/StatsCard"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getDoctorDashboardData } from "@/services/dashboard.services"
import { useQuery } from "@tanstack/react-query"
import { CalendarDays, Clock3, FileText, Star } from "lucide-react"
import Link from "next/link"

const doctorShortcuts = [
  {
    title: "Appointments",
    description: "Review and manage your patient appointments.",
    href: "/doctor/dashboard/appointments",
    icon: CalendarDays,
    action: "View appointments",
  },
  {
    title: "My schedule",
    description: "Manage the future time slots patients can book.",
    href: "/doctor/dashboard/my-schedules",
    icon: Clock3,
    action: "Manage availability",
  },
  {
    title: "Prescriptions",
    description: "Access prescriptions associated with your care.",
    href: "/doctor/dashboard/prescriptions",
    icon: FileText,
    action: "View prescriptions",
  },
  {
    title: "My reviews",
    description: "See feedback patients have left for you.",
    href: "/doctor/dashboard/my-reviews",
    icon: Star,
    action: "View reviews",
  },
]

const DoctorDashboardContent = () => {
  const { data: response, isLoading, isError } = useQuery({
    queryKey: ["doctor-dashboard-data"],
    queryFn: getDoctorDashboardData,
    refetchOnWindowFocus: true,
  })

  const data = response?.data

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Doctor dashboard</h1>
        <p className="text-sm text-muted-foreground">
          A summary of your practice and quick access to your daily work.
        </p>
      </header>

      {isError && (
        <Alert variant="destructive">
          <AlertDescription role="alert">
            We couldn’t load your dashboard statistics. Please refresh the page to try again.
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Loading doctor dashboard statistics">
          {Array.from({ length: 4 }, (_, index) => (
            <Card key={index} className="h-32 animate-pulse">
              <CardContent className="h-full bg-muted/40" />
            </Card>
          ))}
        </div>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Practice statistics">
          <StatsCard
            title="Appointments"
            value={data?.appointmentCount ?? 0}
            iconName="CalendarDays"
            description="Appointments assigned to you"
          />
          <StatsCard
            title="Patients"
            value={data?.patientCount ?? 0}
            iconName="Users"
            description="Patients you have seen"
          />
          <StatsCard
            title="Reviews"
            value={data?.reviewCount ?? 0}
            iconName="Star"
            description="Reviews from your patients"
          />
          <StatsCard
            title="Paid earnings"
            value={`$${(data?.totalRevenue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            iconName="CreditCard"
            description="From completed paid appointments"
          />
        </section>
      )}

      <section className="grid gap-4 lg:grid-cols-2">
        <AppointmentPieChart
          data={data?.appointmentStatusDistribution ?? []}
          title="Appointment status"
          description="How your appointments are currently distributed"
        />
        <Card>
          <CardHeader>
            <CardTitle>Quick access</CardTitle>
            <CardDescription>Go directly to the tools you use most.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {doctorShortcuts.map(({ title, description, href, icon: Icon, action }) => (
              <Card key={href} className="shadow-none">
                <CardContent className="flex h-full flex-col items-start gap-3 p-4">
                  <span className="inline-flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold">{title}</h3>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                  <Button render={<Link href={href} />} nativeButton={false} variant="outline" size="sm" className="mt-auto">
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

export default DoctorDashboardContent
