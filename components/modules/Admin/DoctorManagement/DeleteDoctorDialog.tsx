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
import { deleteDoctor } from "@/services/doctor.services"
import type { IDoctor } from "@/types/doctor.types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { useState } from "react"

interface DeleteDoctorDialogProps {
  doctor: IDoctor | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "We couldn’t delete this doctor. Please try again."
  }
  return "We couldn’t delete this doctor. Please try again."
}

const DeleteDoctorDialog = ({ doctor, open, onOpenChange }: DeleteDoctorDialogProps) => {
  const queryClient = useQueryClient()
  const [formError, setFormError] = useState("")

  const deleteMutation = useMutation({
    mutationFn: (doctorId: string) => deleteDoctor(doctorId),
    onSuccess: async (response) => {
      if (!response.success) {
        setFormError(response.message || "The doctor could not be deleted.")
        return
      }

      await queryClient.invalidateQueries({ queryKey: ["doctors"] })
      onOpenChange(false)
      toast.add({
        title: "Doctor deleted",
        description: `${doctor?.name ?? "The doctor"} has been removed from the doctors list.`,
        type: "success",
      })
    },
    onError: (error) => setFormError(getErrorMessage(error)),
  })

  const handleOpenChange = (nextOpen: boolean) => {
    if (deleteMutation.isPending) return
    if (!nextOpen) setFormError("")
    onOpenChange(nextOpen)
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete doctor?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove <strong>{doctor?.name ?? "this doctor"}</strong> from the active doctors list and deactivate their account. This action cannot be undone from this screen.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {formError && (
          <Alert variant="destructive">
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending} onClick={() => setFormError("")}>
            Cancel
          </AlertDialogCancel>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              if (doctor) deleteMutation.mutate(doctor.id)
            }}
            disabled={!doctor || deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete doctor"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteDoctorDialog
