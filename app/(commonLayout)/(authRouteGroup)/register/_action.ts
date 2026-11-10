"use server"

import { httpClient } from "@/lib/axios/httpClient"
import { setTokenInCookies } from "@/lib/tokenUtils"
import { IRegisterPatientPayload, registerPatientZodSchema } from "@/zod/auth.validation"
import axios from "axios"

type RegistrationResult = { success: true } | { success: false; message: string }
type RegistrationResponse = {
    accessToken: string
    refreshToken: string
}

const getErrorMessage = (error: unknown, fallback: string) => {
    if (axios.isAxiosError(error)) {
        const responseData: unknown = error.response?.data
        if (responseData && typeof responseData === "object" && "message" in responseData && typeof responseData.message === "string") {
            return responseData.message
        }
    }

    return error instanceof Error ? error.message : fallback
}

export async function registerPatientAction(payload: IRegisterPatientPayload): Promise<RegistrationResult> {
    const parsedPayload = registerPatientZodSchema.safeParse(payload)
    if (!parsedPayload.success) {
        return { success: false, message: parsedPayload.error.issues[0]?.message ?? "Check your registration details." }
    }

    try {
        const response = await httpClient.post<RegistrationResponse>("/auth/register", {
            name: parsedPayload.data.name,
            email: parsedPayload.data.email,
            password: parsedPayload.data.password,
        })

        await setTokenInCookies("accessToken", response.data.accessToken)
        await setTokenInCookies("refreshToken", response.data.refreshToken)

        return { success: true }
    } catch (error: unknown) {
        return { success: false, message: getErrorMessage(error, "Unable to create your account. Please try again.") }
    }
}
