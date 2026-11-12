"use client"

import DataTable from "@/components/shared/table/DataTable"
import useManagementTable from "@/components/shared/table/useManagementTable"
import { Button } from "@/components/ui/button"
import { getAllPrescriptions } from "@/services/prescription.services"
import type { IManagedPrescription } from "@/services/prescription.services"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { useState } from "react"
import PrescriptionDetailsDialog from "./PrescriptionDetailsDialog"
import { prescriptionColumns } from "./prescriptionColumns"

type SearchParams = Record<string, string | string[] | undefined>

interface PrescriptionsTableProps {
  queryString: string
  queryParams: SearchParams
}

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "Could not load prescriptions. Please try again."
  }
  return error instanceof Error ? error.message : "Could not load prescriptions. Please try again."
}

export default function PrescriptionsTable({ queryString, queryParams }: PrescriptionsTableProps) {
  const [viewingPrescription, setViewingPrescription] = useState<IManagedPrescription | null>(null)
  const prescriptionsQuery = useQuery({
    queryKey: ["prescriptions", queryParams],
    queryFn: () => getAllPrescriptions(queryString),
  })

  const prescriptions = prescriptionsQuery.data?.data ?? []
  const paginationMeta = prescriptionsQuery.data?.meta
  const { page, pageSize, searchTerm, handlePageChange, handlePageSizeChange, handleSearch } = useManagementTable({
    queryParams,
    pageInfo: {
      page: paginationMeta?.page,
      pageSize: paginationMeta?.limit,
    },
  })

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Prescriptions</h1>
        <p className="text-sm text-muted-foreground">
          Review prescriptions issued by doctors, including patient instructions and follow-up dates.
        </p>
      </header>

      {prescriptionsQuery.isError ? (
        <div className="space-y-3 rounded-lg border border-destructive/40 p-4" role="alert">
          <p className="text-sm text-destructive">{getErrorMessage(prescriptionsQuery.error)}</p>
          <Button type="button" variant="outline" size="sm" onClick={() => void prescriptionsQuery.refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <DataTable
          columns={prescriptionColumns}
          data={prescriptions}
          actions={{ onView: setViewingPrescription }}
          isLoading={prescriptionsQuery.isLoading || prescriptionsQuery.isFetching}
          emptyMessage="No prescriptions match your search."
          search={{
            value: searchTerm,
            onChange: handleSearch,
            placeholder: "Search patients, doctors, or instructions...",
            debounceMs: 400,
          }}
          pagination={{
            page,
            pageSize,
            total: paginationMeta?.total ?? prescriptions.length,
            totalPages: Math.max(1, paginationMeta?.totalPages ?? 1),
            onPageChange: handlePageChange,
            onPageSizeChange: handlePageSizeChange,
          }}
        />
      )}

      <PrescriptionDetailsDialog
        prescription={viewingPrescription}
        open={viewingPrescription !== null}
        onOpenChange={(open) => {
          if (!open) setViewingPrescription(null)
        }}
      />
    </div>
  )
}
