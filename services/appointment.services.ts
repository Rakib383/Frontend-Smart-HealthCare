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

export interface IPatientAppointment {
  id: string
  status: AppointmentStatus
  paymentStatus: AppointmentPaymentStatus
  createdAt: string | Date
  doctor: AppointmentPerson & {
    appointmentFee: number
    designation?: string
    qualification?: string
    currentWorkingPlace?: string
  }
  schedule: {
    startDateTime: string | Date
    endDateTime: string | Date
  }
}

export interface IBookAppointmentPayload {
  doctorId: string
  scheduleId: string
}

export interface IBookAppointmentResult {
  appointment: {
    id: string
    status: AppointmentStatus
    paymentStatus: AppointmentPaymentStatus
  }
  payment?: {
    id: string
    status: AppointmentPaymentStatus
  }
  paymentUrl?: string | null
}

export const getMyAppointments = async () => {
  try {
    return await httpClient.get<IPatientAppointment[]>("/appointments/my-appointments")
  } catch (error) {
    console.error("Error fetching patient appointments:", error)
    throw error
  }
}

export const bookAppointment = async (payload: IBookAppointmentPayload) => {
  try {
    return await httpClient.post<IBookAppointmentResult>("/appointments/book-appointment", payload)
  } catch (error) {
    console.error("Error booking appointment:", error)
    throw error
  }
}

export const bookAppointmentWithPayLater = async (payload: IBookAppointmentPayload) => {
  try {
    return await httpClient.post<IBookAppointmentResult>("/appointments/book-appointment-with-pay-later", payload)
  } catch (error) {
    console.error("Error booking appointment with pay later:", error)
    throw error
  }
}

export const initiateAppointmentPayment = async (appointmentId: string) => {
  try {
    return await httpClient.post<{ paymentUrl: string | null }>(
      `/appointments/initiate-payment/${encodeURIComponent(appointmentId)}`,
      {},
    )
  } catch (error) {
    console.error("Error initiating appointment payment:", error)
    throw error
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
