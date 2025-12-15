/* eslint-disable @typescript-eslint/no-explicit-any */
import { serverFetch } from "@/lib/server-fetch";

export async function getAIDoctorSuggestion(symptoms: string) {
    // Client-side validation
    if (!symptoms || typeof symptoms !== 'string' || symptoms.trim().length < 5) {
        return {
            success: false,
            message: 'Please provide valid symptoms (at least 5 characters)',
            data: null,
        };
    }

    try {
        const response = await serverFetch.post("/doctor/suggestion", {
            body: JSON.stringify({ symptoms: symptoms.trim() }),
            headers: {
                "Content-Type": "application/json",
            },
        });

        const result = await response.json();
        return result;
    } catch (error: any) {
        console.error("Error getting AI doctor suggestion:", error);
        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "Failed to get AI doctor suggestion. Please try again.",
            data: null,
        };
    }
}