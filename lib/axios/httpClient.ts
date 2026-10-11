
import { ApiResponse } from "@/types/api.types";
import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
    throw new Error("API_BASE_URL is not defined in environment variables")
}

const axiosInstance = () => {
    const instance = axios.create({
        baseURL: API_BASE_URL,
        timeout: 30000,
        headers: {
            "Content-Type": "application/json",
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

        const response = await axiosInstance().get<ApiResponse<TData>>(endPoint, {
            params: options?.params,
            headers: options?.headers
        })

        return response.data

    } catch (error) {

        console.error(`GET request to ${endPoint} failed:`, error)

        throw error

    }
}


const httpPost = async <TData> (endPoint: string, data: unknown, options?: ApiRequestOptions):Promise<ApiResponse<TData>> => {
    try {

        const response = await axiosInstance().post<ApiResponse<TData>>(endPoint, data, {
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

        const response = await axiosInstance().put<ApiResponse<TData>>(endPoint, data, {
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

        const response = await axiosInstance().patch<ApiResponse<TData>>(endPoint, {
            params: options?.params,
            headers: options?.headers
        })

        return response.data;

    } catch (error) {

        console.error(`PATCH request to ${endPoint} failed:`, error)

        throw (error)

    }
}
const httpDelete = async <TData> (endPoint: string, options?: ApiRequestOptions): Promise<ApiResponse<TData>> => {
    try {

        const response = await axiosInstance().delete<ApiResponse<TData>>(endPoint, {
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