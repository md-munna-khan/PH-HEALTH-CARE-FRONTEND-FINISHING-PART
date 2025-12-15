/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { serverFetch } from "@/lib/server-fetch";
import { revalidateTag } from "next/cache";

/**
 * GET ALL APPOINTMENTS
 * API: GET /appointment?queryParams
 */
export async function getAppointments(queryString?: string) {
    try {
        const searchParams = new URLSearchParams(queryString);
        const page = searchParams.get("page") || "1";
        const status = searchParams.get("status") || "all";
        const response = await serverFetch.get(`/appointment${queryString ? `?${queryString}` : ""}`, {
            next: {
                tags: [
                    "appointments-list",
                    `appointments-page-${page}`,
                    `appointments-status-${status}`,
                ],
                revalidate: 120, // real-time appointment updates for critical data
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
 * GET APPOINTMENT BY ID
 * API: GET /appointment/:id
 */
// export async function getAppointmentById(id: string) {
//     try {
//         const response = await serverFetch.get(`/appointment/${id}`)
//         const result = await response.json();
//         return result;
//     } catch (error: any) {
//         console.log(error);
//         return {
//             success: false,
//             message: `${process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'}`
//         };
//     }
// }

/**
 * CHANGE APPOINTMENT STATUS
 * API: PATCH /appointment/status/:id
 */
export async function changeAppointmentStatus(id: string, status: string) {
    try {
        const response = await serverFetch.patch(`/appointment/status/${id}`, {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });

        const result = await response.json();
        if (result.success) {
            revalidateTag('appointments-list', { expire: 0 });
            revalidateTag(`appointment-${id}`, { expire: 0 });
            revalidateTag('my-appointments', { expire: 0 });
            // Update dashboard meta for all roles (appointment status affects stats)
            revalidateTag('admin-dashboard-meta', { expire: 0 });
            revalidateTag('doctor-dashboard-meta', { expire: 0 });
            revalidateTag('patient-dashboard-meta', { expire: 0 });
            revalidateTag('dashboard-meta', { expire: 0 });
        }
        return result;
    } catch (error: any) {
        console.error("Change appointment status error:", error);
        return {
            success: false,
            message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to change status'
        };
    }
}
