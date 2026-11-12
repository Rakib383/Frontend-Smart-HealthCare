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
import { toast } from "@/components/ui/toast"
import { updateDoctor } from "@/services/doctor.services"
import type { ISpecialtyOption } from "@/services/specialty.services"
import type { IDoctor } from "@/types/doctor.types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { useState, type FormEvent } from "react"
import { getDoctorSpecialtyAssignments } from "./specialtyAssignment"

interface ManageDoctorSpecialtiesDialogProps {
  doctor: IDoctor | null
  specialties: ISpecialtyOption[]
  specialtiesLoading: boolean
  specialtiesError: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "Could not update this doctor’s specialties. Please try again."
  }
  return error instanceof Error ? error.message : "Could not update this doctor’s specialties. Please try again."
}

export default function ManageDoctorSpecialtiesDialog({
  doctor,
  specialties,
  specialtiesLoading,
  specialtiesError,
  open,
  onOpenChange,
}: ManageDoctorSpecialtiesDialogProps) {
  const queryClient = useQueryClient()
  const initialIds = doctor
    ? getDoctorSpecialtyAssignments(doctor, specialties).map((assignment) => assignment.id).filter(Boolean)
    : []
  const [selectedIds, setSelectedIds] = useState<string[]>(initialIds)
  const [formError, setFormError] = useState("")

  const mutation = useMutation({
    mutationFn: async () => {
      if (!doctor) throw new Error("Choose a doctor before saving specialties.")

      const currentIds = new Set(initialIds)
      const selectedIdSet = new Set(selectedIds)
      const changes = [
        ...selectedIds.filter((id) => !currentIds.has(id)).map((specialtyId) => ({ specialtyId })),
        ...initialIds.filter((id) => !selectedIdSet.has(id)).map((specialtyId) => ({ specialtyId, shouldDelete: true })),
      ]

      if (changes.length === 0) return null
      return updateDoctor(doctor.id, { specialties: changes })
    },
    onSuccess: async (response) => {
      if (response && (!response.success || !response.data)) {
        setFormError(response.message || "The doctor’s specialties could not be updated.")
        return
      }

      await queryClient.invalidateQueries({ queryKey: ["doctors"] })
      if (doctor) await queryClient.invalidateQueries({ queryKey: ["doctor", doctor.id] })
      onOpenChange(false)
      toast.add({
        title: "Doctor specialties updated",
        description: `${doctor?.name}’s specialty assignments have been saved.`,
        type: "success",
      })
    },
    onError: (error) => setFormError(getErrorMessage(error)),
  })

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError("")
    if (!doctor) return
    if (selectedIds.length === 0) {
      setFormError("Select at least one specialty for this doctor.")
      return
    }
    mutation.mutate()
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (mutation.isPending) return
    if (!nextOpen) setFormError("")
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <DialogHeader className="pr-14">
            <DialogTitle>Manage doctor specialties</DialogTitle>
            <DialogDescription>
              Assign specialties to {doctor?.name ?? "this doctor"}. At least one specialty must remain assigned.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            {formError && (
              <Alert variant="destructive">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
            {specialtiesLoading ? (
              <p className="py-8 text-center text-sm text-muted-foreground" role="status">
                Loading specialties…
              </p>
            ) : specialtiesError ? (
              <p className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive" role="alert">
                Could not load specialties. Close this dialog and try again.
              </p>
            ) : specialties.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No specialties are available. Add a specialty to the catalog first.
              </p>
            ) : (
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">Available specialties</legend>
                <div className="grid max-h-72 gap-2 overflow-y-auto rounded-lg border p-3 sm:grid-cols-2">
                  {specialties.map((specialty) => (
                    <label
                      key={specialty.id}
                      htmlFor={`doctor-specialty-${specialty.id}`}
                      className="flex cursor-pointer items-center gap-2 rounded-md p-2 text-sm hover:bg-muted/60"
                    >
                      <Checkbox
                        id={`doctor-specialty-${specialty.id}`}
                        checked={selectedIds.includes(specialty.id)}
                        onCheckedChange={(checked) => {
                          setSelectedIds((current) => checked === true
                            ? current.includes(specialty.id) ? current : [...current, specialty.id]
                            : current.filter((id) => id !== specialty.id))
                          setFormError("")
                        }}
                        disabled={mutation.isPending}
                      />
                      {specialty.title}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !doctor
                || mutation.isPending
                || specialtiesLoading
                || specialtiesError
                || specialties.length === 0
                || selectedIds.length === 0
                || selectedIds.length === initialIds.length && selectedIds.every((id) => initialIds.includes(id))
              }
            >
              {mutation.isPending ? "Saving..." : "Save specialties"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
