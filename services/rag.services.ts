import { httpClient } from "@/lib/axios/httpClient"

export interface IRagQueryPayload {
    query: string,
    limit?: number,
    source?: string, 
}

export interface IRagSource {
    id:string;
    content:string;
    similarity:number;
    metadata?: {
        name?:string;
        [key:string]:unknown
    };
    sourceType?:string;
}

export interface IRagQueryData {
    answer: any,
    sources: IRagSource[],
    contextUsed: string,
}

export interface IIngestDoctorsData {
    success: boolean,
    message: string,
    indexedCount: number,
}


export const queryRagService = async (payload: IRagQueryPayload) => {

    const response = await httpClient.post<IRagQueryData>("/rag/query", payload)
    return response
}

export const ingestDoctorService = async () => {
    const response = await httpClient.post<IIngestDoctorsData>("/rag/ingest-doctors",{})
    return response
}
