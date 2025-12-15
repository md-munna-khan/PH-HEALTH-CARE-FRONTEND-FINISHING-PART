"use server"
/* eslint-disable @typescript-eslint/no-explicit-any */
import { serverFetch } from "@/lib/server-fetch";
import { IAppointmentFormData } from "@/types/appointments.interface";
import { revalidateTag } from "next/cache";

export async function createAppointment(data: IAppointmentFormData) {
    try {
        const response = await serverFetch.post("/appointment", {
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
            },
        });

        const result = await response.json();
        if (result.success) {
            revalidateTag('my-appointments', { expire: 0 });
            revalidateTag('appointments-list', { expire: 0 });
            revalidateTag('patient-dashboard-meta', { expire: 0 });
            revalidateTag('admin-dashboard-meta', { expire: 0 });
            revalidateTag('doctor-dashboard-meta', { expire: 0 });
        }

        return result;
    } catch (error: any) {
        console.error("Error creating appointment:", error);
        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "Failed to book appointment",
        };
    }
}

export async function createAppointmentWithPayLater(data: IAppointmentFormData) {
    try {
        const response = await serverFetch.post("/appointment/pay-later", {
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
            },
        });

        const result = await response.json();
        if (result.success) {
            revalidateTag('my-appointments', { expire: 0 });
            revalidateTag('appointments-list', { expire: 0 });
            revalidateTag('patient-dashboard-meta', { expire: 0 });
            revalidateTag('admin-dashboard-meta', { expire: 0 });
            revalidateTag('doctor-dashboard-meta', { expire: 0 });
        }
        return result;
    } catch (error: any) {
        console.error("Error creating appointment with pay later:", error);
        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "Failed to book appointment",
        };
    }
}

export async function getMyAppointments(queryString?: string) {
    try {
        const response = await serverFetch.get(
            `/appointment/my-appointment${queryString ? `?${queryString}` : "?sortBy=createdAt&sortOrder=desc"}`, {
            next: {
                tags: ["my-appointments"],
                revalidate: 120,
            },
        }
        );
        const result = await response.json();
        return result;
    } catch (error: any) {
        console.error("Error fetching appointments:", error);
        return {
            success: false,
            data: [],
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "Failed to fetch appointments",
        };
    }
}

export async function getAppointmentById(appointmentId: string) {
    try {
        const response = await serverFetch.get('/appointment/my-appointment', {
            next: {
                tags: ["my-appointments", `appointment-${appointmentId}`],
                revalidate: 180,
            },
        });
        const result = await response.json();

        if (result.success && result.data) {
            // Find the appointment by ID from the list
            const appointment = result.data.find((apt: any) => apt.id === appointmentId);

            if (appointment) {
                return {
                    success: true,
                    data: appointment,
                };
            } else {
                return {
                    success: false,
                    data: null,
                    message: "Appointment not found",
                };
            }
        }

        return {
            success: false,
            data: null,
            message: result.message || "Failed to fetch appointment",
        };
    } catch (error: any) {
        console.error("Error fetching appointment:", error);
        return {
            success: false,
            data: null,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "Failed to fetch appointment",
        };
    }
}

export async function changeAppointmentStatus(
    appointmentId: string,
    status: string
) {
    try {
        const response = await serverFetch.patch(
            `/appointment/status/${appointmentId}`,
            {
                body: JSON.stringify({ status }),
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        const result = await response.json();

        if (result.success) {
            // Invalidate appointment caches
            revalidateTag('my-appointments', { expire: 0 });
            revalidateTag('appointments-list', { expire: 0 });
            revalidateTag(`appointment-${appointmentId}`, { expire: 0 });
            // Update dashboard for immediate status reflection
            revalidateTag('patient-dashboard-meta', { expire: 0 });
            revalidateTag('dashboard-meta', { expire: 0 });
        }
        return result;
    } catch (error: any) {
        console.error("Error changing appointment status:", error);
        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "Failed to change appointment status",
        };
    }
}
