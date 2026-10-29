import type { DataTableFeatures } from "@/components/shared/table/DataTable"
import DateCell from "@/components/shared/cell/DateCell"
import { Badge } from "@/components/ui/badge"
import type { IDoctorSchedule } from "@/types/schedule.types"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

const formatTime = (value: string | Date) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "Unavailable" : format(date, "h:mm a")
}

export const doctorScheduleColumns: ColumnDef<DataTableFeatures, IDoctorSchedule>[] = [
  {
    id: "date",
    accessorFn: (entry) => new Date(entry.schedule.startDateTime).getTime(),
    header: "Date",
    cell: ({ row }) => <DateCell date={row.original.schedule.startDateTime} formatString="EEE, MMM dd, yyyy" />,
  },
  {
    id: "startDateTime",
    accessorFn: (entry) => new Date(entry.schedule.startDateTime).getTime(),
    header: "Start time",
    cell: ({ row }) => <span className="text-sm">{formatTime(row.original.schedule.startDateTime)}</span>,
  },
  {
    id: "endDateTime",
    accessorFn: (entry) => new Date(entry.schedule.endDateTime).getTime(),
    header: "End time",
    cell: ({ row }) => <span className="text-sm">{formatTime(row.original.schedule.endDateTime)}</span>,
  },
  {
    id: "status",
    accessorKey: "isBooked",
    header: "Availability",
    enableSorting: false,
    cell: ({ row }) => (
      <Badge variant={row.original.isBooked ? "secondary" : "outline"}>
        {row.original.isBooked ? "Booked" : "Available"}
      </Badge>
    ),
  },
]
