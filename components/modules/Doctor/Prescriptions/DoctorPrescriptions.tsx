"use client"

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { getMyDoctorAppointments } from "@/services/appointment.services"
import {
  createPrescription,
  deletePrescription,
  getMyPrescriptions,
  type ICreatePrescriptionPayload,
  type IManagedPrescription,
  updatePrescription,
} from "@/services/prescription.services"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { format } from "date-fns"
import {
  CalendarClock,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FilePlus2,
  FileText,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react"
import { useMemo, useState } from "react"
import PrescriptionFormDialog from "./PrescriptionFormDialog"

const EMPTY_PRESCRIPTIONS: IManagedPrescription[] = []

const formatDate = (value: string | Date) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "Date unavailable" : format(date, "MMM d, yyyy")
}

const getSafePdfUrl = (value: string | null) => {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === "https:" ? url.toString() : null
  } catch {
    return null
  }
}

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "The request could not be completed. Please try again."
  }
  return error instanceof Error ? error.message : "The request could not be completed. Please try again."
}

const DoctorPrescriptions = () => {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPrescription, setEditingPrescription] = useState<IManagedPrescription | null>(null)
  const [prescriptionToDelete, setPrescriptionToDelete] = useState<IManagedPrescription | null>(null)
  const [deleteError, setDeleteError] = useState("")

  const prescriptionsQuery = useQuery({
    queryKey: ["doctor-prescriptions"],
    queryFn: getMyPrescriptions,
  })

  const appointmentsQuery = useQuery({
    queryKey: ["doctor-appointments"],
    queryFn: getMyDoctorAppointments,
  })

  const prescriptions = prescriptionsQuery.data?.data ?? EMPTY_PRESCRIPTIONS
  const prescribedAppointmentIds = useMemo(
    () => new Set(prescriptions.map((prescription) => prescription.appointmentId)),
    [prescriptions],
  )
  const availableAppointments = useMemo(
    () => (appointmentsQuery.data?.data ?? []).filter(
      (appointment) =>
        appointment.status === "COMPLETED"
        && !prescribedAppointmentIds.has(appointment.id),
    ),
    [appointmentsQuery.data?.data, prescribedAppointmentIds],
  )

  const filteredPrescriptions = useMemo(() => {
    const term = search.trim().toLowerCase()
    return [...prescriptions]
      .filter((prescription) =>
        !term
        || prescription.patient.name.toLowerCase().includes(term)
        || prescription.patient.email.toLowerCase().includes(term)
        || prescription.instructions.toLowerCase().includes(term),
      )
      .sort((left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
      )
  }, [prescriptions, search])

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingPrescription(null)
  }

  const createMutation = useMutation({
    mutationFn: async (payload: ICreatePrescriptionPayload) => {
      const response = await createPrescription(payload)
      if (!response.success) throw new Error(response.message || "The prescription could not be created.")
      return response
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["doctor-prescriptions"] })
      closeForm()
      toast.add({
        title: "Prescription created",
        description: "The prescription was saved and sent to the patient.",
        type: "success",
      })
    },
    onError: (error) => {
      toast.add({
        title: "Could not create prescription",
        description: getErrorMessage(error),
        type: "error",
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({
      prescriptionId,
      payload,
    }: {
      prescriptionId: string
      payload: ICreatePrescriptionPayload
    }) => {
      const response = await updatePrescription(prescriptionId, {
        instructions: payload.instructions,
        followUpDate: payload.followUpDate,
      })
      if (!response.success) throw new Error(response.message || "The prescription could not be updated.")
      return response
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["doctor-prescriptions"] })
      closeForm()
      toast.add({
        title: "Prescription updated",
        description: "The updated prescription was saved and sent to the patient.",
        type: "success",
      })
    },
    onError: (error) => {
      toast.add({
        title: "Could not update prescription",
        description: getErrorMessage(error),
        type: "error",
      })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (prescriptionId: string) => {
      const response = await deletePrescription(prescriptionId)
      if (!response.success) throw new Error(response.message || "The prescription could not be deleted.")
      return response
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["doctor-prescriptions"] })
      setPrescriptionToDelete(null)
      setDeleteError("")
      toast.add({
        title: "Prescription deleted",
        description: "The prescription was removed.",
        type: "success",
      })
    },
    onError: (error) => {
      const message = getErrorMessage(error)
      setDeleteError(message)
      toast.add({
        title: "Could not delete prescription",
        description: message,
        type: "error",
      })
    },
  })

  const handleSave = async (payload: ICreatePrescriptionPayload) => {
    if (editingPrescription) {
      await updateMutation.mutateAsync({
        prescriptionId: editingPrescription.id,
        payload,
      })
      return
    }
    await createMutation.mutateAsync(payload)
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">My prescriptions</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage prescriptions for your completed patient appointments.
          </p>
        </div>
        <Button
          type="button"
          className="w-full sm:w-auto"
          disabled={appointmentsQuery.isPending || appointmentsQuery.isError}
          onClick={() => {
            setEditingPrescription(null)
            setIsFormOpen(true)
          }}
        >
          <FilePlus2 aria-hidden="true" />
          New prescription
        </Button>
      </header>

      <section className="grid gap-3 sm:grid-cols-2" aria-label="Prescription summary">
        <Card size="sm">
          <CardContent className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Prescriptions issued</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {prescriptionsQuery.isPending ? "—" : prescriptions.length}
              </p>
            </div>
            <FileText className="size-5 text-primary" aria-hidden="true" />
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-muted-foreground">Completed visits to prescribe</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {appointmentsQuery.isPending ? "—" : availableAppointments.length}
              </p>
            </div>
            <CalendarClock className="size-5 text-primary" aria-hidden="true" />
          </CardContent>
        </Card>
      </section>

      {prescriptionsQuery.isError && (
        <Alert variant="destructive">
          <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{getErrorMessage(prescriptionsQuery.error)}</span>
            <Button type="button" variant="outline" size="sm" onClick={() => void prescriptionsQuery.refetch()}>
              <RefreshCw aria-hidden="true" />
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {appointmentsQuery.isError && (
        <Alert variant="destructive">
          <AlertDescription className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>Completed appointments could not be loaded, so a prescription cannot be created right now.</span>
            <Button type="button" variant="outline" size="sm" onClick={() => void appointmentsQuery.refetch()}>
              <RefreshCw aria-hidden="true" />
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <section className="space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            placeholder="Search patients or instructions..."
            aria-label="Search prescriptions"
            className="pl-9"
          />
        </div>

        {prescriptionsQuery.isPending ? (
          <div className="space-y-3" aria-label="Loading prescriptions">
            {[0, 1, 2].map((item) => (
              <Card key={item}>
                <CardContent className="space-y-3">
                  <div className="h-5 w-48 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-full max-w-lg animate-pulse rounded bg-muted" />
                  <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !prescriptionsQuery.isError && filteredPrescriptions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <FileText className="size-6" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-semibold">
                  {prescriptions.length === 0 ? "No prescriptions yet" : "No matching prescriptions"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {prescriptions.length === 0
                    ? "Prescriptions you issue will appear here."
                    : "Try searching for a different patient or instruction."}
                </p>
              </div>
              {prescriptions.length === 0 && availableAppointments.length > 0 && (
                <Button
                  type="button"
                  onClick={() => {
                    setEditingPrescription(null)
                    setIsFormOpen(true)
                  }}
                >
                  <FilePlus2 aria-hidden="true" />
                  Create a prescription
                </Button>
              )}
            </CardContent>
          </Card>
        ) : !prescriptionsQuery.isError ? (
          <div className="space-y-3">
            {filteredPrescriptions.map((prescription) => {
              const isExpanded = expandedId === prescription.id
              const pdfUrl = getSafePdfUrl(prescription.pdfUrl)
              return (
                <Card key={prescription.id}>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                          {prescription.patient.name.slice(0, 1).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <h2 className="truncate font-semibold">{prescription.patient.name}</h2>
                          <p className="truncate text-sm text-muted-foreground">{prescription.patient.email}</p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        Follow-up: {formatDate(prescription.followUpDate)}
                      </Badge>
                    </div>

                    <div className="grid gap-3 border-t pt-4 sm:grid-cols-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Appointment</p>
                        <p className="mt-1 text-sm font-medium">
                          {formatDate(prescription.appointment.schedule.startDateTime)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Issued</p>
                        <p className="mt-1 text-sm font-medium">{formatDate(prescription.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Prescription ID</p>
                        <p className="mt-1 break-all font-mono text-xs">{prescription.id}</p>
                      </div>
                    </div>

                    <section className="space-y-2 border-t pt-4">
                      <h3 className="text-sm font-semibold">Instructions</h3>
                      <p className={`whitespace-pre-wrap break-words text-sm leading-relaxed ${
                        isExpanded ? "" : "line-clamp-4"
                      }`}>
                        {prescription.instructions}
                      </p>
                      {prescription.instructions.length > 240 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="px-0"
                          aria-expanded={isExpanded}
                          onClick={() => setExpandedId(isExpanded ? null : prescription.id)}
                        >
                          {isExpanded ? "Show less" : "Read full instructions"}
                          {isExpanded
                            ? <ChevronUp aria-hidden="true" />
                            : <ChevronDown aria-hidden="true" />}
                        </Button>
                      )}
                    </section>

                    <div className="flex flex-col gap-2 border-t pt-3 sm:flex-row sm:items-center sm:justify-between">
                      {pdfUrl ? (
                        <a
                          href={pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-10 items-center gap-2 rounded-md border px-3 text-sm font-medium text-primary hover:bg-muted"
                        >
                          Open prescription PDF
                          <ExternalLink className="size-4" aria-hidden="true" />
                        </a>
                      ) : (
                        <p className="text-sm text-muted-foreground">Prescription PDF is not available.</p>
                      )}
                      <div className="flex gap-2 sm:justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingPrescription(prescription)
                            setIsFormOpen(true)
                          }}
                        >
                          <Pencil aria-hidden="true" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setDeleteError("")
                            setPrescriptionToDelete(prescription)
                          }}
                        >
                          <Trash2 aria-hidden="true" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : null}
      </section>

      {isFormOpen && (
        <PrescriptionFormDialog
          open={isFormOpen}
          prescription={editingPrescription}
          appointments={availableAppointments}
          isLoadingAppointments={appointmentsQuery.isPending}
          isSaving={isSaving}
          onOpenChange={setIsFormOpen}
          onSubmit={handleSave}
        />
      )}

      <AlertDialog
        open={prescriptionToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deleteMutation.isPending) {
            setPrescriptionToDelete(null)
            setDeleteError("")
          }
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this prescription?</AlertDialogTitle>
            <AlertDialogDescription>
              {prescriptionToDelete
                ? `This will permanently remove the prescription for ${prescriptionToDelete.patient.name}.`
                : "This will permanently remove the selected prescription."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <Alert variant="destructive">
              <AlertDescription>{deleteError}</AlertDescription>
            </Alert>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending} onClick={() => setDeleteError("")}>
              Keep prescription
            </AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={!prescriptionToDelete || deleteMutation.isPending}
              onClick={() => {
                if (prescriptionToDelete) deleteMutation.mutate(prescriptionToDelete.id)
              }}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete prescription"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default DoctorPrescriptions
