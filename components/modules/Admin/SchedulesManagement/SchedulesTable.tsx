
"use client"

import DataTable from "@/components/shared/table/DataTable"
import useManagementTable from "@/components/shared/table/useManagementTable"
import { Button } from "@/components/ui/button"
import { getSchedules } from "@/services/schedule.services"
import type { ISchedule } from "@/types/schedule.types"
import { useQuery } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { useState } from "react"
import DeleteScheduleDialog from "./DeleteScheduleDialog"
import ScheduleDialog from "./ScheduleDialog"
import { scheduleColumns } from "./scheduleColumns"

interface SchedulesTableProps {
  queryString: string
  queryParams: Record<string, string | string[] | undefined>
}

const SchedulesTable = ({ queryString, queryParams }: SchedulesTableProps) => {
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false)
  const [scheduleToEdit, setScheduleToEdit] = useState<ISchedule | null>(null)
  const [scheduleToDelete, setScheduleToDelete] = useState<ISchedule | null>(null)
  const { data: response, isFetching, isError } = useQuery({
    queryKey: ["schedules", queryParams],
    queryFn: () => getSchedules(queryString),
  })

  const schedules = response?.data ?? []
  const paginationMeta = response?.meta
  const {
    page,
    pageSize,
    searchTerm,
    handlePageChange,
    handlePageSizeChange,
    handleSearch,
  } = useManagementTable({
    queryParams,
    pageInfo: {
      page: paginationMeta?.page,
      pageSize: paginationMeta?.limit,
    },
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Schedules</h1>
          <p className="text-sm text-muted-foreground">Manage shared 30-minute schedule slots used by doctors.</p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setScheduleToEdit(null)
            setScheduleDialogOpen(true)
          }}
        >
          <Plus aria-hidden="true" />
          Create schedules
        </Button>
      </div>

      {isError && (
        <div role="alert" className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Couldn’t load schedules. Please refresh the page and try again.
        </div>
      )}

      <DataTable
        columns={scheduleColumns}
        data={schedules}
        actions={{
          onEdit: (schedule) => {
            setScheduleToEdit(schedule)
            setScheduleDialogOpen(true)
          },
          onDelete: setScheduleToDelete,
        }}
        emptyMessage="No schedule slots found."
        isLoading={isFetching}
        search={{
          value: searchTerm,
          onChange: handleSearch,
          placeholder: "Search schedule slots...",
          debounceMs: 400,
        }}
        pagination={{
          page,
          pageSize,
          total: paginationMeta?.total ?? schedules.length,
          totalPages: Math.max(1, paginationMeta?.totalPages ?? 1),
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange,
        }}
      />

      {scheduleDialogOpen && (
        <ScheduleDialog
          key={scheduleToEdit?.id ?? "create-schedules"}
          schedule={scheduleToEdit}
          open
          onOpenChange={(open) => {
            if (!open) {
              setScheduleDialogOpen(false)
              setScheduleToEdit(null)
            }
          }}
        />
      )}

      <DeleteScheduleDialog
        schedule={scheduleToDelete}
        open={scheduleToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setScheduleToDelete(null)
        }}
      />
    </div>
  )
}

export default SchedulesTable
