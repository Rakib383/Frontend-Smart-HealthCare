"use client"


import DataTable from "@/components/shared/table/DataTable"
import CreateDoctorSheet from "@/components/modules/Admin/DoctorManagement/CreateDoctorSheet"
import DeleteDoctorDialog from "@/components/modules/Admin/DoctorManagement/DeleteDoctorDialog"
import EditDoctorDialog from "@/components/modules/Admin/DoctorManagement/EditDoctorDialog"
import ViewDoctorDialog from "@/components/modules/Admin/DoctorManagement/ViewDoctorDialog"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { getDoctors } from "@/services/doctor.services"
import { getSpecialties } from "@/services/specialty.services"
import { IDoctor } from "@/types/doctor.types"
import { useQuery } from "@tanstack/react-query"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { FormEvent } from "react"
import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { doctorColumns } from "./doctorsColumns"

interface DoctorFilterValues {
  gender: string;
  experience: string;
  specialtyTitles: string[];
  minimumFee: string;
  maximumFee: string;
}

interface DoctorFiltersProps extends DoctorFilterValues {
  isLoading: boolean;
  specialties: Array<{ id: string; title: string }>;
  specialtiesLoading: boolean;
  specialtiesError: boolean;
  onApply: (filters: DoctorFilterValues) => void;
  onClear: () => void;
}

const DoctorFilters = ({ gender, experience, specialtyTitles, minimumFee, maximumFee, isLoading, specialties, specialtiesLoading, specialtiesError, onApply, onClear }: DoctorFiltersProps) => {
  const [genderFilter, setGenderFilter] = useState(gender);
  const [experienceFilter, setExperienceFilter] = useState(experience);
  const [specialtyFilter, setSpecialtyFilter] = useState(specialtyTitles);
  const [isSpecialtyMenuOpen, setIsSpecialtyMenuOpen] = useState(false);
  const [minimumFeeFilter, setMinimumFeeFilter] = useState(minimumFee);
  const [maximumFeeFilter, setMaximumFeeFilter] = useState(maximumFee);
  const [feeRangeError, setFeeRangeError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const minimumFee = minimumFeeFilter === "" ? undefined : Number(minimumFeeFilter);
    const maximumFee = maximumFeeFilter === "" ? undefined : Number(maximumFeeFilter);

    if (minimumFee !== undefined && maximumFee !== undefined && minimumFee > maximumFee) {
      setFeeRangeError("Minimum fee must be less than or equal to maximum fee.");
      return;
    }

    setFeeRangeError("");
    onApply({
      gender: genderFilter,
      experience: experienceFilter,
      specialtyTitles: specialtyFilter,
      minimumFee: minimumFeeFilter,
      maximumFee: maximumFeeFilter,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      <label className="flex min-w-36 flex-col gap-1.5 text-sm font-medium">
        <span>Gender</span>
        <select
          aria-label="Filter by gender"
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={genderFilter}
          onChange={(event) => setGenderFilter(event.target.value)}
        >
          <option value="">All genders</option>
          <option value="FEMALE">Female</option>
          <option value="MALE">Male</option>
        </select>
      </label>

      <label className="flex min-w-40 flex-col gap-1.5 text-sm font-medium">
        <span>Experience greater than</span>
        <Input
          aria-label="Filter by minimum experience in years"
          type="number"
          min="0"
          step="1"
          placeholder="Years"
          value={experienceFilter}
          onChange={(event) => setExperienceFilter(event.target.value)}
        />
      </label>

      <div className="flex min-w-48 flex-col gap-1.5">
        <span className="text-sm font-medium">Specialties</span>
        <DropdownMenu open={isSpecialtyMenuOpen} onOpenChange={setIsSpecialtyMenuOpen}>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="outline"
                className="w-full justify-between font-normal"
                disabled={specialtiesLoading || specialtiesError}
                aria-label="Filter by specialty title"
              />
            }
          >
            <span className="truncate">
              {specialtyFilter.length === 0
                ? "All specialties"
                : `${specialtyFilter.length} selected`}
            </span>
            <ChevronDown className="size-4 text-muted-foreground" aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuLabel>
              {specialtiesLoading
                ? "Loading specialties..."
                : specialtiesError
                  ? "Unable to load specialties"
                  : "Select specialties"}
            </DropdownMenuLabel>
            {!specialtiesLoading && !specialtiesError && specialties.length === 0 && (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">No specialties available</div>
            )}
            {specialtyFilter
              .filter((title) => !specialties.some((option) => option.title === title))
              .map((title) => (
                <DropdownMenuCheckboxItem
                  key={title}
                  checked
                  onCheckedChange={(checked) => {
                    if (!checked) {
                      setSpecialtyFilter((current) => current.filter((value) => value !== title));
                    }
                  }}
                  onSelect={(event) => event.preventDefault()}
                >
                  {title}
                </DropdownMenuCheckboxItem>
              ))}
            {specialties.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.id}
                checked={specialtyFilter.includes(option.title)}
                onCheckedChange={(checked) => {
                  setSpecialtyFilter((current) => checked
                    ? current.includes(option.title) ? current : [...current, option.title]
                    : current.filter((title) => title !== option.title));
                }}
                onSelect={(event) => event.preventDefault()}
              >
                {option.title}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        {specialtiesError && (
          <span className="text-xs text-destructive" role="alert">
            Could not load specialties. Please try again later.
          </span>
        )}
      </div>

      <fieldset className="flex min-w-64 flex-col gap-1.5">
        <legend className="text-sm font-medium">Appointment fee range</legend>
        <div className="flex items-center gap-2">
          <Input
            aria-label="Minimum appointment fee"
            type="number"
            min="0"
            step="0.01"
            placeholder="Min"
            value={minimumFeeFilter}
            onChange={(event) => {
              setMinimumFeeFilter(event.target.value);
              setFeeRangeError("");
            }}
            aria-invalid={Boolean(feeRangeError)}
          />
          <span className="text-sm text-muted-foreground" aria-hidden="true">to</span>
          <Input
            aria-label="Maximum appointment fee"
            type="number"
            min="0"
            step="0.01"
            placeholder="Max"
            value={maximumFeeFilter}
            onChange={(event) => {
              setMaximumFeeFilter(event.target.value);
              setFeeRangeError("");
            }}
            aria-invalid={Boolean(feeRangeError)}
          />
        </div>
        {feeRangeError && <span className="text-xs text-destructive" role="alert">{feeRangeError}</span>}
      </fieldset>

      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading}>Apply filters</Button>
        <Button type="button" variant="outline" onClick={onClear} disabled={isLoading}>
          Clear
        </Button>
      </div>
    </form>
  );
};

const DoctorsTable = ({queryString,queryParamsObject}:{queryString:string;queryParamsObject:{[key:string]:string|string[]|undefined}}) => {

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [viewingDoctor, setViewingDoctor] = useState<IDoctor | null>(null)
    const [editingDoctor, setEditingDoctor] = useState<IDoctor | null>(null)
    const [deletingDoctor, setDeletingDoctor] = useState<IDoctor | null>(null)
    const {data:doctorDataResponse,isFetching} = useQuery({
        queryKey:["doctors",queryParamsObject],
        queryFn:()=>getDoctors(queryString)
    })
    const { data: specialtiesResponse, isLoading: isLoadingSpecialties, isError: hasSpecialtiesError } = useQuery({
      queryKey: ["specialties"],
      queryFn: getSpecialties,
      staleTime: 5 * 60 * 1000,
    })

  const doctors = doctorDataResponse?.data ?? [];
  const paginationMeta = doctorDataResponse?.meta;
  const requestedPage = Number(Array.isArray(queryParamsObject.page) ? queryParamsObject.page[0] : queryParamsObject.page);
  const page = paginationMeta?.page ?? (Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1);
  const requestedPageSize = Number(Array.isArray(queryParamsObject.limit) ? queryParamsObject.limit[0] : queryParamsObject.limit);
  const pageSize = paginationMeta?.limit ?? (Number.isInteger(requestedPageSize) && requestedPageSize > 0 ? requestedPageSize : 10);

  const handlePageChange = (nextPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    params.set("limit", String(pageSize));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handlePageSizeChange = (nextPageSize: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    params.set("limit", String(nextPageSize));
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const searchTerm = searchParams.get("searchTerm") ?? "";
  const handleSearch = (nextSearchTerm: string) => {
    if (nextSearchTerm === searchTerm) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    if (nextSearchTerm) {
      params.set("searchTerm", nextSearchTerm);
    } else {
      params.delete("searchTerm");
    }
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleApplyFilters = ({ gender, experience, specialtyTitles, minimumFee, maximumFee }: DoctorFilterValues) => {
    const params = new URLSearchParams(searchParams.toString());
    const filters = [
      ["gender", gender],
      ["experience[gt]", experience],
      ["appointmentFee[gte]", minimumFee],
      ["appointmentFee[lte]", maximumFee],
    ] as const;

    filters.forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    params.delete("specialties.specialty.title");
    specialtyTitles.forEach((title) => params.append("specialties.specialty.title", title));

    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleClearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("gender");
    params.delete("experience[gt]");
    params.delete("specialties.specialty.title");
    params.delete("appointmentFee[gte]");
    params.delete("appointmentFee[lte]");
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleView = (doctor:IDoctor) => {
    setViewingDoctor(doctor)
  }
  const handleEdit = (doctor:IDoctor) => {
    setEditingDoctor(doctor)
  }
  const handleDelete = (doctor:IDoctor) => {
    setDeletingDoctor(doctor)
  }

  const requestedGenderFilter = searchParams.get("gender");
  const genderFilter = requestedGenderFilter === "MALE" || requestedGenderFilter === "FEMALE"
    ? requestedGenderFilter
    : "";
  const experienceFilter = searchParams.get("experience[gt]") ?? "";
  const specialtyFilter = searchParams.getAll("specialties.specialty.title");
  const minimumFeeFilter = searchParams.get("appointmentFee[gte]") ?? "";
  const maximumFeeFilter = searchParams.get("appointmentFee[lte]") ?? "";
  const filterStateKey = JSON.stringify([genderFilter, experienceFilter, specialtyFilter, minimumFeeFilter, maximumFeeFilter]);
  const specialtyOptions = specialtiesResponse?.data ?? [];
  const filtersToolbar = (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <DoctorFilters
        key={filterStateKey}
        gender={genderFilter}
        experience={experienceFilter}
        specialtyTitles={specialtyFilter}
        minimumFee={minimumFeeFilter}
        maximumFee={maximumFeeFilter}
        isLoading={isFetching}
        specialties={specialtyOptions}
        specialtiesLoading={isLoadingSpecialties}
        specialtiesError={hasSpecialtiesError}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />
      <CreateDoctorSheet
        specialties={specialtyOptions}
        specialtiesLoading={isLoadingSpecialties}
        specialtiesError={hasSpecialtiesError}
      />
    </div>
  );

  return (
    <div className="space-y-3">
    <DataTable columns={doctorColumns} data={doctors} actions={{
      onView:handleView,
      onEdit:handleEdit,
      onDelete:handleDelete
    } } emptyMessage="no doctor's data" isLoading={isFetching} search={{
      value: searchTerm,
      onChange: handleSearch,
      placeholder: "Search doctors...",
      debounceMs: 400,
    }} toolbar={filtersToolbar} pagination={{
      page,
      pageSize,
      total: paginationMeta?.total ?? doctors.length,
      totalPages: Math.max(1, paginationMeta?.totalPages ?? 1),
      onPageChange: handlePageChange,
      onPageSizeChange: handlePageSizeChange,
    }}/>
    {editingDoctor && (
      <EditDoctorDialog
        key={`${editingDoctor.id}-${specialtyOptions.map((specialty) => specialty.id).join(",")}`}
        doctor={editingDoctor}
        specialties={specialtyOptions}
        specialtiesLoading={isLoadingSpecialties}
        specialtiesError={hasSpecialtiesError}
        open
        onOpenChange={(open) => {
          if (!open) setEditingDoctor(null)
        }}
      />
    )}
    <ViewDoctorDialog
      doctor={viewingDoctor}
      open={viewingDoctor !== null}
      onOpenChange={(open) => {
        if (!open) setViewingDoctor(null)
      }}
    />
    <DeleteDoctorDialog
      doctor={deletingDoctor}
      open={deletingDoctor !== null}
      onOpenChange={(open) => {
        if (!open) setDeletingDoctor(null)
      }}
    />
    </div>
  )
}

export default DoctorsTable
