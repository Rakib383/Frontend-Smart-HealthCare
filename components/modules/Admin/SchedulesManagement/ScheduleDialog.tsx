"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
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
import { createSchedules, updateSchedule } from "@/services/schedule.services"
import type { ApiResponse } from "@/types/api.types"
import type { ICreateSchedulePayload, ISchedule } from "@/types/schedule.types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { format } from "date-fns"
import { useState, type FormEvent } from "react"
import { z } from "zod"

interface ScheduleDialogProps {
  schedule?: ISchedule | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

type ScheduleFormValues = ICreateSchedulePayload

type ScheduleFormField = keyof ScheduleFormValues
type ScheduleMutationResult = {
  response: ApiResponse<ISchedule | ISchedule[]>
  createdCount?: number
}

const getLocalDate = (date: Date) => format(date, "yyyy-MM-dd")

const getScheduleDate = (date: string | Date) => {
  const parsedDate = new Date(date)
  return Number.isNaN(parsedDate.getTime()) ? "" : getLocalDate(parsedDate)
}

const getScheduleTime = (date: string | Date) => {
  const parsedDate = new Date(date)
  return Number.isNaN(parsedDate.getTime()) ? "" : format(parsedDate, "HH:mm")
}

const emptyValues = (): ScheduleFormValues => ({
  startDate: getLocalDate(new Date()),
  endDate: getLocalDate(new Date()),
  startTime: "09:00",
  endTime: "17:00",
})

const getScheduleValues = (schedule: ISchedule): ScheduleFormValues => ({
  startDate: getScheduleDate(schedule.startDateTime),
  endDate: getScheduleDate(schedule.endDateTime),
  startTime: getScheduleTime(schedule.startDateTime),
  endTime: getScheduleTime(schedule.endDateTime),
})

const scheduleSchema = z.object({
  startDate: z.string().min(1, "Choose a start date."),
  endDate: z.string().min(1, "Choose an end date."),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Choose a valid start time."),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Choose a valid end time."),
}).superRefine((values, context) => {
  const start = new Date(`${values.startDate}T00:00:00`)
  const end = new Date(`${values.endDate}T00:00:00`)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return

  if (end < start) {
    context.addIssue({ code: "custom", path: ["endDate"], message: "End date must be on or after the start date." })
    return
  }

  const dayCount = Math.round((end.getTime() - start.getTime()) / 86400000) + 1
  if (dayCount > 31) {
    context.addIssue({ code: "custom", path: ["endDate"], message: "Choose a date range of 31 days or less. Create longer ranges in separate batches." })
  }

  const startMinutes = Number(values.startTime.slice(0, 2)) * 60 + Number(values.startTime.slice(3))
  const endMinutes = Number(values.endTime.slice(0, 2)) * 60 + Number(values.endTime.slice(3))
  const duration = endMinutes - startMinutes
  if (duration <= 0) {
    context.addIssue({ code: "custom", path: ["endTime"], message: "End time must be later than start time on each selected day." })
  } else if (duration % 30 !== 0) {
    context.addIssue({ code: "custom", path: ["endTime"], message: "Choose a time range that ends on a 30-minute slot boundary." })
  }
})

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "We couldn’t save the schedule. Please try again."
  }
  return "We couldn’t save the schedule. Please try again."
}

const ScheduleDialog = ({ schedule, open, onOpenChange }: ScheduleDialogProps) => {
  const queryClient = useQueryClient()
  const [values, setValues] = useState<ScheduleFormValues>(() => schedule ? getScheduleValues(schedule) : emptyValues())
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<ScheduleFormField, string>>>({})
  const [formError, setFormError] = useState("")
  const isEditing = Boolean(schedule)

  const mutation = useMutation({
    mutationFn: async (payload: ScheduleFormValues): Promise<ScheduleMutationResult> => {
      if (schedule) {
        return { response: await updateSchedule(schedule.id, payload) }
      }

      const response = await createSchedules(payload)
      return { response, createdCount: response.data.length }
    },
    onSuccess: async ({ response, createdCount }) => {
      if (!response.success) {
        setFormError(response.message || "The schedule could not be saved.")
        return
      }

      await queryClient.invalidateQueries({ queryKey: ["schedules"] })
      onOpenChange(false)
      toast.add({
        title: isEditing ? "Schedule updated" : "Schedule created",
        description: isEditing
          ? "The time slot has been updated."
          : `${createdCount ?? 0} half-hour time slots created. Existing slots were skipped.`,
        type: "success",
      })
    },
    onError: (error) => setFormError(getErrorMessage(error)),
  })

  const updateField = (field: ScheduleFormField, value: string) => {
    setValues((current) => ({
      ...current,
      [field]: value,
      ...(isEditing && field === "startDate" ? { endDate: value } : {}),
    }))
    setFieldErrors((current) => ({
      ...current,
      [field]: undefined,
      ...(isEditing && field === "startDate" ? { endDate: undefined } : {}),
    }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError("")
    const result = scheduleSchema.safeParse(values)
    if (!result.success) {
      const nextErrors: Partial<Record<ScheduleFormField, string>> = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0]
        if (typeof field === "string" && field in values) {
          nextErrors[field as ScheduleFormField] ??= issue.message
        }
      }
      setFieldErrors(nextErrors)
      const firstInvalidField = Object.keys(nextErrors)[0]
      if (firstInvalidField) document.getElementById(`schedule-${firstInvalidField}`)?.focus()
      return
    }

    mutation.mutate(result.data)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (mutation.isPending) return
    if (!nextOpen) {
      setFormError("")
      setFieldErrors({})
    }
    onOpenChange(nextOpen)
  }

  const renderField = (field: ScheduleFormField, label: string, type: "date" | "time") => {
    const error = fieldErrors[field]
    return (
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {label}
        <Input
          id={`schedule-${field}`}
          type={type}
          value={values[field]}
          onChange={(event) => updateField(field, event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `schedule-${field}-error` : undefined}
        />
        {error && <span id={`schedule-${field}-error`} className="text-sm font-normal text-destructive" role="alert">{error}</span>}
      </label>
    )
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
          <DialogHeader className="pr-14">
            <DialogTitle>{isEditing ? "Edit schedule slot" : "Create schedules"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update this 30-minute slot. Changes also affect doctors and appointments assigned to it."
                : "Choose a date range and daily hours. The system creates 30-minute schedule slots for each day, up to 31 days per batch."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            {formError && (
              <Alert variant="destructive">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              {renderField("startDate", isEditing ? "Date" : "Start date", "date")}
              {!isEditing && renderField("endDate", "End date", "date")}
              {renderField("startTime", "Daily start time", "time")}
              {renderField("endTime", "Daily end time", "time")}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving..." : isEditing ? "Save changes" : "Create slots"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ScheduleDialog
