"use client"

import DataTable from "@/components/shared/table/DataTable"
import useManagementTable from "@/components/shared/table/useManagementTable"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/toast"
import { deleteMyDoctorSchedule, getMyDoctorScheduleIds, getMyDoctorSchedules } from "@/services/schedule.services"
import type { IDoctorSchedule } from "@/types/schedule.types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { Plus } from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"
import CreateAvailabilityDialog from "./CreateAvailabilityDialog"
import { doctorScheduleColumns } from "./doctorScheduleColumns"

interface MySchedulesProps {
  queryString: string
  queryParams: Record<string, string | string[] | undefined>
}

const formatSlot = (schedule: IDoctorSchedule) => {
  const start = new Date(schedule.schedule.startDateTime)
  const end = new Date(schedule.schedule.endDateTime)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "this time slot"
  return `${format(start, "MMM d, yyyy")} from ${format(start, "h:mm a")} to ${format(end, "h:mm a")}`
}

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "We couldn’t remove this time from your schedule. Please try again."
  }
  return "We couldn’t remove this time from your schedule. Please try again."
}

const MySchedules = ({ queryString, queryParams }: MySchedulesProps) => {
  const queryClient = useQueryClient()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [scheduleToRemove, setScheduleToRemove] = useState<IDoctorSchedule | null>(null)
  const [removeError, setRemoveError] = useState("")

  const { data: response, isFetching, isError } = useQuery({
    queryKey: ["my-doctor-schedules", queryParams],
    queryFn: () => getMyDoctorSchedules(queryString),
  })
  const { data: allAssignedScheduleIds = [], isLoading: isLoadingAssignedIds, isError: hasAssignedIdsError } = useQuery({
    queryKey: ["my-doctor-schedule-ids"],
    queryFn: getMyDoctorScheduleIds,
    staleTime: 30 * 1000,
  })

  const schedules = response?.data ?? []
  const paginationMeta = response?.meta
  const {
    page,
    pageSize,
    handlePageChange,
    handlePageSizeChange,
  } = useManagementTable({
    queryParams,
    pageInfo: {
      page: paginationMeta?.page,
      pageSize: paginationMeta?.limit,
    },
  })

  const removeMutation = useMutation({
    mutationFn: deleteMyDoctorSchedule,
    onSuccess: async (result) => {
      if (!result.success) {
        setRemoveError(result.message || "This time slot could not be removed.")
        return
      }

      await queryClient.invalidateQueries({ queryKey: ["my-doctor-schedules"] })
      await queryClient.invalidateQueries({ queryKey: ["my-doctor-schedule-ids"] })
      setScheduleToRemove(null)
      toast.add({
        title: "Availability removed",
        description: "The time slot was removed from your schedule.",
        type: "success",
      })
    },
    onError: (error) => setRemoveError(getErrorMessage(error)),
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My schedule</h1>
          <p className="text-sm text-muted-foreground">
            Manage the future time slots patients can book with you.
          </p>
        </div>
        <Button type="button" onClick={() => setIsCreateOpen(true)}>
          <Plus aria-hidden="true" />
          Add availability
        </Button>
      </div>

      <Alert>
        <AlertDescription>
          You can add future slots created by the administrator. Booked times remain on your schedule and can’t be removed here.
        </AlertDescription>
      </Alert>

      {isError && (
        <Alert variant="destructive">
          <AlertDescription role="alert">Couldn’t load your schedule. Please refresh the page and try again.</AlertDescription>
        </Alert>
      )}

      <DataTable
        columns={doctorScheduleColumns}
        data={schedules}
        actions={{
          onDelete: (schedule) => {
            setRemoveError("")
            setScheduleToRemove(schedule)
          },
          canDelete: (schedule) => !schedule.isBooked,
        }}
        emptyMessage="You haven’t added any availability yet."
        isLoading={isFetching}
        pagination={{
          page,
          pageSize,
          total: paginationMeta?.total ?? schedules.length,
          totalPages: Math.max(1, paginationMeta?.totalPages ?? 1),
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange,
        }}
      />

      <CreateAvailabilityDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        assignedScheduleIds={allAssignedScheduleIds}
        isLoadingAssignedIds={isLoadingAssignedIds}
        hasAssignedIdsError={hasAssignedIdsError}
      />

      <AlertDialog
        open={scheduleToRemove !== null}
        onOpenChange={(open) => {
          if (!removeMutation.isPending && !open) {
            setScheduleToRemove(null)
            setRemoveError("")
          }
        }}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this availability?</AlertDialogTitle>
            <AlertDialogDescription>
              Remove {scheduleToRemove ? formatSlot(scheduleToRemove) : "this time slot"} from your schedule? This won’t delete the shared schedule slot.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {removeError && (
            <Alert variant="destructive">
              <AlertDescription>{removeError}</AlertDescription>
            </Alert>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={removeMutation.isPending} onClick={() => setRemoveError("")}>
              Cancel
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={!scheduleToRemove || scheduleToRemove.isBooked || removeMutation.isPending}
              onClick={() => {
                if (scheduleToRemove && !scheduleToRemove.isBooked) {
                  removeMutation.mutate(scheduleToRemove.scheduleId)
                }
              }}
            >
              {removeMutation.isPending ? "Removing..." : "Remove availability"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default MySchedules
