"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { IManagedReview } from "@/services/review.services"
import ReviewRating from "./ReviewRating"

interface ReviewDetailsDialogProps {
  review: IManagedReview | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const formatDate = (date: string | Date) => {
  const parsedDate = new Date(date)
  return Number.isNaN(parsedDate.getTime())
    ? "Not available"
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(parsedDate)
}

export default function ReviewDetailsDialog({ review, open, onOpenChange }: ReviewDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader className="pr-14">
          <DialogTitle>Review details</DialogTitle>
          <DialogDescription>
            Feedback about Dr. {review?.doctor.name ?? "the selected doctor"}.
          </DialogDescription>
        </DialogHeader>

        {review && (
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
              <ReviewRating rating={review.rating} />
              <span className="text-sm text-muted-foreground">Reviewed {formatDate(review.createdAt)}</span>
            </div>

            <dl className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
              <div className="space-y-1">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Patient</dt>
                <dd className="text-sm font-medium">{review.patient.name}</dd>
                <dd className="text-xs text-muted-foreground">{review.patient.email}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Doctor</dt>
                <dd className="text-sm font-medium">{review.doctor.name}</dd>
                <dd className="text-xs text-muted-foreground">{review.doctor.email}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Appointment</dt>
                <dd className="text-sm">{formatDate(review.appointment.schedule.startDateTime)}</dd>
              </div>
              <div className="space-y-1">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Review ID</dt>
                <dd className="break-all font-mono text-xs">{review.id}</dd>
              </div>
            </dl>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold">Comment</h3>
              <p className="min-h-20 whitespace-pre-wrap break-words rounded-lg border bg-muted/20 p-4 text-sm leading-relaxed">
                {review.comment?.trim() || "No written comment was provided."}
              </p>
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
