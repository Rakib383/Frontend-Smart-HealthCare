"use server";

import { setTokenInCookies } from "@/lib/tokenUtils";
import {
    changePasswordPayloadSchema,
    requestPasswordResetSchema,
    resetPasswordPayloadSchema,
    type IChangePasswordPayload,
    type IResetPasswordPayload,
} from "@/zod/auth.validation";
import { cookies } from "next/headers";

const BASE_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!BASE_API_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
}

export async function getNewTokensWithRefreshToken(refreshToken: string): Promise<boolean> {
    try {
        const res = await fetch(`${BASE_API_URL}/auth/refresh-token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: `refreshToken=${refreshToken}`
            }
        });

        if (!res.ok) {
            return false;
        }

        const { data } = await res.json();

        const { accessToken, refreshToken: newRefreshToken, token } = data;

        if (accessToken) {
            await setTokenInCookies("accessToken", accessToken);
        }

        if (newRefreshToken) {
            await setTokenInCookies("refreshToken", newRefreshToken);
        }

        if (token) {
            await setTokenInCookies("better-auth.session_token", token, 24 * 60 * 60); // 1 day in seconds
        }

        return true;
    } catch (error) {
        console.error("Error refreshing token:", error);
        return false;
    }
}

export async function getUserInfo() {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("accessToken")?.value;
        const sessionToken = cookieStore.get("better-auth.session_token")?.value

        if (!accessToken) {
            return null;
        }

        const res = await fetch(`${BASE_API_URL}/auth/me`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Cookie: `accessToken=${accessToken}; better-auth.session_token=${sessionToken}`
            }
        });

        if (!res.ok) {
            console.error("Failed to fetch user info:", res.status, res.statusText);
            return null;
        }

        const { data } = await res.json();

        return data;
    } catch (error) {
        console.error("Error fetching user info:", error);
        return null;
    }
}

export type ChangePasswordResult =
    | { success: true; message: string }
    | { success: false; message: string };

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

export type PasswordResetActionResult =
    | { success: true; message: string }
    | { success: false; message: string };

const postPasswordResetRequest = async (
    endpoint: string,
    payload: unknown,
): Promise<PasswordResetActionResult> => {
    let response: Response;

    try {
        response = await fetch(`${BASE_API_URL}${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            cache: "no-store",
        });
    } catch {
        return { success: false, message: "Could not reach the server. Please try again." };
    }

    let result: unknown;
    try {
        result = await response.json();
    } catch {
        return { success: false, message: "The server returned an invalid response. Please try again." };
    }

    if (!isRecord(result)) {
        return { success: false, message: "The server returned an invalid response. Please try again." };
    }

    if (!response.ok || result.success !== true) {
        return {
            success: false,
            message: typeof result.message === "string" ? result.message : "Unable to complete the password reset.",
        };
    }

    return {
        success: true,
        message: typeof result.message === "string" ? result.message : "Request completed successfully.",
    };
};

export async function requestPasswordResetOtp(email: string): Promise<PasswordResetActionResult> {
    const parsed = requestPasswordResetSchema.safeParse({ email });

    if (!parsed.success) {
        return { success: false, message: parsed.error.issues[0]?.message ?? "Enter a valid email address." };
    }

    return postPasswordResetRequest("/auth/forget-password", parsed.data);
}

export async function resetPassword(payload: IResetPasswordPayload): Promise<PasswordResetActionResult> {
    const parsed = resetPasswordPayloadSchema.safeParse(payload);

    if (!parsed.success) {
        return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid password reset details." };
    }

    const result = await postPasswordResetRequest("/auth/reset-password", parsed.data);

    if (result.success) {
        const cookieStore = await cookies();
        cookieStore.delete("accessToken");
        cookieStore.delete("refreshToken");
        cookieStore.delete("better-auth.session_token");
    }

    return result;
}

export async function changePassword(payload: IChangePasswordPayload): Promise<ChangePasswordResult> {
    const parsedPayload = changePasswordPayloadSchema.safeParse(payload);

    if (!parsedPayload.success) {
        return {
            success: false,
            message: parsedPayload.error.issues[0]?.message ?? "Invalid password details.",
        };
    }

    if (parsedPayload.data.currentPassword === parsedPayload.data.newPassword) {
        return {
            success: false,
            message: "New password must be different from your current password.",
        };
    }

    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll()
        .map(({ name, value }) => `${name}=${value}`)
        .join("; ");

    if (!cookieStore.get("accessToken")?.value || !cookieStore.get("better-auth.session_token")?.value) {
        return { success: false, message: "Your session has expired. Please sign in again." };
    }

    let res: Response;

    try {
        res = await fetch(`${BASE_API_URL}/auth/change-password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: cookieHeader,
            },
            body: JSON.stringify(parsedPayload.data),
            cache: "no-store",
        });
    } catch {
        return { success: false, message: "Could not reach the server. Please try again." };
    }

    let result: unknown;
    try {
        result = await res.json();
    } catch {
        return { success: false, message: "The server returned an invalid response. Please try again." };
    }

    if (!isRecord(result)) {
        return { success: false, message: "The server returned an invalid response. Please try again." };
    }

    if (!res.ok || result.success !== true) {
        return {
            success: false,
            message: typeof result.message === "string" ? result.message : "Unable to change your password.",
        };
    }

    const data = isRecord(result.data) ? result.data : {};
    const { accessToken, refreshToken, token } = data;

    if (typeof accessToken !== "string" || typeof refreshToken !== "string") {
        return {
            success: false,
            message: "Password changed, but your session could not be refreshed. Please sign in again.",
        };
    }

    await setTokenInCookies("accessToken", accessToken);
    await setTokenInCookies("refreshToken", refreshToken);

    if (typeof token === "string" && token) {
        await setTokenInCookies("better-auth.session_token", token);
    }

    return {
        success: true,
        message: typeof result.message === "string" ? result.message : "Password changed successfully.",
    };
}