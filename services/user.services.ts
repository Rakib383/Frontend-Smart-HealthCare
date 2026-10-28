"use server"

import { httpClient } from "@/lib/axios/httpClient"
import type { IDoctor } from "@/types/doctor.types"

export interface ICreateDoctorPayload {
  password: string;
  doctor: {
    name: string;
    email: string;
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
  specialties: string[];
}

export const createDoctor = async (payload: ICreateDoctorPayload) => {
  try {
    return await httpClient.post<IDoctor>("/users/create-doctor", payload)
  } catch (error) {
    console.error("Error creating doctor:", error)
    throw error
  }
}
