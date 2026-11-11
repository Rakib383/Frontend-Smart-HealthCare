import DateCell from "@/components/shared/cell/DateCell"
import UserInfoCell from "@/components/shared/cell/UserInfoCell"
import type { DataTableFeatures } from "@/components/shared/table/DataTable"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { IManagedPatient } from "@/services/patient.services"
import type { ColumnDef } from "@tanstack/react-table"

export const getPatientColumns = (
  onStatusChange: (patient: IManagedPatient, status: "ACTIVE" | "BLOCKED") => void,
  statusUpdating: boolean,
): ColumnDef<DataTableFeatures, IManagedPatient>[] => [
  {
    id: "name",
    accessorKey: "name",
    header: "Patient",
    cell: ({ row }) => (
      <UserInfoCell
        name={row.original.name}
        email={row.original.email}
        profilePhoto={row.original.profilePhoto ?? undefined}
      />
    ),
  },
  {
    id: "contactNumber",
    accessorKey: "contactNumber",
    header: "Contact",
    enableSorting: false,
    cell: ({ row }) => row.original.contactNumber || "Not provided",
  },
  {
    id: "status",
    accessorKey: "user.status",
    header: "Status",
    enableSorting: false,
    cell: ({ row }) => (
      <Select
        value={row.original.user.status}
        onValueChange={(value) => {
          if (value === "ACTIVE" || value === "BLOCKED") {
            onStatusChange(row.original, value)
          }
        }}
        disabled={statusUpdating || row.original.user.status === "DELETED"}
      >
        <SelectTrigger aria-label={`Status for ${row.original.name}`} className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ACTIVE">Active</SelectItem>
          <SelectItem value="BLOCKED">Blocked</SelectItem>
        </SelectContent>
      </Select>
    ),
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => <DateCell date={row.original.createdAt} formatString="MMM dd, yyyy" />,
  },
]
