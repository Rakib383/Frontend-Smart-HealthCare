"use server"

import { httpClient } from "@/lib/axios/httpClient";
import type { IAdminDashboardData, IDoctorDashboardData } from "@/types/dashboard.types";

export async function getDashboardData() {
    try {
        const response = await httpClient.get<IAdminDashboardData>("/stats")
        return response
    } catch (error) {
        console.error("Error fetching dashboard data:", error)
        return {
            success: false,
            message: error instanceof Error ? error.message : "An error occurred while fetching dashboard data.",
            data: null,
            meta: null,
        }
    }
}

export async function getDoctorDashboardData() {
    try {
        return await httpClient.get<IDoctorDashboardData>("/stats")
    } catch (error) {
        console.error("Error fetching doctor dashboard data:", error)
        throw error
    }
}