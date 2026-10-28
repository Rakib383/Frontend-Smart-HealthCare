import type { DataTableFeatures } from "@/components/shared/table/DataTable"
import DateCell from "@/components/shared/cell/DateCell"
import type { ISchedule } from "@/types/schedule.types"
import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"

const formatTime = (value: string | Date) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "Invalid time" : format(date, "h:mm a")
}

export const scheduleColumns: ColumnDef<DataTableFeatures, ISchedule>[] = [
  {
    id: "date",
    accessorFn: (schedule) => new Date(schedule.startDateTime).getTime(),
    header: "Date",
    cell: ({ row }) => <DateCell date={row.original.startDateTime} formatString="MMM dd, yyyy" />,
  },
  {
    id: "startDateTime",
    accessorFn: (schedule) => new Date(schedule.startDateTime).getTime(),
    header: "Start time",
    cell: ({ row }) => <span className="text-sm">{formatTime(row.original.startDateTime)}</span>,
  },
  {
    id: "endDateTime",
    accessorFn: (schedule) => new Date(schedule.endDateTime).getTime(),
    header: "End time",
    cell: ({ row }) => <span className="text-sm">{formatTime(row.original.endDateTime)}</span>,
  },
  {
    id: "duration",
    accessorFn: (schedule) => {
      const duration = new Date(schedule.endDateTime).getTime() - new Date(schedule.startDateTime).getTime()
      return Number.isFinite(duration) ? Math.round(duration / 60000) : 0
    },
    header: "Duration",
    enableSorting: false,
    cell: ({ row }) => {
      const duration = Math.round(
        (new Date(row.original.endDateTime).getTime() - new Date(row.original.startDateTime).getTime()) / 60000,
      )
      return <span className="text-sm">{duration > 0 ? `${duration} minutes` : "Unavailable"}</span>
    },
  },
  {
    id: "createdAt",
    accessorFn: (schedule) => new Date(schedule.createdAt).getTime(),
    header: "Created",
    cell: ({ row }) => <DateCell date={row.original.createdAt} formatString="MMM dd, yyyy" />,
  },
]
