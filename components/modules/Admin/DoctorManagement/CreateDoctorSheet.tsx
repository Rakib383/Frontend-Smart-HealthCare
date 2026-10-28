"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { createSpecialty } from "@/services/specialty.services"
import { createDoctor } from "@/services/user.services"
import type { ICreateDoctorPayload } from "@/services/user.services"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { Plus } from "lucide-react"
import type { FormEvent } from "react"
import { useState } from "react"
import { z } from "zod"

interface SpecialtyOption {
  id: string;
  title: string;
}

interface CreateDoctorSheetProps {
  specialties: SpecialtyOption[];
  specialtiesLoading: boolean;
  specialtiesError: boolean;
}

const createDoctorSchema = z.object({
  password: z.string().min(6, "Temporary password must be at least 6 characters.").max(20, "Temporary password cannot exceed 20 characters."),
  doctor: z.object({
    name: z.string().min(5, "Full name must be at least 5 characters.").max(30, "Full name cannot exceed 30 characters."),
    email: z.email("Enter a valid email address"),
    contactNumber: z.string().min(1, "Enter a contact number."),
    address: z.string().optional(),
    registrationNumber: z.string().min(1, "Enter a registration number."),
    experience: z.number().int("Enter experience as a whole number.").nonnegative("Experience cannot be negative.").optional(),
    gender: z.enum(["MALE", "FEMALE"], { error: "Select a gender." }),
    appointmentFee: z.number({ error: "Enter a valid appointment fee." }).nonnegative("Appointment fee cannot be negative."),
    qualification: z.string().min(2, "Qualification must be at least 2 characters."),
    currentWorkingPlace: z.string().min(2, "Current workplace must be at least 2 characters."),
    designation: z.string().min(2, "Designation must be at least 2 characters."),
  }),
  specialties: z.array(z.uuid("Choose a valid specialty.")).min(1, "Choose at least one specialty."),
})

const initialFormValues = {
  password: "",
  name: "",
  email: "",
  contactNumber: "",
  address: "",
  registrationNumber: "",
  experience: "",
  gender: "FEMALE" as "MALE" | "FEMALE",
  appointmentFee: "",
  qualification: "",
  currentWorkingPlace: "",
  designation: "",
  specialties: [] as string[],
}

type DoctorFormField = keyof typeof initialFormValues

const fieldLabels: Record<DoctorFormField, string> = {
  password: "Temporary password",
  name: "Full name",
  email: "Email",
  contactNumber: "Contact number",
  address: "Address",
  registrationNumber: "Registration number",
  experience: "Experience",
  gender: "Gender",
  appointmentFee: "Appointment fee",
  qualification: "Qualification",
  currentWorkingPlace: "Current workplace",
  designation: "Designation",
  specialties: "Specialties",
}

const getCreateErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "We couldn’t create the doctor. Please check the form and try again."
  }
  return "We couldn’t create the doctor. Please check the form and try again."
}

const isDoctorFormField = (field: string): field is DoctorFormField =>
  Object.prototype.hasOwnProperty.call(fieldLabels, field)

const CreateDoctorSheet = ({
  specialties,
  specialtiesLoading,
  specialtiesError,
}: CreateDoctorSheetProps) => {
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [formValues, setFormValues] = useState(initialFormValues)
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<DoctorFormField, string>>>({})
  const [formError, setFormError] = useState("")
  const [selectedSpecialtyError, setSelectedSpecialtyError] = useState("")
  const [isAddingSpecialty, setIsAddingSpecialty] = useState(false)
  const [newSpecialtyTitle, setNewSpecialtyTitle] = useState("")
  const [specialtyCreateError, setSpecialtyCreateError] = useState("")

  const createSpecialtyMutation = useMutation({
    mutationFn: createSpecialty,
    onError: (error) => {
      setSpecialtyCreateError(getCreateErrorMessage(error))
    },
  })

  const createDoctorMutation = useMutation({
    mutationFn: createDoctor,
    onSuccess: async (response) => {
      if (!response.success || !response.data) {
        setFormError(response.message || "The doctor could not be created.")
        return
      }

      await queryClient.invalidateQueries({ queryKey: ["doctors"] })
      setFormValues(initialFormValues)
      setFormError("")
      setFieldErrors({})
      setSelectedSpecialtyError("")
      setIsOpen(false)
      toast.add({
        title: "Doctor created successfully",
        description: `${response.data.name} is now in the doctors list.`,
        type: "success",
      })
    },
    onError: (error) => {
      setFormError(getCreateErrorMessage(error))
    },
  })

  const updateField = <TField extends keyof typeof initialFormValues>(
    field: TField,
    value: (typeof initialFormValues)[TField],
  ) => {
    setFormValues((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: undefined }))
  }

  const handleOpenChange = (open: boolean) => {
    if (createDoctorMutation.isPending) {
      return
    }
    setIsOpen(open)
    if (!open) {
      setFormError("")
      setFieldErrors({})
      setSelectedSpecialtyError("")
      setIsAddingSpecialty(false)
      setNewSpecialtyTitle("")
      setSpecialtyCreateError("")
    }
  }

  const handleCreateSpecialty = async () => {
    const title = newSpecialtyTitle.trim()
    setSpecialtyCreateError("")

    if (title.length < 2) {
      setSpecialtyCreateError("Enter a specialty name with at least 2 characters.")
      return
    }

    if (specialties.some((specialty) => specialty.title.toLowerCase() === title.toLowerCase())) {
      setSpecialtyCreateError("This specialty already exists. Select it from the list.")
      return
    }

    try {
      const response = await createSpecialtyMutation.mutateAsync({ title })
      if (!response.success || !response.data?.id) {
        setSpecialtyCreateError(response.message || "Unable to add this specialty.")
        return
      }

      await queryClient.invalidateQueries({ queryKey: ["specialties"] })
      setFormValues((current) => ({
        ...current,
        specialties: current.specialties.includes(response.data.id)
          ? current.specialties
          : [...current.specialties, response.data.id],
      }))
      setNewSpecialtyTitle("")
      setIsAddingSpecialty(false)
    } catch {
      // The mutation's onError handler displays the API error in the specialty section.
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError("")
    setFieldErrors({})
    setSelectedSpecialtyError("")

    const payload: ICreateDoctorPayload = {
      password: formValues.password,
      doctor: {
        name: formValues.name.trim(),
        email: formValues.email.trim(),
        contactNumber: formValues.contactNumber.trim(),
        registrationNumber: formValues.registrationNumber.trim(),
        gender: formValues.gender,
        appointmentFee: formValues.appointmentFee.trim() ? Number(formValues.appointmentFee) : Number.NaN,
        qualification: formValues.qualification.trim(),
        currentWorkingPlace: formValues.currentWorkingPlace.trim(),
        designation: formValues.designation.trim(),
        ...(formValues.address.trim() ? { address: formValues.address.trim() } : {}),
        ...(formValues.experience !== "" ? { experience: Number(formValues.experience) } : {}),
      },
      specialties: formValues.specialties,
    }

    const parsedPayload = createDoctorSchema.safeParse(payload)
    if (!parsedPayload.success) {
      const nextFieldErrors: Partial<Record<DoctorFormField, string>> = {}
      let firstInvalidField: DoctorFormField | undefined
      for (const issue of parsedPayload.error.issues) {
        const path = issue.path[0] === "doctor" ? issue.path[1] : issue.path[0]
        if (typeof path === "string" && isDoctorFormField(path)) {
          nextFieldErrors[path] ??= issue.message === "Invalid input"
            ? `Please enter a valid ${fieldLabels[path].toLowerCase()}.`
            : issue.message
          firstInvalidField ??= path
        }
      }
      setFieldErrors(nextFieldErrors)
      setSelectedSpecialtyError(nextFieldErrors.specialties ?? "")
      if (firstInvalidField) {
        const fieldElementId = firstInvalidField === "specialties"
          ? document.querySelector<HTMLElement>('[id^="doctor-specialty-"]')?.id
          : `doctor-${firstInvalidField}`
        if (fieldElementId) document.getElementById(fieldElementId)?.focus()
      }
      return
    }

    try {
      await createDoctorMutation.mutateAsync(parsedPayload.data)
    } catch {
      // The mutation's onError handler displays the API error in the form.
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={<Button type="button" className="shrink-0"><Plus aria-hidden="true" />Create doctor</Button>}
      />
      <DialogContent className="sm:max-w-3xl">
        <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
          <DialogHeader className="pr-14">
            <DialogTitle>Create doctor</DialogTitle>
            <DialogDescription>
              Enter the doctor profile and account details. Fields marked required must be provided.
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
            {formError && (
              <div role="alert" className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {formError}
              </div>
            )}

            <section className="space-y-3">
              <h3 className="text-sm font-semibold">Account details</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1.5 text-sm font-medium">
                  Full name *
                  <Input id="doctor-name" required minLength={5} maxLength={30} autoComplete="name" value={formValues.name} onChange={(event) => updateField("name", event.target.value)} aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? "doctor-name-error" : undefined} />
                  {fieldErrors.name && <p id="doctor-name-error" className="text-sm font-normal text-destructive" role="alert">{fieldErrors.name}</p>}
                </label>
                <label className="space-y-1.5 text-sm font-medium">
                  Email *
                  <Input id="doctor-email" required type="email" autoComplete="email" value={formValues.email} onChange={(event) => updateField("email", event.target.value)} aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? "doctor-email-error" : undefined} />
                  {fieldErrors.email && <p id="doctor-email-error" className="text-sm font-normal text-destructive" role="alert">{fieldErrors.email}</p>}
                </label>
                <label className="space-y-1.5 text-sm font-medium">
                  Temporary password *
                  <Input id="doctor-password" required type="password" minLength={6} maxLength={20} autoComplete="new-password" value={formValues.password} onChange={(event) => updateField("password", event.target.value)} aria-invalid={Boolean(fieldErrors.password)} aria-describedby={fieldErrors.password ? "doctor-password-error" : undefined} />
                  {fieldErrors.password && <p id="doctor-password-error" className="text-sm font-normal text-destructive" role="alert">{fieldErrors.password}</p>}
                </label>
                <label className="space-y-1.5 text-sm font-medium">
                  Contact number *
                  <Input id="doctor-contactNumber" required type="tel" autoComplete="tel" value={formValues.contactNumber} onChange={(event) => updateField("contactNumber", event.target.value)} aria-invalid={Boolean(fieldErrors.contactNumber)} aria-describedby={fieldErrors.contactNumber ? "doctor-contactNumber-error" : undefined} />
                  {fieldErrors.contactNumber && <p id="doctor-contactNumber-error" className="text-sm font-normal text-destructive" role="alert">{fieldErrors.contactNumber}</p>}
                </label>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-semibold">Professional details</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="space-y-1.5 text-sm font-medium">
                  Registration number *
                  <Input id="doctor-registrationNumber" required value={formValues.registrationNumber} onChange={(event) => updateField("registrationNumber", event.target.value)} aria-invalid={Boolean(fieldErrors.registrationNumber)} aria-describedby={fieldErrors.registrationNumber ? "doctor-registrationNumber-error" : undefined} />
                  {fieldErrors.registrationNumber && <p id="doctor-registrationNumber-error" className="text-sm font-normal text-destructive" role="alert">{fieldErrors.registrationNumber}</p>}
                </label>
                <label className="space-y-1.5 text-sm font-medium">
                  Gender *
                  <select
                    required
                    aria-label="Doctor gender"
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={formValues.gender}
                    onChange={(event) => updateField("gender", event.target.value as "MALE" | "FEMALE")}
                    aria-invalid={Boolean(fieldErrors.gender)}
                    aria-describedby={fieldErrors.gender ? "doctor-gender-error" : undefined}
                  >
                    <option value="FEMALE">Female</option>
                    <option value="MALE">Male</option>
                  </select>
                  {fieldErrors.gender && <p id="doctor-gender-error" className="text-sm font-normal text-destructive" role="alert">{fieldErrors.gender}</p>}
                </label>
                <label className="space-y-1.5 text-sm font-medium">
                  Designation *
                  <Input id="doctor-designation" required minLength={2} value={formValues.designation} onChange={(event) => updateField("designation", event.target.value)} aria-invalid={Boolean(fieldErrors.designation)} aria-describedby={fieldErrors.designation ? "doctor-designation-error" : undefined} />
                  {fieldErrors.designation && <p id="doctor-designation-error" className="text-sm font-normal text-destructive" role="alert">{fieldErrors.designation}</p>}
                </label>
                <label className="space-y-1.5 text-sm font-medium">
                  Qualification *
                  <Input id="doctor-qualification" required minLength={2} value={formValues.qualification} onChange={(event) => updateField("qualification", event.target.value)} aria-invalid={Boolean(fieldErrors.qualification)} aria-describedby={fieldErrors.qualification ? "doctor-qualification-error" : undefined} />
                  {fieldErrors.qualification && <p id="doctor-qualification-error" className="text-sm font-normal text-destructive" role="alert">{fieldErrors.qualification}</p>}
                </label>
                <label className="space-y-1.5 text-sm font-medium">
                  Current workplace *
                  <Input id="doctor-currentWorkingPlace" required minLength={2} value={formValues.currentWorkingPlace} onChange={(event) => updateField("currentWorkingPlace", event.target.value)} aria-invalid={Boolean(fieldErrors.currentWorkingPlace)} aria-describedby={fieldErrors.currentWorkingPlace ? "doctor-currentWorkingPlace-error" : undefined} />
                  {fieldErrors.currentWorkingPlace && <p id="doctor-currentWorkingPlace-error" className="text-sm font-normal text-destructive" role="alert">{fieldErrors.currentWorkingPlace}</p>}
                </label>
                <label className="space-y-1.5 text-sm font-medium">
                  Experience (years)
                  <Input id="doctor-experience" type="number" min="0" step="1" value={formValues.experience} onChange={(event) => updateField("experience", event.target.value)} aria-invalid={Boolean(fieldErrors.experience)} aria-describedby={fieldErrors.experience ? "doctor-experience-error" : undefined} />
                  {fieldErrors.experience && <p id="doctor-experience-error" className="text-sm font-normal text-destructive" role="alert">{fieldErrors.experience}</p>}
                </label>
                <label className="space-y-1.5 text-sm font-medium">
                  Appointment fee *
                  <Input id="doctor-appointmentFee" required type="number" min="0" step="0.01" value={formValues.appointmentFee} onChange={(event) => updateField("appointmentFee", event.target.value)} aria-invalid={Boolean(fieldErrors.appointmentFee)} aria-describedby={fieldErrors.appointmentFee ? "doctor-appointmentFee-error" : undefined} />
                  {fieldErrors.appointmentFee && <p id="doctor-appointmentFee-error" className="text-sm font-normal text-destructive" role="alert">{fieldErrors.appointmentFee}</p>}
                </label>
                <label className="space-y-1.5 text-sm font-medium sm:col-span-2">
                  Address
                  <Input id="doctor-address" autoComplete="street-address" value={formValues.address} onChange={(event) => updateField("address", event.target.value)} aria-invalid={Boolean(fieldErrors.address)} aria-describedby={fieldErrors.address ? "doctor-address-error" : undefined} />
                  {fieldErrors.address && <p id="doctor-address-error" className="text-sm font-normal text-destructive" role="alert">{fieldErrors.address}</p>}
                </label>
              </div>
            </section>

            <fieldset
              className="space-y-2"
              aria-invalid={Boolean(fieldErrors.specialties)}
              aria-describedby={fieldErrors.specialties ? "doctor-specialties-error" : undefined}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <legend className="text-sm font-semibold">Specialties *</legend>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAddingSpecialty((current) => !current)
                    setSpecialtyCreateError("")
                  }}
                  disabled={specialtiesLoading || specialtiesError}
                >
                  <Plus aria-hidden="true" />
                  Add another specialty
                </Button>
              </div>
              {isAddingSpecialty && (
                <div className="flex flex-col gap-2 rounded-md border bg-muted/20 p-3 sm:flex-row">
                  <Input
                    aria-label="New specialty name"
                    placeholder="Enter a specialty name"
                    value={newSpecialtyTitle}
                    maxLength={100}
                    onChange={(event) => setNewSpecialtyTitle(event.target.value)}
                    disabled={createSpecialtyMutation.isPending}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCreateSpecialty}
                    disabled={createSpecialtyMutation.isPending}
                  >
                    {createSpecialtyMutation.isPending ? "Adding..." : "Add specialty"}
                  </Button>
                </div>
              )}
              {specialtyCreateError && (
                <p className="text-sm text-destructive" role="alert">{specialtyCreateError}</p>
              )}
              {specialtiesLoading ? (
                <p className="text-sm text-muted-foreground">Loading specialties...</p>
              ) : specialtiesError ? (
                <p className="text-sm text-destructive" role="alert">Could not load specialties. Close and reopen the form to try again.</p>
              ) : specialties.length === 0 ? (
                <p className="text-sm text-muted-foreground">No specialties are available.</p>
              ) : (
                <div className="grid max-h-40 gap-2 overflow-y-auto rounded-md border p-3 sm:grid-cols-2">
                  {specialties.map((specialty) => (
                    <div key={specialty.id} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        id={`doctor-specialty-${specialty.id}`}
                        checked={formValues.specialties.includes(specialty.id)}
                        onCheckedChange={(checked) => {
                          const nextSpecialties = checked
                            ? [...formValues.specialties, specialty.id]
                            : formValues.specialties.filter((id) => id !== specialty.id)
                          updateField("specialties", nextSpecialties)
                          setSelectedSpecialtyError("")
                        }}
                        aria-label={specialty.title}
                        aria-invalid={Boolean(fieldErrors.specialties)}
                        aria-describedby={fieldErrors.specialties ? "doctor-specialties-error" : undefined}
                      />
                      <label htmlFor={`doctor-specialty-${specialty.id}`} className="cursor-pointer select-none">
                        {specialty.title}
                      </label>
                    </div>
                  ))}
                </div>
              )}
              {selectedSpecialtyError && <p id="doctor-specialties-error" className="text-sm text-destructive" role="alert">{selectedSpecialtyError}</p>}
            </fieldset>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={createDoctorMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={createDoctorMutation.isPending || specialtiesLoading || specialtiesError || specialties.length === 0}>
              {createDoctorMutation.isPending ? "Creating doctor..." : "Create doctor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateDoctorSheet
