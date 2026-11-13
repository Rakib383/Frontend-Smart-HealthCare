"use server"

import { httpClient } from "@/lib/axios/httpClient"

interface PrescriptionPerson {
  id: string
  name: string
  email: string
  profilePhoto?: string | null
}

export interface IManagedPrescription {
  id: string
  appointmentId: string
  instructions: string
  followUpDate: string | Date
  createdAt: string | Date
  pdfUrl: string | null
  patient: PrescriptionPerson
  doctor: PrescriptionPerson
  appointment: {
    id: string
    schedule: {
      startDateTime: string | Date
      endDateTime: string | Date
    }
  }
}

export const getAllPrescriptions = async (queryString: string) => {
  try {
    return await httpClient.get<IManagedPrescription[]>(`/prescriptions${queryString ? `?${queryString}` : ""}`)
  } catch (error) {
    console.error("Error fetching prescriptions:", error)
    throw error
  }
}

export const getMyPrescriptions = async () => {
  try {
    const response = await httpClient.get<IManagedPrescription[]>("/prescriptions/my-prescriptions")
    if (!response.success) {
      throw new Error(response.message || "Prescriptions could not be loaded.")
    }
    return response
  } catch (error) {
    console.error("Error fetching patient prescriptions:", error)
    throw error
  }
}
