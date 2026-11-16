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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { IDoctorAppointment } from "@/services/appointment.services"
import type {
  ICreatePrescriptionPayload,
  IManagedPrescription,
} from "@/services/prescription.services"
import axios from "axios"
import { format } from "date-fns"
import { useState, type FormEvent } from "react"

interface PrescriptionFormDialogProps {
  open: boolean
  prescription: IManagedPrescription | null
  appointments: IDoctorAppointment[]
  isLoadingAppointments: boolean
  isSaving: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: ICreatePrescriptionPayload) => Promise<void>
}

const getDateInputValue = (value: string | Date | undefined) => {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const formatAppointment = (patientName: string, startDateTime: string | Date) => {
  const date = new Date(startDateTime)
  const dateLabel = Number.isNaN(date.getTime()) ? "date unavailable" : format(date, "MMM d, yyyy · h:mm a")
  return `${patientName} · ${dateLabel}`
}

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "The prescription could not be saved. Please try again."
  }
  return error instanceof Error ? error.message : "The prescription could not be saved. Please try again."
}

const PrescriptionFormDialog = ({
  open,
  prescription,
  appointments,
  isLoadingAppointments,
  isSaving,
  onOpenChange,
  onSubmit,
}: PrescriptionFormDialogProps) => {
  const [appointmentId, setAppointmentId] = useState(prescription?.appointmentId ?? "")
  const [instructions, setInstructions] = useState(prescription?.instructions ?? "")
  const [followUpDate, setFollowUpDate] = useState(getDateInputValue(prescription?.followUpDate))
  const [formError, setFormError] = useState("")

  const handleOpenChange = (nextOpen: boolean) => {
    if (isSaving) return
    onOpenChange(nextOpen)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError("")

    const trimmedInstructions = instructions.trim()
    if (!prescription && !appointmentId) {
      setFormError("Select the completed appointment for this prescription.")
      return
    }
    if (!trimmedInstructions) {
      setFormError("Enter the prescription instructions.")
      return
    }
    if (!followUpDate) {
      setFormError("Select a follow-up date.")
      return
    }

    try {
      await onSubmit({
        appointmentId: prescription?.appointmentId ?? appointmentId,
        instructions: trimmedInstructions,
        followUpDate,
      })
    } catch (error) {
      setFormError(getErrorMessage(error))
    }
  }

  const selectedAppointment = appointments.find((appointment) => appointment.id === appointmentId)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="pr-14">
          <DialogTitle>{prescription ? "Edit prescription" : "Create prescription"}</DialogTitle>
          <DialogDescription>
            {prescription
              ? `Update the prescription for ${prescription.patient.name}.`
              : "Create a prescription for one of your completed appointments."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(event) => void handleSubmit(event)} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
            {formError && (
              <Alert variant="destructive">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            {prescription ? (
              <div className="space-y-1">
                <Label>Appointment</Label>
                <p className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
                  {formatAppointment(
                    prescription.patient.name,
                    prescription.appointment.schedule.startDateTime,
                  )}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="prescription-appointment">Completed appointment</Label>
                <select
                  id="prescription-appointment"
                  required
                  value={appointmentId}
                  onChange={(event) => setAppointmentId(event.currentTarget.value)}
                  disabled={isLoadingAppointments || isSaving || appointments.length === 0}
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">
                    {isLoadingAppointments ? "Loading completed appointments..." : "Select an appointment"}
                  </option>
                  {appointments.map((appointment) => (
                    <option key={appointment.id} value={appointment.id}>
                      {formatAppointment(appointment.patient.name, appointment.schedule.startDateTime)}
                    </option>
                  ))}
                </select>
                {appointments.length === 0 && !isLoadingAppointments && (
                  <p className="text-sm text-muted-foreground">
                    There are no completed appointments available without an existing prescription.
                  </p>
                )}
                {selectedAppointment && (
                  <p className="text-xs text-muted-foreground">Patient: {selectedAppointment.patient.email}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="prescription-instructions">Instructions</Label>
              <Textarea
                id="prescription-instructions"
                required
                rows={7}
                maxLength={10000}
                value={instructions}
                onChange={(event) => setInstructions(event.currentTarget.value)}
                placeholder="Enter medication, dosage, and care instructions..."
                disabled={isSaving}
                aria-describedby="prescription-instructions-help"
              />
              <p id="prescription-instructions-help" className="text-xs text-muted-foreground">
                These instructions will appear in the prescription PDF sent to the patient.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prescription-follow-up">Follow-up date</Label>
              <Input
                id="prescription-follow-up"
                type="date"
                required
                value={followUpDate}
                onChange={(event) => setFollowUpDate(event.currentTarget.value)}
                disabled={isSaving}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSaving
                || isLoadingAppointments
                || (!prescription && appointments.length === 0)
              }
            >
              {isSaving ? "Saving..." : prescription ? "Save changes" : "Create prescription"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default PrescriptionFormDialog
