/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";
import { ingestDoctorService, queryRagService } from "@/services/rag.services";
import { getUserInfo } from "@/services/auth.services";
import type { UserRole } from "@/lib/authUtils";

type RagQueryResult =
    | { success: true; answer: string; sources: string }
    | { success: false; error: string };

export const queryRagAction = async (query: string): Promise<RagQueryResult> => {
    try {
        const response = await queryRagService({ query });

        if (!response?.data?.answer) {
            return {
                success: false,
                error: "No answer received from AI. Please try again",
            };
        }

        let answer = await response?.data?.answer;

        // if the answer is an object {doctors: [...]} convert it readable string
        if (typeof answer === "object" && answer !== null) {
            if ("doctors" in answer && Array.isArray(answer.doctors)) {
                const doctors = answer.doctors.slice(0, 5);

                if (doctors.length > 0) {
                    answer =
                        `I found ${doctors.length} doctors who may help you:\n\n` +
                        doctors.map((d: any, i: number) => {
                            let text = ``;
                            if (d.name) text += `${i + 1}. **${d.name}**\n`;
                            if (d.specialty) text += `Specialization: **${d.specialty}**\n`;
                            if (d.reason) text += `Why: ${d.reason}\n`;
                            return text + "\n";
                        });
                } else {
                    answer =
                        "I couldn't find any doctors matching your query. Please try another query.";
                }
            } else {
                answer = JSON.stringify(answer, null, 2);
            }
        }
        const sources =
            100 - Number(await response?.data?.sources[0]?.similarity) * 100;

        return {
            success: true,
            answer: answer as string,
            sources: `${(sources).toFixed(2)}% matched`,
        };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            error:
                "Failed to reach the AI Assistant. Please check your connection and try again.",
        };
    }
};

export const ingestDoctorsAction = async (): Promise<
    | { success: true; indexedCount: number; message: string }
    | { success: false; error: string }
> => {
    try {
        const userInfo = await getUserInfo();
        const authorizedRoles: UserRole[] = ["ADMIN", "SUPER_ADMIN"];

        if (!userInfo || !authorizedRoles.includes(userInfo.role)) {
            return {
                success: false,
                error: "You are not authorized to sync doctor data.",
            };
        }

        const response = await ingestDoctorService();

        return {
            success: true,
            indexedCount: response.data.indexedCount,
            message:
                response.data.message ??
                response.message ??
                "Doctors data synced successfully.",
        };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            error: "Failed to synce doctor data. Please try again.",
        };
    }
};
