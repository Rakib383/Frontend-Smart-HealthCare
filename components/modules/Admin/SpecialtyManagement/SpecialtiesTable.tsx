"use client"

import DataTable from "@/components/shared/table/DataTable"
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
import { deleteSpecialty, getSpecialties, type ISpecialtyOption } from "@/services/specialty.services"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { Plus } from "lucide-react"
import { useMemo, useState } from "react"
import SpecialtyDialog from "./SpecialtyDialog"
import { specialtyColumns } from "./specialtyColumns"

const EMPTY_SPECIALTIES: ISpecialtyOption[] = []
const PAGE_SIZE = 10

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "The request could not be completed. Please try again."
  }
  return error instanceof Error ? error.message : "The request could not be completed. Please try again."
}

export default function SpecialtiesTable() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [specialtyToDelete, setSpecialtyToDelete] = useState<ISpecialtyOption | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(PAGE_SIZE)
  const specialtiesQuery = useQuery({
    queryKey: ["specialties"],
    queryFn: getSpecialties,
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSpecialty(id),
    onSuccess: async (response) => {
      if (!response.success) {
        toast.add({
          title: "Could not delete specialty",
          description: response.message || "The specialty could not be deleted.",
          type: "error",
        })
        return
      }

      await queryClient.invalidateQueries({ queryKey: ["specialties"] })
      setSpecialtyToDelete(null)
      toast.add({
        title: "Specialty deleted",
        description: "Doctors previously assigned to this specialty will no longer have it assigned.",
        type: "success",
      })
    },
    onError: (error) => toast.add({
      title: "Could not delete specialty",
      description: getErrorMessage(error),
      type: "error",
    }),
  })

  const specialties = specialtiesQuery.data?.data ?? EMPTY_SPECIALTIES
  const filteredSpecialties = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return specialties
    return specialties.filter((specialty) =>
      [specialty.title, specialty.description ?? ""].some((value) => value.toLowerCase().includes(term)),
    )
  }, [specialties, searchTerm])
  const totalPages = Math.max(1, Math.ceil(filteredSpecialties.length / pageSize))
  const visibleSpecialties = filteredSpecialties.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Specialty management</h1>
          <p className="text-sm text-muted-foreground">
            Manage the specialty catalog used to categorize and filter doctors.
          </p>
        </div>
        <Button type="button" onClick={() => setDialogOpen(true)}>
          <Plus aria-hidden="true" />
          Add specialty
        </Button>
      </header>

      {specialtiesQuery.isError ? (
        <div className="space-y-3 rounded-lg border border-destructive/40 p-4" role="alert">
          <p className="text-sm text-destructive">{getErrorMessage(specialtiesQuery.error)}</p>
          <Button type="button" variant="outline" size="sm" onClick={() => void specialtiesQuery.refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <DataTable
          columns={specialtyColumns}
          data={visibleSpecialties}
          actions={{ onDelete: setSpecialtyToDelete }}
          isLoading={specialtiesQuery.isLoading || specialtiesQuery.isFetching}
          emptyMessage="No specialties match your search."
          search={{
            value: searchTerm,
            onChange: (value) => {
              setSearchTerm(value)
              setPage(1)
            },
            placeholder: "Search specialties...",
            debounceMs: 300,
          }}
          pagination={{
            page,
            pageSize,
            total: filteredSpecialties.length,
            totalPages,
            onPageChange: setPage,
            onPageSizeChange: (value) => {
              setPageSize(value)
              setPage(1)
            },
          }}
        />
      )}

      <SpecialtyDialog
        key={dialogOpen ? "open-specialty-dialog" : "closed-specialty-dialog"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <AlertDialog
        open={specialtyToDelete !== null}
        onOpenChange={(open) => {
          if (!deleteMutation.isPending && !open) setSpecialtyToDelete(null)
        }}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete specialty?</AlertDialogTitle>
            <AlertDialogDescription>
              Delete <strong>{specialtyToDelete?.title}</strong>? Doctors assigned to this specialty will lose that assignment. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={!specialtyToDelete || deleteMutation.isPending}
              onClick={() => {
                if (specialtyToDelete) deleteMutation.mutate(specialtyToDelete.id)
              }}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete specialty"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
