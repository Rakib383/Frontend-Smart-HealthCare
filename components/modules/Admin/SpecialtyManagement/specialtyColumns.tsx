import DateCell from "@/components/shared/cell/DateCell"
import type { DataTableFeatures } from "@/components/shared/table/DataTable"
import type { ISpecialtyOption } from "@/services/specialty.services"
import type { ColumnDef } from "@tanstack/react-table"

export const specialtyColumns: ColumnDef<DataTableFeatures, ISpecialtyOption>[] = [
  {
    accessorKey: "title",
    header: "Specialty",
    cell: ({ row }) => <span className="font-medium">{row.original.title}</span>,
  },
  {
    accessorKey: "description",
    header: "Description",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="block max-w-xl text-sm text-muted-foreground">
        {row.original.description?.trim() || "No description provided"}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => row.original.createdAt
      ? <DateCell date={row.original.createdAt} formatString="MMM dd, yyyy" />
      : <span className="text-sm text-muted-foreground">—</span>,
  },
]
