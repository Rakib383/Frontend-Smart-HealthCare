"use client"

import DataTable from "@/components/shared/table/DataTable"
import useManagementTable from "@/components/shared/table/useManagementTable"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getAllDoctorSchedules } from "@/services/schedule.services"
import type { IDoctorSchedule } from "@/types/schedule.types"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { doctorScheduleColumns } from "./doctorScheduleColumns"

type SearchParams = Record<string, string | string[] | undefined>

const EMPTY_DOCTOR_SCHEDULES: IDoctorSchedule[] = []

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "Could not load doctor schedules. Please try again."
  }
  return error instanceof Error ? error.message : "Could not load doctor schedules. Please try again."
}

interface DoctorSchedulesTableProps {
  queryString: string
  queryParams: SearchParams
}

export default function DoctorSchedulesTable({ queryString, queryParams }: DoctorSchedulesTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const schedulesQuery = useQuery({
    queryKey: ["doctor-schedules", queryParams],
    queryFn: () => getAllDoctorSchedules(queryString),
  })

  const assignments = schedulesQuery.data?.data ?? EMPTY_DOCTOR_SCHEDULES
  const paginationMeta = schedulesQuery.data?.meta
  const { page, pageSize, searchTerm, handlePageChange, handlePageSizeChange, handleSearch } = useManagementTable({
    queryParams,
    pageInfo: {
      page: paginationMeta?.page,
      pageSize: paginationMeta?.limit,
    },
  })

  const rawBookedFilter = queryParams.isBooked
  const bookedFilter = Array.isArray(rawBookedFilter) ? rawBookedFilter[0] ?? "ALL" : rawBookedFilter ?? "ALL"

  const handleBookedFilterChange = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (!value || value === "ALL") {
      params.delete("isBooked")
    } else {
      params.set("isBooked", value)
    }
    params.set("page", "1")
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Doctor schedules</h1>
        <p className="text-sm text-muted-foreground">
          Review each doctor’s assigned time slots and see which ones are booked or available.
        </p>
      </header>

      {schedulesQuery.isError ? (
        <div className="space-y-3 rounded-lg border border-destructive/40 p-4" role="alert">
          <p className="text-sm text-destructive">{getErrorMessage(schedulesQuery.error)}</p>
          <Button type="button" variant="outline" size="sm" onClick={() => void schedulesQuery.refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <DataTable
          columns={doctorScheduleColumns}
          data={assignments}
          isLoading={schedulesQuery.isLoading || schedulesQuery.isFetching}
          emptyMessage="No doctor schedule assignments found."
          search={{
            value: searchTerm,
            onChange: handleSearch,
            placeholder: "Search doctors or schedule IDs...",
            debounceMs: 400,
          }}
          toolbar={(
            <Select value={bookedFilter} onValueChange={handleBookedFilterChange}>
              <SelectTrigger aria-label="Filter by availability" className="w-full sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All availability</SelectItem>
                <SelectItem value="false">Available</SelectItem>
                <SelectItem value="true">Booked</SelectItem>
              </SelectContent>
            </Select>
          )}
          pagination={{
            page,
            pageSize,
            total: paginationMeta?.total ?? assignments.length,
            totalPages: Math.max(1, paginationMeta?.totalPages ?? 1),
            onPageChange: handlePageChange,
            onPageSizeChange: handlePageSizeChange,
          }}
        />
      )}
    </div>
  )
}
