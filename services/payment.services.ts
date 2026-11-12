"use server"

import { httpClient } from "@/lib/axios/httpClient"

export type PaymentStatus = "PAID" | "UNPAID"

interface PaymentPerson {
  id: string
  name: string
  email: string
  profilePhoto?: string | null
}

export interface IManagedPayment {
  id: string
  amount: number
  transactionId: string
  status: PaymentStatus
  invoiceUrl: string | null
  createdAt: string | Date
  appointmentId: string
  appointment: {
    id: string
    status: string
    patient: PaymentPerson
    doctor: PaymentPerson
    schedule: {
      startDateTime: string | Date
      endDateTime: string | Date
    }
  }
}

export const getAllPayments = async (queryString: string) => {
  try {
    return await httpClient.get<IManagedPayment[]>(`/payment${queryString ? `?${queryString}` : ""}`)
  } catch (error) {
    console.error("Error fetching payments:", error)
    throw error
  }
}
