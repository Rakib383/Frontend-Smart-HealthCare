"use server"

import { getDefaultDashboardRoute, isValidRedirectForRole, UserRole } from "@/lib/authUtils";
import { httpClient } from "@/lib/axios/httpClient";
import { setTokenInCookies } from "@/lib/tokenUtils";
import { ApiErrorResponse } from "@/types/api.types";
import { ILoginResponse } from "@/types/auth.types";
import { ILoginPayload, loginZodSchema } from "@/zod/auth.validation";
import { redirect } from "next/navigation";

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

const getLoginErrorDetails = (error: unknown) => {
    if (!isRecord(error)) {
        return { hasResponse: false, message: undefined, digest: undefined };
    }

    const response = isRecord(error.response) ? error.response : undefined;
    const data = response && isRecord(response.data) ? response.data : undefined;

    return {
        hasResponse: Boolean(response),
        message: data && typeof data.message === "string" ? data.message : undefined,
        digest: typeof error.digest === "string" ? error.digest : undefined,
    };
};

const getFriendlyLoginError = (message: string | undefined, hasResponse: boolean): string => {
    const normalizedMessage = message?.toLowerCase() ?? "";

    if (normalizedMessage.includes("blocked")) {
        return "This account is currently unavailable. Please contact support for help.";
    }

    if (normalizedMessage.includes("deleted")) {
        return "This account is no longer available. Please contact support for assistance.";
    }

    return hasResponse
        ? "We couldn't sign you in with those details. Check your email and password, then try again."
        : "We couldn't connect to the sign-in service. Check your connection and try again.";
};

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
        
    } catch (error: unknown) {
        const errorDetails = getLoginErrorDetails(error);

        if (errorDetails.digest?.startsWith("NEXT_REDIRECT")) {
            throw error
        }

        if (errorDetails.message?.toLowerCase() === "email not verified") {
            redirect(`/verify-email?email=${payload.email}`)
        }

        return {
            success:false,
            message: getFriendlyLoginError(errorDetails.message, errorDetails.hasResponse),
        }
        
    }
}