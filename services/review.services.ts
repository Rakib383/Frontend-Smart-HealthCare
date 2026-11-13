"use server"

import { httpClient } from "@/lib/axios/httpClient"

interface ReviewPerson {
  id: string
  name: string
  email: string
  profilePhoto?: string | null
}

export interface IManagedReview {
  id: string
  rating: number
  comment: string | null
  createdAt: string | Date
  appointmentId: string
  patient: ReviewPerson
  doctor: ReviewPerson
  appointment: {
    id: string
    schedule: {
      startDateTime: string | Date
      endDateTime: string | Date
    }
  }
}

export const getAllReviews = async (queryString: string) => {
  try {
    return await httpClient.get<IManagedReview[]>(`/reviews${queryString ? `?${queryString}` : ""}`)
  } catch (error) {
    console.error("Error fetching reviews:", error)
    throw error
  }
}

export const getMyDoctorReviews = async () => {
  try {
    return await httpClient.get<IManagedReview[]>("/reviews/my-reviews")
  } catch (error) {
    console.error("Error fetching doctor reviews:", error)
    throw error
  }
}
