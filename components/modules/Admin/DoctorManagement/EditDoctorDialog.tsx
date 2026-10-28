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
import { updateDoctor } from "@/services/doctor.services"
import type { ISpecialtyOption } from "@/services/specialty.services"
import type { IDoctor } from "@/types/doctor.types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { useState, type FormEvent, type ReactNode } from "react"
import { z } from "zod"

interface EditDoctorDialogProps {
  doctor: IDoctor | null
  specialties: ISpecialtyOption[]
  specialtiesLoading: boolean
  specialtiesError: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}

const editDoctorSchema = z.object({
  name: z.string().trim().min(5, "Enter a full name with at least 5 characters.").max(30, "Full name cannot exceed 30 characters."),
  contactNumber: z.string().trim().min(11, "Enter a contact number with at least 11 characters.").max(14, "Contact number cannot exceed 14 characters."),
  address: z.string().trim().max(100, "Address cannot exceed 100 characters.").refine((value) => value.length === 0 || value.length >= 10, "Enter an address with at least 10 characters, or leave it blank."),
  registrationNumber: z.string().trim().min(1, "Enter a registration number."),
  experience: z.string().regex(/^\d+$/, "Enter experience as a whole number (0 or more).").transform(Number).pipe(z.number().int().nonnegative("Experience cannot be negative.")),
  gender: z.enum(["MALE", "FEMALE"], { error: "Select a valid gender." }),
  appointmentFee: z.string().regex(/^\d+(\.\d{1,2})?$/, "Enter a valid fee (0 or more, up to 2 decimal places).").transform(Number).pipe(z.number().nonnegative("Appointment fee cannot be negative.")),
  qualification: z.string().trim().min(2, "Qualification must be at least 2 characters.").max(50, "Qualification cannot exceed 50 characters."),
  currentWorkingPlace: z.string().trim().min(2, "Current workplace must be at least 2 characters.").max(50, "Current workplace cannot exceed 50 characters."),
  designation: z.string().trim().min(2, "Designation must be at least 2 characters.").max(50, "Designation cannot exceed 50 characters."),
})

type EditDoctorFormValues = {
  name: string
  contactNumber: string
  address: string
  registrationNumber: string
  experience: string
  gender: "MALE" | "FEMALE"
  appointmentFee: string
  qualification: string
  currentWorkingPlace: string
  designation: string
}

type EditDoctorField = keyof EditDoctorFormValues | "specialties"

const getDoctorSpecialtyIds = (doctor: IDoctor, specialties: ISpecialtyOption[]) =>
  (doctor.specialties ?? []).flatMap((entry) => {
    if (typeof entry === "string") {
      const option = specialties.find((specialty) => specialty.title === entry)
      return option ? [option.id] : []
    }

    const specialtyId = entry.specialtyId
      ?? (typeof entry.specialty === "object" ? entry.specialty?.id : undefined)
    if (specialtyId) return [specialtyId]

    const title = entry.title ?? entry.specialtyName ?? entry.name
      ?? (typeof entry.specialty === "object" ? entry.specialty?.title : undefined)
    const option = title ? specialties.find((specialty) => specialty.title === title) : undefined
    return option ? [option.id] : []
  })

const getDoctorFormValues = (doctor: IDoctor): EditDoctorFormValues => ({
  name: doctor.name ?? "",
  contactNumber: doctor.contactNumber ?? "",
  address: doctor.address ?? "",
  registrationNumber: doctor.registrationNumber ?? "",
  experience: String(doctor.experience ?? 0),
  gender: doctor.gender,
  appointmentFee: String(doctor.appointmentFee ?? ""),
  qualification: doctor.qualification ?? "",
  currentWorkingPlace: doctor.currentWorkingPlace ?? "",
  designation: doctor.designation ?? "",
})

const errorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "We couldn’t save the doctor’s changes. Please try again."
  }
  return "We couldn’t save the doctor’s changes. Please try again."
}

const ErrorText = ({ id, children }: { id: string; children: ReactNode }) => (
  <span id={id} role="alert" className="text-sm font-normal text-destructive">{children}</span>
)

const EditDoctorDialog = ({
  doctor,
  specialties,
  specialtiesLoading,
  specialtiesError,
  open,
  onOpenChange,
}: EditDoctorDialogProps) => {
  const queryClient = useQueryClient()
  const [values, setValues] = useState<EditDoctorFormValues | null>(() =>
    doctor ? getDoctorFormValues(doctor) : null,
  )
  const initialSpecialtyIds = doctor ? getDoctorSpecialtyIds(doctor, specialties) : []
  const [selectedSpecialtyIds, setSelectedSpecialtyIds] = useState<string[]>(initialSpecialtyIds)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<EditDoctorField, string>>>({})
  const [formError, setFormError] = useState("")

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateDoctor>[1] }) => updateDoctor(id, payload),
    onSuccess: async (response) => {
      if (!response.success || !response.data) {
        setFormError(response.message || "The doctor’s changes could not be saved.")
        return
      }

      await queryClient.invalidateQueries({ queryKey: ["doctors"] })
      if (doctor) {
        await queryClient.invalidateQueries({ queryKey: ["doctor", doctor.id] })
      }
      onOpenChange(false)
      toast.add({
        title: "Doctor updated",
        description: `${response.data.name}’s profile has been updated.`,
        type: "success",
      })
    },
    onError: (error) => setFormError(errorMessage(error)),
  })

  const updateField = <TField extends keyof EditDoctorFormValues>(
    field: TField,
    value: EditDoctorFormValues[TField],
  ) => {
    setValues((current) => current ? { ...current, [field]: value } : current)
    setFieldErrors((current) => ({ ...current, [field]: undefined }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!doctor || !values) return

    setFormError("")
    setFieldErrors({})
    const result = editDoctorSchema.safeParse(values)
    if (!result.success) {
      const nextErrors: Partial<Record<EditDoctorField, string>> = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0]
        if (typeof field === "string" && field in values) {
          nextErrors[field as keyof EditDoctorFormValues] ??= issue.message
        }
      }
      setFieldErrors(nextErrors)
      const firstInvalidField = Object.keys(nextErrors)[0]
      if (firstInvalidField) document.getElementById(`edit-doctor-${firstInvalidField}`)?.focus()
      return
    }

    if (selectedSpecialtyIds.length === 0) {
      setFieldErrors({ specialties: "Choose at least one specialty." })
      document.querySelector<HTMLElement>('[id^="edit-doctor-specialty-"]')?.focus()
      return
    }

    const { address, ...doctorFields } = result.data
    const currentIds = new Set(initialSpecialtyIds)
    const selectedIds = new Set(selectedSpecialtyIds)
    const specialtyChanges = [
      ...selectedSpecialtyIds.filter((id) => !currentIds.has(id)).map((specialtyId) => ({ specialtyId })),
      ...initialSpecialtyIds.filter((id) => !selectedIds.has(id)).map((specialtyId) => ({ specialtyId, shouldDelete: true })),
    ]

    updateMutation.mutate({
      id: doctor.id,
      payload: {
        doctor: {
          ...doctorFields,
          ...(address ? { address } : {}),
        },
        specialties: specialtyChanges,
      },
    })
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (updateMutation.isPending) return
    if (!nextOpen) {
      setFormError("")
      setFieldErrors({})
    }
    onOpenChange(nextOpen)
  }

  const fieldError = (field: keyof EditDoctorFormValues) => fieldErrors[field]
  const errorProps = (field: keyof EditDoctorFormValues) => ({
    "aria-invalid": Boolean(fieldError(field)),
    "aria-describedby": fieldError(field) ? `edit-doctor-${field}-error` : undefined,
  })

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
          <DialogHeader className="pr-14">
            <DialogTitle>Edit doctor</DialogTitle>
            <DialogDescription>
              Update this doctor’s profile. The account email cannot be changed here.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
            {formError && (
              <Alert variant="destructive" role="alert">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            {values && (
              <>
                <section className="space-y-3">
                  <h3 className="text-sm font-semibold">Account details</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="space-y-1.5 text-sm font-medium">
                      Full name *
                      <Input id="edit-doctor-name" value={values.name} onChange={(event) => updateField("name", event.target.value)} {...errorProps("name")} />
                      {fieldError("name") && <ErrorText id="edit-doctor-name-error">{fieldError("name")}</ErrorText>}
                    </label>
                    <label className="space-y-1.5 text-sm font-medium">
                      Email
                      <Input value={doctor?.email ?? ""} readOnly aria-describedby="edit-doctor-email-note" />
                      <span id="edit-doctor-email-note" className="text-xs font-normal text-muted-foreground">Email changes are not supported by this API.</span>
                    </label>
                    <label className="space-y-1.5 text-sm font-medium">
                      Contact number *
                      <Input id="edit-doctor-contactNumber" type="tel" value={values.contactNumber} onChange={(event) => updateField("contactNumber", event.target.value)} {...errorProps("contactNumber")} />
                      {fieldError("contactNumber") && <ErrorText id="edit-doctor-contactNumber-error">{fieldError("contactNumber")}</ErrorText>}
                    </label>
                    <label className="space-y-1.5 text-sm font-medium">
                      Address
                      <Input id="edit-doctor-address" value={values.address} onChange={(event) => updateField("address", event.target.value)} {...errorProps("address")} />
                      {fieldError("address") && <ErrorText id="edit-doctor-address-error">{fieldError("address")}</ErrorText>}
                    </label>
                  </div>
                </section>

                <section className="space-y-3">
                  <h3 className="text-sm font-semibold">Professional details</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="space-y-1.5 text-sm font-medium">
                      Registration number *
                      <Input id="edit-doctor-registrationNumber" value={values.registrationNumber} onChange={(event) => updateField("registrationNumber", event.target.value)} {...errorProps("registrationNumber")} />
                      {fieldError("registrationNumber") && <ErrorText id="edit-doctor-registrationNumber-error">{fieldError("registrationNumber")}</ErrorText>}
                    </label>
                    <label className="flex flex-col gap-1.5 text-sm font-medium">
                      Gender *
                      <select id="edit-doctor-gender" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" value={values.gender} onChange={(event) => updateField("gender", event.target.value as EditDoctorFormValues["gender"])}>
                        <option value="FEMALE">Female</option>
                        <option value="MALE">Male</option>
                      </select>
                    </label>
                    <label className="space-y-1.5 text-sm font-medium">
                      Designation *
                      <Input id="edit-doctor-designation" value={values.designation} onChange={(event) => updateField("designation", event.target.value)} {...errorProps("designation")} />
                      {fieldError("designation") && <ErrorText id="edit-doctor-designation-error">{fieldError("designation")}</ErrorText>}
                    </label>
                    <label className="space-y-1.5 text-sm font-medium">
                      Qualification *
                      <Input id="edit-doctor-qualification" value={values.qualification} onChange={(event) => updateField("qualification", event.target.value)} {...errorProps("qualification")} />
                      {fieldError("qualification") && <ErrorText id="edit-doctor-qualification-error">{fieldError("qualification")}</ErrorText>}
                    </label>
                    <label className="space-y-1.5 text-sm font-medium">
                      Current workplace *
                      <Input id="edit-doctor-currentWorkingPlace" value={values.currentWorkingPlace} onChange={(event) => updateField("currentWorkingPlace", event.target.value)} {...errorProps("currentWorkingPlace")} />
                      {fieldError("currentWorkingPlace") && <ErrorText id="edit-doctor-currentWorkingPlace-error">{fieldError("currentWorkingPlace")}</ErrorText>}
                    </label>
                    <label className="space-y-1.5 text-sm font-medium">
                      Experience (years) *
                      <Input id="edit-doctor-experience" type="number" min="0" step="1" value={values.experience} onChange={(event) => updateField("experience", event.target.value)} {...errorProps("experience")} />
                      {fieldError("experience") && <ErrorText id="edit-doctor-experience-error">{fieldError("experience")}</ErrorText>}
                    </label>
                    <label className="space-y-1.5 text-sm font-medium">
                      Appointment fee *
                      <Input id="edit-doctor-appointmentFee" type="number" min="0" step="0.01" value={values.appointmentFee} onChange={(event) => updateField("appointmentFee", event.target.value)} {...errorProps("appointmentFee")} />
                      {fieldError("appointmentFee") && <ErrorText id="edit-doctor-appointmentFee-error">{fieldError("appointmentFee")}</ErrorText>}
                    </label>
                  </div>
                </section>

                <fieldset className="space-y-2" aria-describedby={fieldErrors.specialties ? "edit-doctor-specialties-error" : undefined}>
                  <legend className="text-sm font-semibold">Specialties *</legend>
                  {specialtiesLoading ? (
                    <p className="text-sm text-muted-foreground">Loading specialties...</p>
                  ) : specialtiesError ? (
                    <p className="text-sm text-destructive" role="alert">Could not load specialties. Please try again before changing specialties.</p>
                  ) : (
                    <div className="grid max-h-40 gap-2 overflow-y-auto rounded-md border p-3 sm:grid-cols-2">
                      {specialties.map((specialty) => (
                        <label key={specialty.id} htmlFor={`edit-doctor-specialty-${specialty.id}`} className="flex cursor-pointer items-center gap-2 text-sm">
                          <Checkbox
                            id={`edit-doctor-specialty-${specialty.id}`}
                            checked={selectedSpecialtyIds.includes(specialty.id)}
                            onCheckedChange={(checked) => {
                              setSelectedSpecialtyIds((current) => checked
                                ? current.includes(specialty.id) ? current : [...current, specialty.id]
                                : current.filter((id) => id !== specialty.id))
                              setFieldErrors((current) => ({ ...current, specialties: undefined }))
                            }}
                            aria-invalid={Boolean(fieldErrors.specialties)}
                            aria-describedby={fieldErrors.specialties ? "edit-doctor-specialties-error" : undefined}
                          />
                          {specialty.title}
                        </label>
                      ))}
                      {specialties.length === 0 && <p className="text-sm text-muted-foreground">No specialties are available.</p>}
                    </div>
                  )}
                  {fieldErrors.specialties && <ErrorText id="edit-doctor-specialties-error">{fieldErrors.specialties}</ErrorText>}
                </fieldset>
              </>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={updateMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={!values || updateMutation.isPending || specialtiesLoading || specialtiesError || specialties.length === 0}>
              {updateMutation.isPending ? "Saving changes..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default EditDoctorDialog
