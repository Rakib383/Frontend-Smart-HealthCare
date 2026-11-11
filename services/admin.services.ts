"use server"

import { httpClient } from "@/lib/axios/httpClient"
import type { UserRole } from "@/lib/authUtils"

export type AdminUserStatus = "ACTIVE" | "BLOCKED" | "DELETED"

export interface IManagedAdmin {
  id: string
  userId: string
  name: string
  email: string
  profilePhoto: string | null
  contactNumber: string | null
  isDeleted: boolean
  createdAt: string
  user: {
    id: string
    role: UserRole
    status: AdminUserStatus
    emailVerified: boolean
    isDeleted: boolean
  }
}

export interface IUpdateAdminPayload {
  admin: {
    name: string
    profilePhoto?: string
    contactNumber?: string
  }
}

export const getAdmins = async () => {
  try {
    return await httpClient.get<IManagedAdmin[]>("/admins")
  } catch (error) {
    console.error("Error fetching admins:", error)
    throw error
  }
}

export const updateAdmin = async (id: string, payload: IUpdateAdminPayload) => {
  try {
    return await httpClient.patch<IManagedAdmin>(`/admins/${encodeURIComponent(id)}`, payload)
  } catch (error) {
    console.error("Error updating admin:", error)
    throw error
  }
}

export const deleteAdmin = async (id: string) => {
  try {
    return await httpClient.delete<IManagedAdmin>(`/admins/${encodeURIComponent(id)}`)
  } catch (error) {
    console.error("Error deleting admin:", error)
    throw error
  }
}

export const changeUserStatus = async (payload: { userId: string; userStatus: Exclude<AdminUserStatus, "DELETED"> }) => {
  try {
    const response = await httpClient.patch("/admins/change-user-status", payload)
    if (!response.success) {
        throw new Error(response.message || "The user status could not be updated.")
    }
    return response
  } catch (error) {
    console.error("Error changing user status:", error)
    throw error
  }
}

export const changeAdminRole = async (payload: { userId: string; role: "ADMIN" | "SUPER_ADMIN" }) => {
  try {
    return await httpClient.patch("/admins/change-user-role", payload)
  } catch (error) {
    console.error("Error changing admin role:", error)
    throw error
  }
}
