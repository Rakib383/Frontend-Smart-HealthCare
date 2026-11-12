"use server"

import { httpClient } from "@/lib/axios/httpClient"

export interface ISpecialtyOption {
  id: string;
  title: string;
  description?: string | null;
  icon?: string | null;
  createdAt?: string | Date;
}

export interface ICreateSpecialtyPayload {
  title: string;
  description?: string;
}

export const getSpecialties = async () => {
  try {
    return await httpClient.get<ISpecialtyOption[]>("/specialties")
  } catch (error) {
    console.error("Error fetching specialties:", error)
    throw error
  }
}

export const createSpecialty = async (payload: ICreateSpecialtyPayload) => {
  try {
    return await httpClient.post<ISpecialtyOption>("/specialties", payload)
  } catch (error) {
    console.error("Error creating specialty:", error)
    throw error
  }
}

export const deleteSpecialty = async (id: string) => {
  try {
    return await httpClient.delete<ISpecialtyOption>(`/specialties/${encodeURIComponent(id)}`)
  } catch (error) {
    console.error("Error deleting specialty:", error)
    throw error
  }
}
