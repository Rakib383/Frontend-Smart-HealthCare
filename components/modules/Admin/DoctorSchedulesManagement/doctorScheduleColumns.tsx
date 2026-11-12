import { Badge } from "@/components/ui/badge"
import DateCell from "@/components/shared/cell/DateCell"
import UserInfoCell from "@/components/shared/cell/UserInfoCell"
import type { DataTableFeatures } from "@/components/shared/table/DataTable"
import type { IDoctorSchedule } from "@/types/schedule.types"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

const formatTime = (value: string | Date) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "Invalid time" : format(date, "h:mm a")
}

export const doctorScheduleColumns: ColumnDef<DataTableFeatures, IDoctorSchedule>[] = [
  {
    id: "doctor",
    accessorFn: (assignment) => assignment.doctor?.name ?? assignment.doctorId,
    header: "Doctor",
    cell: ({ row }) => row.original.doctor ? (
      <UserInfoCell
        name={row.original.doctor.name}
        email={row.original.doctor.email}
        profilePhoto={row.original.doctor.profilePhoto ?? undefined}
      />
    ) : (
      <span className="font-medium">Doctor unavailable</span>
    ),
  },
  {
    id: "date",
    accessorFn: (assignment) => new Date(assignment.schedule.startDateTime).getTime(),
    header: "Date",
    cell: ({ row }) => <DateCell date={row.original.schedule.startDateTime} formatString="MMM dd, yyyy" />,
  },
  {
    id: "time",
    accessorFn: (assignment) => new Date(assignment.schedule.startDateTime).getTime(),
    header: "Time",
    cell: ({ row }) => (
      <span className="whitespace-nowrap text-sm">
        {formatTime(row.original.schedule.startDateTime)} – {formatTime(row.original.schedule.endDateTime)}
      </span>
    ),
  },
  {
    id: "status",
    accessorKey: "isBooked",
    header: "Availability",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={row.original.isBooked
          ? "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300"
          : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"}
      >
        {row.original.isBooked ? "Booked" : "Available"}
      </Badge>
    ),
  },
  {
    id: "assignedAt",
    accessorKey: "createdAt",
    header: "Assigned",
    cell: ({ row }) => <DateCell date={row.original.createdAt} formatString="MMM dd, yyyy" />,
  },
]
