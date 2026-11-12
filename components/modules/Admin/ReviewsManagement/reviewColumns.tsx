import DateCell from "@/components/shared/cell/DateCell"
import UserInfoCell from "@/components/shared/cell/UserInfoCell"
import type { DataTableFeatures } from "@/components/shared/table/DataTable"
import type { IManagedReview } from "@/services/review.services"
import type { ColumnDef } from "@tanstack/react-table"
import ReviewRating from "./ReviewRating"

export const reviewColumns: ColumnDef<DataTableFeatures, IManagedReview>[] = [
  {
    id: "patient",
    accessorFn: (review) => review.patient.name,
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
    accessorFn: (review) => review.doctor.name,
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
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => <ReviewRating rating={row.original.rating} />,
  },
  {
    id: "appointmentDate",
    accessorFn: (review) => new Date(review.appointment.schedule.startDateTime).getTime(),
    header: "Appointment",
    cell: ({ row }) => (
      <DateCell date={row.original.appointment.schedule.startDateTime} formatString="MMM dd, yyyy · h:mm a" />
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Reviewed",
    cell: ({ row }) => <DateCell date={row.original.createdAt} formatString="MMM dd, yyyy" />,
  },
  {
    accessorKey: "comment",
    header: "Comment",
    enableSorting: false,
    cell: ({ row }) => (
      <p className="max-w-64 truncate text-sm text-muted-foreground" title={row.original.comment ?? undefined}>
        {row.original.comment?.trim() || "No written comment"}
      </p>
    ),
  },
]
