import type { ISpecialtyOption } from "@/services/specialty.services"
import type { IDoctor } from "@/types/doctor.types"

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null

export const getDoctorSpecialtyAssignments = (
  doctor: IDoctor,
  specialties: ISpecialtyOption[],
) => {
  const entries: unknown[] = Array.isArray(doctor.specialties) ? doctor.specialties : []

  return entries.flatMap((entry) => {
    if (typeof entry === "string") {
      const match = specialties.find((specialty) => specialty.title.toLowerCase() === entry.toLowerCase())
      return [{ id: match?.id ?? "", title: match?.title ?? entry }]
    }

    if (!isRecord(entry)) return []

    const nestedSpecialty = entry.specialty
    const specialtyId = typeof entry.specialtyId === "string"
      ? entry.specialtyId
      : isRecord(nestedSpecialty) && typeof nestedSpecialty.id === "string"
        ? nestedSpecialty.id
        : ""
    const rawTitle = typeof nestedSpecialty === "string"
      ? nestedSpecialty
      : isRecord(nestedSpecialty) && typeof nestedSpecialty.title === "string"
        ? nestedSpecialty.title
        : typeof entry.title === "string"
          ? entry.title
          : typeof entry.specialtyName === "string"
            ? entry.specialtyName
            : typeof entry.name === "string"
              ? entry.name
              : ""
    const match = specialties.find((specialty) => specialty.id === specialtyId)
      ?? specialties.find((specialty) => specialty.title.toLowerCase() === rawTitle.toLowerCase())

    return [{
      id: match?.id ?? specialtyId,
      title: match?.title ?? rawTitle,
    }]
  }).filter((assignment) => assignment.title)
}
