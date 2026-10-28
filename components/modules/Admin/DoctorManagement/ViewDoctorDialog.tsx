"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getDoctorById } from "@/services/doctor.services"
import type { IDoctor } from "@/types/doctor.types"
import { useQuery } from "@tanstack/react-query"

interface ViewDoctorDialogProps {
  doctor: IDoctor | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const getSpecialtyTitles = (doctor: IDoctor) =>
  (doctor.specialties ?? []).flatMap((entry) => {
    if (typeof entry === "string") return entry.trim() ? [entry.trim()] : []
    const specialty = entry.specialty
    const title = entry.title
      ?? entry.specialtyName
      ?? entry.name
      ?? (typeof specialty === "object" ? specialty.title : specialty)
    return typeof title === "string" && title.trim() ? [title.trim()] : []
  })

const formatDate = (date: Date | string | undefined) => {
  if (!date) return "Not available"
  const parsedDate = new Date(date)
  return Number.isNaN(parsedDate.getTime())
    ? "Not available"
    : new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(parsedDate)
}

const Detail = ({ label, value }: { label: string; value: string | number }) => (
  <div className="space-y-1">
    <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
    <dd className="break-words text-sm font-medium">{value || "Not provided"}</dd>
  </div>
)

const ViewDoctorDialog = ({ doctor, open, onOpenChange }: ViewDoctorDialogProps) => {
  const doctorQuery = useQuery({
    queryKey: ["doctor", doctor?.id],
    queryFn: () => {
      if (!doctor) throw new Error("A doctor must be selected to load details.")
      return getDoctorById(doctor.id)
    },
    enabled: open && Boolean(doctor?.id),
  })
  const details = doctorQuery.data?.data

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="pr-14">
          <DialogTitle>Doctor details</DialogTitle>
          <DialogDescription>
            View the doctor’s account and professional information.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {doctorQuery.isLoading ? (
            <div className="flex min-h-40 items-center justify-center" role="status">
              <span className="text-sm text-muted-foreground">Loading doctor details...</span>
            </div>
          ) : doctorQuery.isError ? (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive" role="alert">
              We couldn’t load this doctor’s details. Close this window and try again.
            </div>
          ) : details ? (
            <div className="space-y-6">
              <section className="space-y-3">
                <h3 className="text-sm font-semibold">Account details</h3>
                <dl className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
                  <Detail label="Full name" value={details.name} />
                  <Detail label="Email" value={details.email} />
                  <Detail label="Contact number" value={details.contactNumber ?? "Not provided"} />
                  <Detail label="Gender" value={details.gender.toLowerCase()} />
                  <Detail label="Account status" value={details.user?.status?.toLowerCase() ?? "Not available"} />
                  <Detail label="Joined on" value={formatDate(details.createdAt)} />
                  <div className="sm:col-span-2">
                    <Detail label="Address" value={details.address ?? "Not provided"} />
                  </div>
                </dl>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold">Professional details</h3>
                <dl className="grid gap-4 rounded-lg border p-4 sm:grid-cols-2">
                  <Detail label="Registration number" value={details.registrationNumber} />
                  <Detail label="Designation" value={details.designation} />
                  <Detail label="Qualification" value={details.qualification} />
                  <Detail label="Current workplace" value={details.currentWorkingPlace} />
                  <Detail label="Experience" value={`${details.experience ?? 0} years`} />
                  <Detail label="Appointment fee" value={`$${details.appointmentFee.toFixed(2)}`} />
                  <Detail label="Average rating" value={`${details.averageRating?.toFixed(1) ?? "0.0"} / 5`} />
                </dl>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-semibold">Specialties</h3>
                <p className="rounded-lg border p-4 text-sm">
                  {getSpecialtyTitles(details).join(", ") || "No specialties assigned"}
                </p>
              </section>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">Doctor details are unavailable.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ViewDoctorDialog
