
import { ApiResponse } from "@/types/api.types";
import axios from "axios"
import { isTokenExpiringSoon } from "../tokenUtils";
import { cookies, headers } from "next/headers";
import { getNewTokensWithRefreshToken } from "@/services/auth.services";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
    throw new Error("API_BASE_URL is not defined in environment variables")
}


async function tryRefreshToken(accessToken: string, refreshToken: string): Promise<void> {
    if (!isTokenExpiringSoon(accessToken)) {
        return;
    }

    const requestHeader = await headers()

    if (requestHeader.get("x-refresh-token") === "1") {
        return;
    }

    try {

        await getNewTokensWithRefreshToken(refreshToken);
    } catch (error) {
        console.error("Error refreshing token in http client:", error);

    }

}

const axiosInstance = async () => {

    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (accessToken && refreshToken) {
        await tryRefreshToken(accessToken, refreshToken);
    }

    const cookieHeader = cookieStore.getAll().map(cookie => `${cookie.name}=${cookie.value}`).join("; ");




    const instance = axios.create({
        baseURL: API_BASE_URL,
        timeout: 30000,
        headers: {
            "Content-Type": "application/json",
            Cookie: cookieHeader
        }
    })

    return instance
}

export interface ApiRequestOptions {
    params?: Record<string, unknown>,
    headers?: Record<string, string>
}


const httpGet = async <TData>(endPoint: string, options?: ApiRequestOptions): Promise<ApiResponse<TData>> => {

    try {

        const instance = await axiosInstance();

        const response = await instance.get<ApiResponse<TData>>(endPoint, {
            params: options?.params,
            headers: options?.headers
        })

        return response.data

    } catch (error) {

        console.error(`GET request to ${endPoint} failed:`, error)

        throw error

    }
}


const httpPost = async <TData>(endPoint: string, data: unknown, options?: ApiRequestOptions): Promise<ApiResponse<TData>> => {
    try {

        const instance = await axiosInstance();

        const response = await instance.post<ApiResponse<TData>>(endPoint, data, {
            params: options?.params,
            headers: options?.headers
        })

        return response.data;

    } catch (error) {

        console.error(`POST request to ${endPoint} failed:`, error)

        throw (error)

    }
}

const httpPut = async <TData>(endPoint: string, data: unknown, options?: ApiRequestOptions): Promise<ApiResponse<TData>> => {
    try {

        const instance = await axiosInstance();

        const response = await instance.put<ApiResponse<TData>>(endPoint, data, {
            params: options?.params,
            headers: options?.headers
        })

        return response.data;

    } catch (error) {

        console.error(`PUT request to ${endPoint} failed:`, error)

        throw (error)

    }
}


const httpPatch = async <TData>(endPoint: string, options?: ApiRequestOptions): Promise<ApiResponse<TData>> => {
    try {

        const instance = await axiosInstance();

        const response = await instance.patch<ApiResponse<TData>>(endPoint, {
            params: options?.params,
            headers: options?.headers
        })

        return response.data;

    } catch (error) {

        console.error(`PATCH request to ${endPoint} failed:`, error)

        throw (error)

    }
}
const httpDelete = async <TData>(endPoint: string, options?: ApiRequestOptions): Promise<ApiResponse<TData>> => {
    try {

        const instance = await axiosInstance();

        const response = await instance.delete<ApiResponse<TData>>(endPoint, {
            params: options?.params,
            headers: options?.headers
        })

        return response.data;

    } catch (error) {

        console.error(`DELETE request to ${endPoint} failed:`, error)

        throw (error)

    }
}




export const httpClient = {
    get: httpGet,
    post: httpPost,
    put: httpPut,
    patch: httpPatch,
    delete: httpDelete
}