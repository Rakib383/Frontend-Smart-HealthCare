"use server"

import { httpClient } from "@/lib/axios/httpClient";
import { IAdminDashboardData } from "@/types/dashboard.types";

export async function getDashboardData () {
    try {

        const response = await httpClient.get<IAdminDashboardData>("/stats")

        return response
        
    } catch (error:any) {

        console.log(error, "from dashboard server action");

        return {
            success:false,
            message:error.message || "an error occurred while fetching dashboard data.",
            data:null,
            meta:null
        }
        
    }
}