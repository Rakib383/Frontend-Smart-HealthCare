"use client"

import DataTable from "@/components/shared/table/DataTable"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/toast"
import {
  changeAppointmentStatus,
  getAllAppointments,
  type AppointmentStatus,
  type IManagedAppointment,
} from "@/services/appointment.services"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { CalendarDays, CheckCircle2, Clock3, XCircle } from "lucide-react"
import { useMemo, useState } from "react"
import { getAppointmentColumns } from "./appointmentColumns"

const EMPTY_APPOINTMENTS: IManagedAppointment[] = []
const PAGE_SIZE = 10

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "The request could not be completed. Please try again."
  }
  return error instanceof Error ? error.message : "The request could not be completed. Please try again."
}

export default function AppointmentsTable() {
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [page, setPage] = useState(1)
  const appointmentsQuery = useQuery({
    queryKey: ["appointments", "all"],
    queryFn: getAllAppointments,
  })

  const statusMutation = useMutation({
    mutationFn: ({ appointmentId, status }: { appointmentId: string; status: AppointmentStatus }) =>
      changeAppointmentStatus(appointmentId, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["appointments", "all"] })
      toast.add({ title: "Appointment status updated", type: "success" })
    },
    onError: (error) => toast.add({
      title: "Could not update appointment",
      description: getErrorMessage(error),
      type: "error",
    }),
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
    const term = searchTerm.trim().toLowerCase()
    return appointments.filter((appointment) => {
      const matchesStatus = statusFilter === "ALL" || appointment.status === statusFilter
      const matchesSearch = !term || [
        appointment.patient.name,
        appointment.patient.email,
        appointment.doctor.name,
        appointment.doctor.email,
      ].some((value) => value.toLowerCase().includes(term))
      return matchesStatus && matchesSearch
    })
  }, [appointments, searchTerm, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / PAGE_SIZE))
  const visibleAppointments = filteredAppointments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const columns = getAppointmentColumns(
    (appointment, status) => statusMutation.mutate({ appointmentId: appointment.id, status }),
    statusMutation.isPending,
  )

  const summaryCards = [
    { label: "Total appointments", value: counts.total, icon: CalendarDays, iconClass: "text-primary" },
    { label: "Scheduled", value: counts.scheduled, icon: Clock3, iconClass: "text-amber-600" },
    { label: "In progress", value: counts.inProgress, icon: Clock3, iconClass: "text-blue-600" },
    { label: "Completed", value: counts.completed, icon: CheckCircle2, iconClass: "text-emerald-600" },
    { label: "Canceled", value: counts.canceled, icon: XCircle, iconClass: "text-muted-foreground" },
  ]

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Appointments</h1>
        <p className="text-sm text-muted-foreground">
          Review appointment details, track payments, and update appointment status.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5" aria-label="Appointment summary">
        {summaryCards.map(({ label, value, icon: Icon, iconClass }) => (
          <Card key={label} size="sm">
            <CardContent className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-2xl font-semibold tabular-nums">{value}</p>
              </div>
              <Icon className={`size-5 ${iconClass}`} aria-hidden="true" />
            </CardContent>
          </Card>
        ))}
      </section>

      {appointmentsQuery.isError ? (
        <div className="space-y-3 rounded-lg border border-destructive/40 p-4" role="alert">
          <p className="text-sm text-destructive">{getErrorMessage(appointmentsQuery.error)}</p>
          <Button type="button" variant="outline" size="sm" onClick={() => void appointmentsQuery.refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={visibleAppointments}
          isLoading={appointmentsQuery.isLoading || appointmentsQuery.isFetching}
          emptyMessage="No appointments match your search."
          search={{
            value: searchTerm,
            onChange: (value) => {
              setSearchTerm(value)
              setPage(1)
            },
            placeholder: "Search patients or doctors...",
            debounceMs: 400,
          }}
          toolbar={(
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                if (value) {
                  setStatusFilter(value)
                  setPage(1)
                }
              }}
            >
              <SelectTrigger aria-label="Filter appointments by status" className="w-full sm:w-44">
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
          )}
          pagination={{
            page,
            pageSize: PAGE_SIZE,
            total: filteredAppointments.length,
            totalPages,
            onPageChange: setPage,
            onPageSizeChange: () => setPage(1),
          }}
        />
      )}
    </div>
  )
}
