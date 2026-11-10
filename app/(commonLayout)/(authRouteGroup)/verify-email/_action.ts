"use server"

import { httpClient } from "@/lib/axios/httpClient"
import { getCookie } from "@/lib/cookieUtils"
import { jwtUtils } from "@/lib/jwtUtils"
import { setTokenInCookies } from "@/lib/tokenUtils"
import axios from "axios"
import { verifyEmailZodSchema, IVerifyEmailPayload } from "@/zod/auth.validation"

type VerificationResult = { success: true; redirectPath: string } | { success: false; message: string }
type VerificationResponse = {
    token: string | null
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

export async function verifyEmailAction(payload: IVerifyEmailPayload): Promise<VerificationResult> {
    const parsedPayload = verifyEmailZodSchema.safeParse(payload)
    if (!parsedPayload.success) {
        return { success: false, message: parsedPayload.error.issues[0]?.message ?? "Enter a valid verification code." }
    }

    const accessToken = await getCookie("accessToken")
    const accessTokenSecret = process.env.JWT_ACCESS_SECRET
    if (!accessToken || !accessTokenSecret) {
        return { success: false, message: "Your registration session has expired. Please create your account again." }
    }

    const decodedToken = jwtUtils.verifyToken(accessToken, accessTokenSecret)
    const registeredEmail = decodedToken.success ? decodedToken.data?.email : undefined
    if (
        typeof registeredEmail !== "string" ||
        registeredEmail.toLowerCase() !== parsedPayload.data.email.toLowerCase()
    ) {
        return { success: false, message: "Please verify using the email address you registered with." }
    }

    try {
        const response = await httpClient.post<VerificationResponse>("/auth/verify-email", parsedPayload.data)
        if (!response.data.token) {
            return { success: false, message: "Your email was verified, but we couldn't start your session. Please sign in." }
        }

        await setTokenInCookies("better-auth.session_token", response.data.token)
        return { success: true, redirectPath: "/dashboard" }
    } catch (error: unknown) {
        return { success: false, message: getErrorMessage(error, "Unable to verify your email. Please try again.") }
    }
}
