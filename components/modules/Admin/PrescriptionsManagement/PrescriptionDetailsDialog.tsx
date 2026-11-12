"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { IManagedPrescription } from "@/services/prescription.services"
import { ExternalLink } from "lucide-react"

interface PrescriptionDetailsDialogProps {
  prescription: IManagedPrescription | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const formatDate = (date: string | Date) => {
  const parsedDate = new Date(date)
  return Number.isNaN(parsedDate.getTime())
    ? "Not available"
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(parsedDate)
}

const getSafePdfUrl = (value: string | null) => {
  if (!value) return null
  try {
    return new URL(value).protocol === "https:" ? value : null
  } catch {
    return null
  }
}

export default function PrescriptionDetailsDialog({
  prescription,
  open,
  onOpenChange,
}: PrescriptionDetailsDialogProps) {
  const pdfUrl = getSafePdfUrl(prescription?.pdfUrl ?? null)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="pr-14">
          <DialogTitle>Prescription details</DialogTitle>
          <DialogDescription>
            Prescription for {prescription?.patient.name ?? "the selected patient"}.
          </DialogDescription>
        </DialogHeader>

        {prescription && (
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <dl className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
              <div className="space-y-1">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Patient</dt>
                <dd className="text-sm font-medium">{prescription.patient.name}</dd>
                <dd className="text-xs text-muted-foreground">{prescription.patient.email}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Doctor</dt>
                <dd className="text-sm font-medium">{prescription.doctor.name}</dd>
                <dd className="text-xs text-muted-foreground">{prescription.doctor.email}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Appointment</dt>
                <dd className="text-sm">{formatDate(prescription.appointment.schedule.startDateTime)}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Follow-up</dt>
                <dd className="text-sm">{formatDate(prescription.followUpDate)}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Issued</dt>
                <dd className="text-sm">{formatDate(prescription.createdAt)}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Prescription ID</dt>
                <dd className="break-all font-mono text-xs">{prescription.id}</dd>
              </div>
            </dl>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold">Instructions</h3>
              <p className="whitespace-pre-wrap break-words rounded-lg border bg-muted/20 p-4 text-sm leading-relaxed">
                {prescription.instructions}
              </p>
            </section>

            {pdfUrl ? (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                Open prescription PDF
                <ExternalLink className="size-4" aria-hidden="true" />
              </a>
            ) : (
              <p className="text-sm text-muted-foreground">Prescription PDF is not available.</p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
