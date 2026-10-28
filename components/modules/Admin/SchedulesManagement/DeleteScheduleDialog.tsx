"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { deleteSchedule } from "@/services/schedule.services"
import type { ISchedule } from "@/types/schedule.types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { format } from "date-fns"
import { useState } from "react"

interface DeleteScheduleDialogProps {
  schedule: ISchedule | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const formatSlot = (schedule: ISchedule) => {
  const start = new Date(schedule.startDateTime)
  const end = new Date(schedule.endDateTime)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "this schedule slot"
  return `${format(start, "MMM d, yyyy")} from ${format(start, "h:mm a")} to ${format(end, "h:mm a")}`
}

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "We couldn’t delete this schedule slot. Please try again."
  }
  return "We couldn’t delete this schedule slot. Please try again."
}

const DeleteScheduleDialog = ({ schedule, open, onOpenChange }: DeleteScheduleDialogProps) => {
  const queryClient = useQueryClient()
  const [formError, setFormError] = useState("")

  const mutation = useMutation({
    mutationFn: (id: string) => deleteSchedule(id),
    onSuccess: async (response) => {
      if (!response.success) {
        setFormError(response.message || "The schedule slot could not be deleted.")
        return
      }

      await queryClient.invalidateQueries({ queryKey: ["schedules"] })
      onOpenChange(false)
      toast.add({
        title: "Schedule slot deleted",
        description: "The selected slot and any linked availability or appointments were removed.",
        type: "success",
      })
    },
    onError: (error) => setFormError(getErrorMessage(error)),
  })

  const handleOpenChange = (nextOpen: boolean) => {
    if (mutation.isPending) return
    if (!nextOpen) setFormError("")
    onOpenChange(nextOpen)
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="sm:max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete schedule slot?</AlertDialogTitle>
          <AlertDialogDescription>
            Delete <strong>{schedule ? formatSlot(schedule) : "this schedule slot"}</strong>? This permanently deletes the slot, any doctor availability linked to it, and any appointments assigned to it. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {formError && (
          <Alert variant="destructive">
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={mutation.isPending} onClick={() => setFormError("")}>
            Cancel
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            disabled={!schedule || mutation.isPending}
            onClick={() => {
              if (schedule) mutation.mutate(schedule.id)
            }}
          >
            {mutation.isPending ? "Deleting..." : "Delete slot"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteScheduleDialog
