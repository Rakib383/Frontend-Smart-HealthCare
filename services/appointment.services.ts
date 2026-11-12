"use server"

import { httpClient } from "@/lib/axios/httpClient"

export type AppointmentStatus = "SCHEDULED" | "INPROGRESS" | "COMPLETED" | "CANCELED"
export type AppointmentPaymentStatus = "PAID" | "UNPAID"

interface AppointmentPerson {
  id: string
  name: string
  email: string
  profilePhoto?: string | null
}

export interface IManagedAppointment {
  id: string
  status: AppointmentStatus
  paymentStatus: AppointmentPaymentStatus
  createdAt: string | Date
  doctor: AppointmentPerson & {
    appointmentFee: number
  }
  patient: AppointmentPerson
  schedule: {
    startDateTime: string | Date
    endDateTime: string | Date
  }
}

export const getAllAppointments = async () => {
  try {
    return await httpClient.get<IManagedAppointment[]>("/appointments/all-appointments")
  } catch (error) {
    console.error("Error fetching appointments:", error)
    throw error
  }
}

export const changeAppointmentStatus = async (appointmentId: string, status: AppointmentStatus) => {
  try {
    return await httpClient.patch<IManagedAppointment>(
      `/appointments/change-appointment-status/${encodeURIComponent(appointmentId)}`,
      status,
    )
  } catch (error) {
    console.error("Error updating appointment status:", error)
    throw error
  }
}
