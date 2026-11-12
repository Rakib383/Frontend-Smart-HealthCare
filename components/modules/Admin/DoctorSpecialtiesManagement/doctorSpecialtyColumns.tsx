import UserInfoCell from "@/components/shared/cell/UserInfoCell"
import type { DataTableFeatures } from "@/components/shared/table/DataTable"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { IDoctor } from "@/types/doctor.types"
import type { ColumnDef } from "@tanstack/react-table"
import { Pencil } from "lucide-react"
import { getDoctorSpecialtyAssignments } from "./specialtyAssignment"
import type { ISpecialtyOption } from "@/services/specialty.services"

export const getDoctorSpecialtyColumns = (
  specialties: ISpecialtyOption[],
  onManage: (doctor: IDoctor) => void,
): ColumnDef<DataTableFeatures, IDoctor>[] => [
  {
    accessorKey: "name",
    header: "Doctor",
    cell: ({ row }) => (
      <UserInfoCell
        name={row.original.name}
        email={row.original.email}
        profilePhoto={row.original.profilePhoto}
      />
    ),
  },
  {
    id: "specialties",
    accessorFn: (doctor) => getDoctorSpecialtyAssignments(doctor, specialties)
      .map((assignment) => assignment.title)
      .join(", "),
    header: "Assigned specialties",
    enableSorting: false,
    cell: ({ row }) => {
      const assignments = getDoctorSpecialtyAssignments(row.original, specialties)
      if (assignments.length === 0) {
        return <span className="text-sm text-muted-foreground">No specialties assigned</span>
      }

      return (
        <div className="flex max-w-xl flex-wrap gap-1">
          {assignments.map((assignment, index) => (
            <Badge
              key={`${assignment.id || assignment.title}-${index}`}
              variant="secondary"
              className="h-auto min-h-5 whitespace-normal"
            >
              {assignment.title}
            </Badge>
          ))}
        </div>
      )
    },
  },
  {
    id: "specialtyCount",
    accessorFn: (doctor) => getDoctorSpecialtyAssignments(doctor, specialties).length,
    header: "Count",
    cell: ({ row }) => <span className="tabular-nums">{getDoctorSpecialtyAssignments(row.original, specialties).length}</span>,
  },
  {
    id: "manage",
    header: "Manage",
    enableSorting: false,
    cell: ({ row }) => (
      <Button type="button" variant="outline" size="sm" onClick={() => onManage(row.original)}>
        <Pencil aria-hidden="true" />
        Edit specialties
      </Button>
    ),
  },
]
