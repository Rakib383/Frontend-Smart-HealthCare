"use server"

import { httpClient } from "@/lib/axios/httpClient"
import type { ICreateSchedulePayload, ISchedule, IUpdateSchedulePayload } from "@/types/schedule.types"

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
