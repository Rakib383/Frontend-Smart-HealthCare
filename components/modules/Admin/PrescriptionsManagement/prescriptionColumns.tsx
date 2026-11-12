import DateCell from "@/components/shared/cell/DateCell"
import UserInfoCell from "@/components/shared/cell/UserInfoCell"
import type { DataTableFeatures } from "@/components/shared/table/DataTable"
import type { IManagedPrescription } from "@/services/prescription.services"
import type { ColumnDef } from "@tanstack/react-table"

export const prescriptionColumns: ColumnDef<DataTableFeatures, IManagedPrescription>[] = [
  {
    id: "patient",
    accessorFn: (prescription) => prescription.patient.name,
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
    accessorFn: (prescription) => prescription.doctor.name,
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
    id: "appointmentDate",
    accessorFn: (prescription) => new Date(prescription.appointment.schedule.startDateTime).getTime(),
    header: "Appointment",
    cell: ({ row }) => (
      <DateCell date={row.original.appointment.schedule.startDateTime} formatString="MMM dd, yyyy · h:mm a" />
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Issued",
    cell: ({ row }) => <DateCell date={row.original.createdAt} formatString="MMM dd, yyyy" />,
  },
  {
    accessorKey: "followUpDate",
    header: "Follow-up",
    cell: ({ row }) => <DateCell date={row.original.followUpDate} formatString="MMM dd, yyyy" />,
  },
  {
    accessorKey: "instructions",
    header: "Instructions",
    enableSorting: false,
    cell: ({ row }) => (
      <p className="max-w-64 truncate text-sm text-muted-foreground" title={row.original.instructions}>
        {row.original.instructions}
      </p>
    ),
  },
]
