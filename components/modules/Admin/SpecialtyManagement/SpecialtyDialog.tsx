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
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { createSpecialty, type ICreateSpecialtyPayload } from "@/services/specialty.services"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { useState, type FormEvent } from "react"
import { z } from "zod"

interface SpecialtyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const specialtySchema = z.object({
  title: z.string().trim().min(1, "Enter a specialty name.").max(100, "Specialty names must be 100 characters or fewer."),
  description: z.string().trim().max(1000, "Descriptions must be 1,000 characters or fewer."),
})

type SpecialtyFormValues = ICreateSpecialtyPayload
type SpecialtyFormField = keyof SpecialtyFormValues

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "The specialty could not be created. Please try again."
  }
  return error instanceof Error ? error.message : "The specialty could not be created. Please try again."
}

export default function SpecialtyDialog({ open, onOpenChange }: SpecialtyDialogProps) {
  const queryClient = useQueryClient()
  const [values, setValues] = useState<SpecialtyFormValues>({ title: "", description: "" })
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<SpecialtyFormField, string>>>({})
  const [formError, setFormError] = useState("")

  const mutation = useMutation({
    mutationFn: createSpecialty,
    onSuccess: async (response) => {
      if (!response.success) {
        setFormError(response.message || "The specialty could not be created.")
        return
      }

      await queryClient.invalidateQueries({ queryKey: ["specialties"] })
      onOpenChange(false)
      setValues({ title: "", description: "" })
      toast.add({ title: "Specialty created", type: "success" })
    },
    onError: (error) => setFormError(getErrorMessage(error)),
  })

  const updateField = (field: SpecialtyFormField, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: undefined }))
    setFormError("")
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError("")
    const result = specialtySchema.safeParse(values)
    if (!result.success) {
      const nextErrors: Partial<Record<SpecialtyFormField, string>> = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0]
        if (typeof field === "string" && field in values) {
          nextErrors[field as SpecialtyFormField] ??= issue.message
        }
      }
      setFieldErrors(nextErrors)
      const firstInvalidField = Object.keys(nextErrors)[0]
      if (firstInvalidField) document.getElementById(`specialty-${firstInvalidField}`)?.focus()
      return
    }

    mutation.mutate({
      title: result.data.title,
      ...(result.data.description ? { description: result.data.description } : {}),
    })
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (mutation.isPending) return
    if (!nextOpen) {
      setFormError("")
      setFieldErrors({})
    }
    onOpenChange(nextOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
          <DialogHeader>
            <DialogTitle>Add specialty</DialogTitle>
            <DialogDescription>
              Add a specialty to the catalog so it can be assigned to doctors.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
            {formError && (
              <Alert variant="destructive">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
            <label htmlFor="specialty-title" className="flex flex-col gap-1.5 text-sm font-medium">
              Specialty name
              <Input
                id="specialty-title"
                value={values.title}
                onChange={(event) => updateField("title", event.target.value)}
                maxLength={100}
                aria-invalid={Boolean(fieldErrors.title)}
                aria-describedby={fieldErrors.title ? "specialty-title-error" : undefined}
                autoFocus
              />
              {fieldErrors.title && (
                <span id="specialty-title-error" className="text-sm font-normal text-destructive" role="alert">
                  {fieldErrors.title}
                </span>
              )}
            </label>

            <label htmlFor="specialty-description" className="flex flex-col gap-1.5 text-sm font-medium">
              Description <span className="font-normal text-muted-foreground">(optional)</span>
              <Textarea
                id="specialty-description"
                value={values.description}
                onChange={(event) => updateField("description", event.target.value)}
                maxLength={1000}
                rows={4}
                aria-invalid={Boolean(fieldErrors.description)}
                aria-describedby={fieldErrors.description ? "specialty-description-error" : undefined}
              />
              {fieldErrors.description && (
                <span id="specialty-description-error" className="text-sm font-normal text-destructive" role="alert">
                  {fieldErrors.description}
                </span>
              )}
            </label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating..." : "Create specialty"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
