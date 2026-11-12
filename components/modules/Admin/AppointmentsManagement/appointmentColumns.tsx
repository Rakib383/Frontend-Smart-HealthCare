import { Badge } from "@/components/ui/badge"
import DateCell from "@/components/shared/cell/DateCell"
import UserInfoCell from "@/components/shared/cell/UserInfoCell"
import type { DataTableFeatures } from "@/components/shared/table/DataTable"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { AppointmentStatus, IManagedAppointment } from "@/services/appointment.services"
import type { ColumnDef } from "@tanstack/react-table"

const appointmentStatuses: AppointmentStatus[] = ["SCHEDULED", "INPROGRESS", "COMPLETED", "CANCELED"]

const isAppointmentStatus = (value: string | null): value is AppointmentStatus =>
  appointmentStatuses.some((status) => status === value)

const formatStatus = (status: AppointmentStatus) => {
  const labels: Record<AppointmentStatus, string> = {
    SCHEDULED: "Scheduled",
    INPROGRESS: "In progress",
    COMPLETED: "Completed",
    CANCELED: "Canceled",
  }
  return labels[status]
}

export const getAppointmentColumns = (
  onStatusChange: (appointment: IManagedAppointment, status: AppointmentStatus) => void,
  updating: boolean,
): ColumnDef<DataTableFeatures, IManagedAppointment>[] => [
  {
    id: "patient",
    accessorFn: (appointment) => appointment.patient.name,
    header: "Patient",
    cell: ({ row }) => (
      <UserInfoCell
        name={row.original.patient.name}
        email={row.original.patient.email}
        profilePhoto={row.original.patient.profilePhoto ?? undefined}
      />
    ),
  },
  {
    id: "doctor",
    accessorFn: (appointment) => appointment.doctor.name,
    header: "Doctor",
    cell: ({ row }) => (
      <UserInfoCell
        name={row.original.doctor.name}
        email={row.original.doctor.email}
        profilePhoto={row.original.doctor.profilePhoto ?? undefined}
      />
    ),
  },
  {
    id: "appointmentTime",
    accessorFn: (appointment) => new Date(appointment.schedule.startDateTime).getTime(),
    header: "Date & time",
    cell: ({ row }) => (
      <DateCell date={row.original.schedule.startDateTime} formatString="MMM dd, yyyy · h:mm a" />
    ),
  },
  {
    id: "fee",
    accessorFn: (appointment) => appointment.doctor.appointmentFee,
    header: "Fee",
    cell: ({ row }) => (
      <span className="whitespace-nowrap">
        {new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(row.original.doctor.appointmentFee)}
      </span>
    ),
  },
  {
    id: "paymentStatus",
    accessorKey: "paymentStatus",
    header: "Payment",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={row.original.paymentStatus === "PAID"
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"}
      >
        {row.original.paymentStatus === "PAID" ? "Paid" : "Unpaid"}
      </Badge>
    ),
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Appointment status",
    cell: ({ row }) => (
      <Select
        value={row.original.status}
        onValueChange={(value) => {
          if (isAppointmentStatus(value) && value !== row.original.status) {
            onStatusChange(row.original, value)
          }
        }}
        disabled={updating}
      >
        <SelectTrigger aria-label={`Appointment status for ${row.original.patient.name}`} className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {appointmentStatuses.map((status) => (
            <SelectItem key={status} value={status}>{formatStatus(status)}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    ),
  },
]
