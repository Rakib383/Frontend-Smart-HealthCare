"use server"

import { httpClient } from "@/lib/axios/httpClient"
import { IDoctor } from "@/types/doctor.types"

export interface IUpdateDoctorPayload {
    doctor: {
        name: string;
        contactNumber: string;
        address?: string;
        registrationNumber: string;
        experience?: number;
        gender: "MALE" | "FEMALE";
        appointmentFee: number;
        qualification: string;
        currentWorkingPlace: string;
        designation: string;
    };
    specialties: Array<{
        specialtyId: string;
        shouldDelete?: boolean;
    }>;
}

export const getDoctors = async (queryString:string) => {

    try {

        const doctors = await httpClient.get<IDoctor[]>(`/doctors?${queryString ? queryString : ""}`)
        return doctors

    } catch (error) {

        console.log("error fetching doctors:", error);
        throw error
    }
}

export const getDoctorById = async (id: string) => {
    try {
        return await httpClient.get<IDoctor>(`/doctors/${encodeURIComponent(id)}`)
    } catch (error) {
        console.error("Error fetching doctor details:", error)
        throw error
    }
}

export const updateDoctor = async (id: string, payload: IUpdateDoctorPayload) => {
    try {
        return await httpClient.patch<IDoctor>(`/doctors/${encodeURIComponent(id)}`, payload)
    } catch (error) {
        console.error("Error updating doctor:", error)
        throw error
    }
}

export const deleteDoctor = async (id: string) => {
    try {
        return await httpClient.delete<{ message: string }>(`/doctors/${encodeURIComponent(id)}`)
    } catch (error) {
        console.error("Error deleting doctor:", error)
        throw error
    }
}