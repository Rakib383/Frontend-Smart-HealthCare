"use server"

import { httpClient } from "@/lib/axios/httpClient"

export type ManagedPatientStatus = "ACTIVE" | "BLOCKED" | "DELETED"

export interface IManagedPatient {
  id: string
  userId: string
  name: string
  email: string
  profilePhoto: string | null
  contactNumber: string | null
  address: string | null
  createdAt: string
  user: {
    id: string
    status: ManagedPatientStatus
  }
}

export interface IPatientHealthData {
  gender: "MALE" | "FEMALE"
  dateOfBirth: string | Date
  bloodGroup:
    | "A_POSITIVE"
    | "A_NEGATIVE"
    | "B_POSITIVE"
    | "B_NEGATIVE"
    | "AB_POSITIVE"
    | "AB_NEGATIVE"
    | "O_POSITIVE"
    | "O_NEGATIVE"
  hasAllergies: boolean
  hasDiabetes: boolean
  height: string
  weight: string
  smokingStatus: boolean
  dietaryPreferences: string | null
  pregnancyStatus: boolean
  mentalHealthHistory: string | null
  immunizationStatus: string | null
  hasPastSurgeries: boolean
  recentAnxiety: boolean
  recentDepression: boolean
  maritalStatus: string | null
}

export interface IPatientMedicalReport {
  id: string
  reportName: string
  reportLink: string
  createdAt: string | Date
}

export interface IPatientHealthProfile {
  id: string
  name: string
  email: string
  patientHealthData: IPatientHealthData | null
  medicalReports: IPatientMedicalReport[]
}

export const getMyHealthRecords = async () => {
  try {
    const response = await httpClient.get<IPatientHealthProfile>("/patients/my-health-records")
    if (!response.success) {
      throw new Error(response.message || "Your health records could not be loaded.")
    }
    return response.data
  } catch (error) {
    console.error("Error fetching patient health records:", error)
    throw error
  }
}

export const updateMyHealthRecords = async (formData: FormData) => {
  try {
    const response = await httpClient.patch<IPatientHealthProfile>(
      "/patients/update-my-profile",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    )
    if (!response.success) {
      throw new Error(response.message || "Your health records could not be updated.")
    }
    return response.data
  } catch (error) {
    console.error("Error updating patient health records:", error)
    throw error
  }
}

export const getPatients = async (queryString: string) => {
  try {
    const response = await httpClient.get<IManagedPatient[]>(`/patients?${queryString}`)
    if (!response.success) {
      throw new Error(response.message || "Patients could not be loaded.")
    }
    return response
  } catch (error) {
    console.error("Error fetching patients:", error)
    throw error
  }
}

export const deletePatient = async (id: string) => {
  try {
    const response = await httpClient.delete<{ message: string }>(`/patients/${encodeURIComponent(id)}`)
    if (!response.success) {
      throw new Error(response.message || "The patient account could not be deleted.")
    }
    return response
  } catch (error) {
    console.error("Error deleting patient:", error)
    throw error
  }
}
