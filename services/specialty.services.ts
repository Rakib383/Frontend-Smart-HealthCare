"use server"

import { httpClient } from "@/lib/axios/httpClient"

export interface ISpecialtyOption {
  id: string;
  title: string;
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
