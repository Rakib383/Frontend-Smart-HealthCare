"use server"

import { httpClient } from "@/lib/axios/httpClient"
import type {
  ICreateDoctorSchedulePayload,
  ICreateSchedulePayload,
  IDoctorSchedule,
  ISchedule,
  IUpdateDoctorSchedulePayload,
  IUpdateSchedulePayload,
} from "@/types/schedule.types"

export const getSchedules = async (queryString: string) => {
  try {
    return await httpClient.get<ISchedule[]>(`/schedules${queryString ? `?${queryString}` : ""}`)
  } catch (error) {
    console.error("Error fetching schedules:", error)
    throw error
  }
}

export const createSchedules = async (payload: ICreateSchedulePayload) => {
  try {
    return await httpClient.post<ISchedule[]>("/schedules", payload)
  } catch (error) {
    console.error("Error creating schedules:", error)
    throw error
  }
}

export const updateSchedule = async (id: string, payload: IUpdateSchedulePayload) => {
  try {
    return await httpClient.patch<ISchedule>(`/schedules/${encodeURIComponent(id)}`, payload)
  } catch (error) {
    console.error("Error updating schedule:", error)
    throw error
  }
}

export const deleteSchedule = async (id: string) => {
  try {
    return await httpClient.delete<null>(`/schedules/${encodeURIComponent(id)}`)
  } catch (error) {
    console.error("Error deleting schedule:", error)
    throw error
  }
}

export const getMyDoctorSchedules = async (queryString: string) => {
  try {
    return await httpClient.get<IDoctorSchedule[]>(`/doctor-schedules/my-doctor-schedules${queryString ? `?${queryString}` : ""}`)
  } catch (error) {
    console.error("Error fetching doctor availability:", error)
    throw error
  }
}

export const getMyDoctorScheduleIds = async () => {
  try {
    const pageSize = 100
    let page = 1
    const scheduleIds: string[] = []

    while (true) {
      const response = await httpClient.get<IDoctorSchedule[]>(
        `/doctor-schedules/my-doctor-schedules?page=${page}&limit=${pageSize}&sortBy=createdAt&sortOrder=desc`,
      )
      scheduleIds.push(...response.data.map((schedule) => schedule.scheduleId))
      if (!response.meta || page >= response.meta.totalPages) break
      page += 1
    }

    return scheduleIds
  } catch (error) {
    console.error("Error fetching assigned doctor schedule IDs:", error)
    throw error
  }
}

export const createMyDoctorSchedules = async (payload: ICreateDoctorSchedulePayload) => {
  try {
    return await httpClient.post<IDoctorSchedule[]>("/doctor-schedules/create-my-doctor-schedule", payload)
  } catch (error) {
    console.error("Error creating doctor availability:", error)
    throw error
  }
}

export const updateMyDoctorSchedules = async (payload: IUpdateDoctorSchedulePayload) => {
  try {
    return await httpClient.patch<null>("/doctor-schedules/update-my-doctor-schedule", payload)
  } catch (error) {
    console.error("Error updating doctor availability:", error)
    throw error
  }
}

export const deleteMyDoctorSchedule = async (id: string) => {
  try {
    return await httpClient.delete<null>(`/doctor-schedules/delete-my-doctor-schedule/${encodeURIComponent(id)}`)
  } catch (error) {
    console.error("Error deleting doctor availability:", error)
    throw error
  }
}
