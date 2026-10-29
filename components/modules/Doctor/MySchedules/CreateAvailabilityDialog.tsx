"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { createMyDoctorSchedules, getSchedules } from "@/services/schedule.services"
import type { ISchedule } from "@/types/schedule.types"
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { format } from "date-fns"
import { useMemo, useState } from "react"

interface CreateAvailabilityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assignedScheduleIds: string[]
  isLoadingAssignedIds: boolean
  hasAssignedIdsError: boolean
}

const PAGE_SIZE = 100

const formatSlot = (schedule: ISchedule) => {
  const start = new Date(schedule.startDateTime)
  const end = new Date(schedule.endDateTime)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "Invalid schedule slot"
  return `${format(start, "EEE, MMM d, yyyy")} · ${format(start, "h:mm a")}–${format(end, "h:mm a")}`
}

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "We couldn’t add these times to your schedule. Please try again."
  }
  return "We couldn’t add these times to your schedule. Please try again."
}

const CreateAvailabilityDialog = ({
  open,
  onOpenChange,
  assignedScheduleIds,
  isLoadingAssignedIds,
  hasAssignedIdsError,
}: CreateAvailabilityDialogProps) => {
  const queryClient = useQueryClient()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [search, setSearch] = useState("")
  const [formError, setFormError] = useState("")

  const availableSlotsQuery = useInfiniteQuery({
    queryKey: ["available-schedule-slots"],
    queryFn: async ({ pageParam }) => {
      const response = await getSchedules(new URLSearchParams({
        page: String(pageParam),
        limit: String(PAGE_SIZE),
        sortBy: "startDateTime",
        sortOrder: "desc",
      }).toString())
      const now = Date.now()
      return {
        ...response,
        data: response.data.filter((schedule) => new Date(schedule.startDateTime).getTime() >= now),
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const currentPage = lastPage.meta?.page ?? 1
      const totalPages = lastPage.meta?.totalPages ?? currentPage
      return currentPage < totalPages ? currentPage + 1 : undefined
    },
    enabled: open,
  })

  const assignedIds = useMemo(() => new Set(assignedScheduleIds), [assignedScheduleIds])
  const slots = (availableSlotsQuery.data?.pages ?? [])
    .flatMap((page) => page.data)
    .filter((schedule) => !assignedIds.has(schedule.id))
  const normalizedSearch = search.trim().toLowerCase()
  const filteredSlots = normalizedSearch
    ? slots.filter((schedule) => formatSlot(schedule).toLowerCase().includes(normalizedSearch))
    : slots

  const createMutation = useMutation({
    mutationFn: createMyDoctorSchedules,
    onSuccess: async (response) => {
      if (!response.success) {
        setFormError(response.message || "The selected times could not be added.")
        return
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["my-doctor-schedules"] }),
        queryClient.invalidateQueries({ queryKey: ["my-doctor-schedule-ids"] }),
        queryClient.invalidateQueries({ queryKey: ["available-schedule-slots"] }),
      ])
      onOpenChange(false)
      setSelectedIds([])
      setSearch("")
      toast.add({
        title: "Availability added",
        description: `${selectedIds.length} time slot${selectedIds.length === 1 ? "" : "s"} added to your schedule.`,
        type: "success",
      })
    },
    onError: (error) => setFormError(getErrorMessage(error)),
  })

  const handleOpenChange = (nextOpen: boolean) => {
    if (createMutation.isPending) return
    if (!nextOpen) {
      setSelectedIds([])
      setSearch("")
      setFormError("")
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="pr-14">
          <DialogTitle>Add availability</DialogTitle>
          <DialogDescription>
            Choose future time slots from the schedule pool. Administrators create the shared slots; adding one makes it available under your doctor profile.
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-6 py-5">
          {formError && (
            <Alert variant="destructive">
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          <Input
            type="search"
            aria-label="Search available time slots"
            placeholder="Search by date or time..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <div className="min-h-40 flex-1 space-y-1 overflow-y-auto rounded-md border p-2" aria-live="polite">
            {isLoadingAssignedIds ? (
              <p className="p-3 text-sm text-muted-foreground">Checking your current availability...</p>
            ) : hasAssignedIdsError ? (
              <p className="p-3 text-sm text-destructive" role="alert">Couldn’t check your current schedule. Close this window and try again.</p>
            ) : availableSlotsQuery.isLoading ? (
              <p className="p-3 text-sm text-muted-foreground">Loading available time slots...</p>
            ) : availableSlotsQuery.isError ? (
              <p className="p-3 text-sm text-destructive" role="alert">Couldn’t load shared time slots. Close this window and try again.</p>
            ) : filteredSlots.length > 0 ? (
              filteredSlots.map((schedule) => (
                <label key={schedule.id} className="flex cursor-pointer items-start gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted/60">
                  <Checkbox
                    checked={selectedIds.includes(schedule.id)}
                    onCheckedChange={(checked) => setSelectedIds((current) => checked
                      ? current.includes(schedule.id) ? current : [...current, schedule.id]
                      : current.filter((id) => id !== schedule.id))}
                  />
                  <span>{formatSlot(schedule)}</span>
                </label>
              ))
            ) : slots.length === 0 ? (
              <p className="p-3 text-sm text-muted-foreground">
                No unassigned future time slots are available. Contact an administrator to add schedule slots.
              </p>
            ) : (
              <p className="p-3 text-sm text-muted-foreground">No time slots match your search.</p>
            )}
          </div>

          {availableSlotsQuery.hasNextPage && (
            <Button
              type="button"
              variant="outline"
              onClick={() => availableSlotsQuery.fetchNextPage()}
              disabled={availableSlotsQuery.isFetchingNextPage}
            >
              {availableSlotsQuery.isFetchingNextPage ? "Loading more..." : "Load more time slots"}
            </Button>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => createMutation.mutate({ scheduleIds: selectedIds })}
            disabled={
              selectedIds.length === 0
              || createMutation.isPending
              || availableSlotsQuery.isError
              || hasAssignedIdsError
              || isLoadingAssignedIds
            }
          >
            {createMutation.isPending ? "Adding availability..." : `Add ${selectedIds.length || ""} selected`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CreateAvailabilityDialog
