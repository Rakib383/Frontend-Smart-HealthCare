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
import { Button } from "@/components/ui/button"
import DataTable from "@/components/shared/table/DataTable"
import useManagementTable from "@/components/shared/table/useManagementTable"
import { toast } from "@/components/ui/toast"
import { changeUserStatus } from "@/services/admin.services"
import { deletePatient, getPatients, IManagedPatient } from "@/services/patient.services"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { useState } from "react"
import { getPatientColumns } from "./patientsColumns"

type SearchParams = Record<string, string | string[] | undefined>

const EMPTY_PATIENTS: IManagedPatient[] = []

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "The request could not be completed. Please try again."
  }
  return error instanceof Error ? error.message : "The request could not be completed. Please try again."
}

export default function PatientsTable({
  queryString,
  queryParamsObject,
}: {
  queryString: string
  queryParamsObject: SearchParams
}) {
  const queryClient = useQueryClient()
  const [deletingPatient, setDeletingPatient] = useState<IManagedPatient | null>(null)
  const patientsQuery = useQuery({
    queryKey: ["patients", queryParamsObject],
    queryFn: () => getPatients(queryString),
  })

  const refreshPatients = () => queryClient.invalidateQueries({ queryKey: ["patients"] })
  const statusMutation = useMutation({
    mutationFn: changeUserStatus,
    onSuccess: async () => {
      await refreshPatients()
      toast.add({ title: "Patient status updated", type: "success" })
    },
    onError: (error) => toast.add({
      title: "Could not update patient status",
      description: getErrorMessage(error),
      type: "error",
    }),
  })
  const deleteMutation = useMutation({
    mutationFn: deletePatient,
    onSuccess: async () => {
      await refreshPatients()
      setDeletingPatient(null)
      toast.add({ title: "Patient deleted", description: "The account was deactivated.", type: "success" })
    },
    onError: (error) => toast.add({
      title: "Could not delete patient",
      description: getErrorMessage(error),
      type: "error",
    }),
  })

  const patients = patientsQuery.data?.data ?? EMPTY_PATIENTS
  const paginationMeta = patientsQuery.data?.meta
  const { page, pageSize, searchTerm, handlePageChange, handlePageSizeChange, handleSearch } = useManagementTable({
    queryParams: queryParamsObject,
    pageInfo: {
      page: paginationMeta?.page,
      pageSize: paginationMeta?.limit,
    },
  })

  const columns = getPatientColumns((patient, status) => {
    statusMutation.mutate({ userId: patient.userId, userStatus: status })
  }, statusMutation.isPending)

  if (patientsQuery.isError) {
    return (
      <div className="space-y-3 rounded-lg border border-destructive/40 p-4" role="alert">
        <p className="text-sm text-destructive">{getErrorMessage(patientsQuery.error)}</p>
        <Button type="button" variant="outline" size="sm" onClick={() => void patientsQuery.refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={patients}
        isLoading={patientsQuery.isLoading || patientsQuery.isFetching}
        emptyMessage="No patient accounts found."
        search={{
          value: searchTerm,
          onChange: handleSearch,
          placeholder: "Search patients...",
          debounceMs: 400,
        }}
        pagination={{
          page,
          pageSize,
          total: paginationMeta?.total ?? patients.length,
          totalPages: Math.max(1, paginationMeta?.totalPages ?? 1),
          onPageChange: handlePageChange,
          onPageSizeChange: handlePageSizeChange,
        }}
        actions={{
          onDelete: setDeletingPatient,
        }}
      />

      <AlertDialog
        open={Boolean(deletingPatient)}
        onOpenChange={(open) => {
          if (!deleteMutation.isPending && !open) setDeletingPatient(null)
        }}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete patient account?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingPatient?.name}&apos;s account will be deactivated and their active sessions removed. This cannot be undone from this screen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (deletingPatient) deleteMutation.mutate(deletingPatient.id)
              }}
              disabled={!deletingPatient || deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete patient"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
