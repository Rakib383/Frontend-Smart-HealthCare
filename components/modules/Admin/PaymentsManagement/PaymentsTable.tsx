"use client"

import DataTable from "@/components/shared/table/DataTable"
import useManagementTable from "@/components/shared/table/useManagementTable"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getAllPayments } from "@/services/payment.services"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { paymentColumns } from "./paymentColumns"

type SearchParams = Record<string, string | string[] | undefined>

interface PaymentsTableProps {
  queryString: string
  queryParams: SearchParams
}

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "Could not load payments. Please try again."
  }
  return error instanceof Error ? error.message : "Could not load payments. Please try again."
}

export default function PaymentsTable({ queryString, queryParams }: PaymentsTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const paymentsQuery = useQuery({
    queryKey: ["payments", queryParams],
    queryFn: () => getAllPayments(queryString),
  })

  const payments = paymentsQuery.data?.data ?? []
  const paginationMeta = paymentsQuery.data?.meta
  const { page, pageSize, searchTerm, handlePageChange, handlePageSizeChange, handleSearch } = useManagementTable({
    queryParams,
    pageInfo: {
      page: paginationMeta?.page,
      pageSize: paginationMeta?.limit,
    },
  })
  const requestedStatus = Array.isArray(queryParams.status) ? queryParams.status[0] : queryParams.status
  const selectedStatus = requestedStatus === "PAID" || requestedStatus === "UNPAID" ? requestedStatus : "ALL"

  const handleStatusFilterChange = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (!value || value === "ALL") {
      params.delete("status")
    } else {
      params.set("status", value)
    }
    params.set("page", "1")
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Payments</h1>
        <p className="text-sm text-muted-foreground">
          Review payment records, transaction details, appointment information, and available invoices.
        </p>
      </header>

      {paymentsQuery.isError ? (
        <div className="space-y-3 rounded-lg border border-destructive/40 p-4" role="alert">
          <p className="text-sm text-destructive">{getErrorMessage(paymentsQuery.error)}</p>
          <Button type="button" variant="outline" size="sm" onClick={() => void paymentsQuery.refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <DataTable
          columns={paymentColumns}
          data={payments}
          isLoading={paymentsQuery.isLoading || paymentsQuery.isFetching}
          emptyMessage="No payment records found."
          search={{
            value: searchTerm,
            onChange: handleSearch,
            placeholder: "Search patients, doctors, or transactions...",
            debounceMs: 400,
          }}
          toolbar={(
            <Select value={selectedStatus} onValueChange={handleStatusFilterChange}>
              <SelectTrigger aria-label="Filter payments by status" className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="UNPAID">Unpaid</SelectItem>
              </SelectContent>
            </Select>
          )}
          pagination={{
            page,
            pageSize,
            total: paginationMeta?.total ?? payments.length,
            totalPages: Math.max(1, paginationMeta?.totalPages ?? 1),
            onPageChange: handlePageChange,
            onPageSizeChange: handlePageSizeChange,
          }}
        />
      )}
    </div>
  )
}
