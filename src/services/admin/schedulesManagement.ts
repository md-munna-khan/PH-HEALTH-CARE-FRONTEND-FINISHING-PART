/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { serverFetch } from "@/lib/server-fetch";
import { zodValidator } from "@/lib/zodValidator";
import { createScheduleZodSchema } from "@/zod/schedule.validation";
import { revalidateTag } from "next/cache";

/**
 * CREATE SCHEDULE
 * API: POST /schedule
 */
export async function createSchedule(_prevState: any, formData: FormData) {
    // Build validation payload
    const validationPayload = {
        startDate: formData.get("startDate") as string,
        endDate: formData.get("endDate") as string,
        startTime: formData.get("startTime") as string,
        endTime: formData.get("endTime") as string,
    };

    /*
    // Server-side validation
        const validation = createScheduleZodSchema.safeParse(validationPayload);
        if (!validation.success) {
            const errors = validation.error.issues.map((err: any) => ({
                field: err.path[0] as string,
                message: err.message,
            }));
            return {
                success: false,
                message: "Validation failed",
                formData: validationPayload,
                errors,
            };
        }
    */

    const validation = zodValidator(validationPayload, createScheduleZodSchema);

    if (!validation.success && validation.errors) {
        return {
            success: false,
            message: "Validation failed",
            formData: validationPayload,
            errors: validation.errors,
        }
    }


    if (!validation.data) {
        return {
            success: false,
            message: "Validation failed",
            formData: validationPayload,
        }
    }

    try {
        const response = await serverFetch.post("/schedule", {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(validation.data),
        });

        const result = await response.json();
        if (result.success) {
            revalidateTag('schedules-list', { expire: 0 });
            revalidateTag('schedules-page-1', { expire: 0 });
        }
        return result;
    } catch (error: any) {
        console.error("Create schedule error:", error);
        return {
            success: false,
            message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to create schedule',
            formData: validationPayload
        };
    }
}

/**
 * GET ALL SCHEDULES
 * API: GET /schedule?queryParams
 */
export async function getSchedules(queryString?: string) {
    try {
        const searchParams = new URLSearchParams(queryString);
        const page = searchParams.get("page") || "1";
        const searchTerm = searchParams.get("searchTerm") || "all";
        const response = await serverFetch.get(`/schedule${queryString ? `?${queryString}` : ""}`, {
            next: {
                tags: [
                    "schedules-list",
                    `schedules-page-${page}`,
                    `schedules-search-${searchTerm}`,
                ],
                // Reduced to 120s for more frequent updates on schedules
                revalidate: 120,
            },
        });
        const result = await response.json();
        return result;
    } catch (error: any) {
        console.log(error);
        return {
            success: false,
            message: `${process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'}`
        };
    }
}

/**
 * GET SCHEDULE BY ID
 * API: GET /schedule/:id
 */
export async function getScheduleById(id: string) {
    try {
        const response = await serverFetch.get(`/schedule/${id}`, {
            next: {
                tags: [`schedule-${id}`, "schedules-list"],
                // Reduced to 180s for faster schedule detail updates
                revalidate: 180,
            }
        })
        const result = await response.json();
        return result;
    } catch (error: any) {
        console.log(error);
        return {
            success: false,
            message: `${process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'}`
        };
    }
}

/**
 * DELETE SCHEDULE
 * API: DELETE /schedule/:id
 */
export async function deleteSchedule(id: string) {
    try {
        const response = await serverFetch.delete(`/schedule/${id}`)
        const result = await response.json();
        if (result.success) {
            revalidateTag('schedules-list', { expire: 0 });
            revalidateTag(`schedule-${id}`, { expire: 0 });
        }
        return result;
    } catch (error: any) {
        console.log(error);
        return {
            success: false,
            message: `${process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'}`
        };
    }
}
