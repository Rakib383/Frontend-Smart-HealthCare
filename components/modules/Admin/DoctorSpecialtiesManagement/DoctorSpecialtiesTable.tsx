"use client"

import DataTable from "@/components/shared/table/DataTable"
import useManagementTable from "@/components/shared/table/useManagementTable"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getDoctors } from "@/services/doctor.services"
import { getSpecialties } from "@/services/specialty.services"
import type { ISpecialtyOption } from "@/services/specialty.services"
import type { IDoctor } from "@/types/doctor.types"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { getDoctorSpecialtyColumns } from "./doctorSpecialtyColumns"
import ManageDoctorSpecialtiesDialog from "./ManageDoctorSpecialtiesDialog"

type SearchParams = Record<string, string | string[] | undefined>

const EMPTY_DOCTORS: IDoctor[] = []
const EMPTY_SPECIALTIES: ISpecialtyOption[] = []
const SPECIALTY_FILTER = "specialties.specialty.title"

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "The request could not be completed. Please try again."
  }
  return error instanceof Error ? error.message : "The request could not be completed. Please try again."
}

interface DoctorSpecialtiesTableProps {
  queryString: string
  queryParams: SearchParams
}

export default function DoctorSpecialtiesTable({ queryString, queryParams }: DoctorSpecialtiesTableProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [editingDoctor, setEditingDoctor] = useState<IDoctor | null>(null)

  const doctorsQuery = useQuery({
    queryKey: ["doctors", queryParams],
    queryFn: () => getDoctors(queryString),
  })
  const specialtiesQuery = useQuery({
    queryKey: ["specialties"],
    queryFn: getSpecialties,
    staleTime: 5 * 60 * 1000,
  })

  const doctors = doctorsQuery.data?.data ?? EMPTY_DOCTORS
  const paginationMeta = doctorsQuery.data?.meta
  const specialties = specialtiesQuery.data?.data ?? EMPTY_SPECIALTIES
  const { page, pageSize, searchTerm, handlePageChange, handlePageSizeChange, handleSearch } = useManagementTable({
    queryParams,
    pageInfo: {
      page: paginationMeta?.page,
      pageSize: paginationMeta?.limit,
    },
  })
  const selectedSpecialty = searchParams.get(SPECIALTY_FILTER) ?? "ALL"

  const handleSpecialtyFilterChange = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete(SPECIALTY_FILTER)
    if (value && value !== "ALL") params.set(SPECIALTY_FILTER, value)
    params.set("page", "1")
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const columns = getDoctorSpecialtyColumns(specialties, setEditingDoctor)

  return (
    <div className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Doctor specialties</h1>
        <p className="text-sm text-muted-foreground">
          Assign catalog specialties to doctors and review each doctor’s current specialty profile.
        </p>
      </header>

      {specialtiesQuery.isError && (
        <div className="flex flex-col gap-3 rounded-lg border border-destructive/40 p-4 sm:flex-row sm:items-center sm:justify-between" role="alert">
          <p className="text-sm text-destructive">
            {getErrorMessage(specialtiesQuery.error)}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={() => void specialtiesQuery.refetch()}>
            Retry specialty list
          </Button>
        </div>
      )}

      {doctorsQuery.isError ? (
        <div className="space-y-3 rounded-lg border border-destructive/40 p-4" role="alert">
          <p className="text-sm text-destructive">{getErrorMessage(doctorsQuery.error)}</p>
          <Button type="button" variant="outline" size="sm" onClick={() => void doctorsQuery.refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={doctors}
          isLoading={doctorsQuery.isLoading || doctorsQuery.isFetching}
          emptyMessage="No doctors match your search."
          search={{
            value: searchTerm,
            onChange: handleSearch,
            placeholder: "Search doctors or specialties...",
            debounceMs: 400,
          }}
          toolbar={(
            <Select value={selectedSpecialty} onValueChange={handleSpecialtyFilterChange}>
              <SelectTrigger aria-label="Filter doctors by specialty" className="w-full sm:w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All specialties</SelectItem>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty.id} value={specialty.title}>{specialty.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          pagination={{
            page,
            pageSize,
            total: paginationMeta?.total ?? doctors.length,
            totalPages: Math.max(1, paginationMeta?.totalPages ?? 1),
            onPageChange: handlePageChange,
            onPageSizeChange: handlePageSizeChange,
          }}
        />
      )}

      <ManageDoctorSpecialtiesDialog
        key={`${editingDoctor?.id ?? "none"}-${specialtiesQuery.isSuccess}`}
        doctor={editingDoctor}
        specialties={specialties}
        specialtiesLoading={specialtiesQuery.isLoading}
        specialtiesError={specialtiesQuery.isError}
        open={editingDoctor !== null}
        onOpenChange={(open) => {
          if (!open) setEditingDoctor(null)
        }}
      />
    </div>
  )
}
