import DateCell from "@/components/shared/cell/DateCell"
import UserInfoCell from "@/components/shared/cell/UserInfoCell"
import type { DataTableFeatures } from "@/components/shared/table/DataTable"
import { Badge } from "@/components/ui/badge"
import type { IManagedPayment } from "@/services/payment.services"
import type { ColumnDef } from "@tanstack/react-table"
import { ExternalLink } from "lucide-react"

const getSafeInvoiceUrl = (value: string | null) => {
  if (!value) return null
  try {
    return new URL(value).protocol === "https:" ? value : null
  } catch {
    return null
  }
}

export const paymentColumns: ColumnDef<DataTableFeatures, IManagedPayment>[] = [
  {
    id: "patient",
    accessorFn: (payment) => payment.appointment.patient.name,
    header: "Patient",
    cell: ({ row }) => (
      <UserInfoCell
        name={row.original.appointment.patient.name}
        email={row.original.appointment.patient.email}
        profilePhoto={row.original.appointment.patient.profilePhoto ?? undefined}
      />
    ),
  },
  {
    id: "doctor",
    accessorFn: (payment) => payment.appointment.doctor.name,
    header: "Doctor",
    cell: ({ row }) => (
      <UserInfoCell
        name={row.original.appointment.doctor.name}
        email={row.original.appointment.doctor.email}
        profilePhoto={row.original.appointment.doctor.profilePhoto ?? undefined}
      />
    ),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <span className="whitespace-nowrap font-medium">
        {new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT" }).format(row.original.amount)}
      </span>
    ),
  },
  {
    id: "paymentDate",
    accessorKey: "createdAt",
    header: "Payment date",
    cell: ({ row }) => <DateCell date={row.original.createdAt} formatString="MMM dd, yyyy · h:mm a" />,
  },
  {
    id: "appointmentDate",
    accessorFn: (payment) => new Date(payment.appointment.schedule.startDateTime).getTime(),
    header: "Appointment",
    cell: ({ row }) => <DateCell date={row.original.appointment.schedule.startDateTime} formatString="MMM dd, yyyy · h:mm a" />,
  },
  {
    accessorKey: "transactionId",
    header: "Transaction ID",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="block max-w-44 break-all font-mono text-xs">{row.original.transactionId}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className={row.original.status === "PAID"
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"}
      >
        {row.original.status === "PAID" ? "Paid" : "Unpaid"}
      </Badge>
    ),
  },
  {
    id: "invoice",
    header: "Invoice",
    enableSorting: false,
    cell: ({ row }) => {
      const invoiceUrl = getSafeInvoiceUrl(row.original.invoiceUrl)
      return invoiceUrl ? (
        <a
          href={invoiceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          View invoice
          <ExternalLink className="size-3.5" aria-hidden="true" />
        </a>
      ) : (
        <span className="text-sm text-muted-foreground">Not available</span>
      )
    },
  },
]
