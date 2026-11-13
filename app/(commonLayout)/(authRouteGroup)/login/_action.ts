"use server"

import { getDefaultDashboardRoute, isValidRedirectForRole, UserRole } from "@/lib/authUtils";
import { httpClient } from "@/lib/axios/httpClient";
import { setTokenInCookies } from "@/lib/tokenUtils";
import { ILoginResponse } from "@/types/auth.types";
import { ILoginPayload, loginZodSchema } from "@/zod/auth.validation";

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

const getLoginErrorDetails = (error: unknown) => {
    if (!isRecord(error)) {
        return { hasResponse: false, message: undefined };
    }

    const response = isRecord(error.response) ? error.response : undefined;
    const data = response && isRecord(response.data) ? response.data : undefined;

    return {
        hasResponse: Boolean(response),
        message: data && typeof data.message === "string" ? data.message : undefined,
    };
};

export type LoginActionResult =
    | { success: true; redirectTo: string }
    | { success: false; message: string };

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

export const loginAction = async (
    payload: ILoginPayload,
    redirectPath: string | undefined,
): Promise<LoginActionResult> => {

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

        const {role,needPasswordChange,email}= user

        await setTokenInCookies("accessToken",accessToken)
        await setTokenInCookies("refreshToken",refreshToken)
        await setTokenInCookies("better-auth.session_token",token)

        if (needPasswordChange) {
            return {
                success: true,
                redirectTo: `/reset-password?email=${encodeURIComponent(email)}`,
            }
        }

        const targetPath = redirectPath && isValidRedirectForRole(redirectPath,role as UserRole)
            ? redirectPath
            : getDefaultDashboardRoute(role as UserRole)

        return {
            success: true,
            redirectTo: targetPath,
        }
        
    } catch (error: unknown) {
        const errorDetails = getLoginErrorDetails(error);

        if (errorDetails.message?.toLowerCase() === "email not verified") {
            return {
                success: true,
                redirectTo: `/verify-email?email=${encodeURIComponent(payload.email)}`,
            }
        }

        return {
            success:false,
            message: getFriendlyLoginError(errorDetails.message, errorDetails.hasResponse),
        }
        
    }
}