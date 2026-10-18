"use server"

import { getDefaultDashboardRoute, isValidRedirectForRole, UserRole } from "@/lib/authUtils";
import { httpClient } from "@/lib/axios/httpClient";
import { setTokenInCookies } from "@/lib/tokenUtils";
import { ApiErrorResponse } from "@/types/api.types";
import { ILoginResponse } from "@/types/auth.types";
import { ILoginPayload, loginZodSchema } from "@/zod/auth.validation";
import { redirect } from "next/navigation";

export const loginAction = async (payload: ILoginPayload, redirectPath: string | undefined): Promise<ILoginResponse | ApiErrorResponse>  => {

    const parsedPayload = loginZodSchema.safeParse(payload);

    if(!parsedPayload.success) {
        const firstError = parsedPayload.error.issues[0].message || "invalid login input"

        return {
            success:false,
            message:firstError,
        }
    }

    try {
        const response = await httpClient.post<ILoginResponse>("/auth/login",parsedPayload.data)

        const {accessToken,refreshToken,token,user} = response.data;

        const {role,emailVerified,needPasswordChange,email}= user

        await setTokenInCookies("accessToken",accessToken)
        await setTokenInCookies("refreshToken",refreshToken)
        await setTokenInCookies("better-auth.session_token",token)

        if (needPasswordChange) {
            redirect(`/reset-password?email=${email}`)
        } else {

            const targetPath = redirectPath && isValidRedirectForRole(redirectPath,role as UserRole) ? redirectPath : getDefaultDashboardRoute(role as UserRole)

            redirect(targetPath)
        }
        
    } catch (error:any) {

        if(error && typeof error==="object" && "digest" in error && typeof error.digest === "string" && error.digest.startsWith("NEXT_REDIRECT")) {
            throw error
        }

        if(error && error.response && error.response.data.message === "Email not verified") {
            redirect(`/verify-email?email=${payload.email}`)
        }

        return {
            success:false,
            message:`Login failed ${ error.message }`
        }
        
    }
}