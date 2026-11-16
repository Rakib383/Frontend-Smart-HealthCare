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

export interface IPrescriptionMutationResult {
  id: string
  appointmentId: string
  instructions: string
  followUpDate: string | Date
  createdAt: string | Date
  pdfUrl: string | null
}

export interface ICreatePrescriptionPayload {
  appointmentId: string
  instructions: string
  followUpDate: string
}

export type IUpdatePrescriptionPayload = Partial<Pick<ICreatePrescriptionPayload, "instructions" | "followUpDate">>

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
    console.error("Error fetching my prescriptions:", error)
    throw error
  }
}

export const createPrescription = async (payload: ICreatePrescriptionPayload) => {
  try {
    return await httpClient.post<IPrescriptionMutationResult>("/prescriptions", payload)
  } catch (error) {
    console.error("Error creating prescription:", error)
    throw error
  }
}

export const updatePrescription = async (prescriptionId: string, payload: IUpdatePrescriptionPayload) => {
  try {
    return await httpClient.patch<IManagedPrescription>(
      `/prescriptions/${encodeURIComponent(prescriptionId)}`,
      payload,
    )
  } catch (error) {
    console.error("Error updating prescription:", error)
    throw error
  }
}

export const deletePrescription = async (prescriptionId: string) => {
  try {
    return await httpClient.delete<void>(`/prescriptions/${encodeURIComponent(prescriptionId)}`)
  } catch (error) {
    console.error("Error deleting prescription:", error)
    throw error
  }
}
