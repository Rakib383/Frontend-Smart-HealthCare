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
