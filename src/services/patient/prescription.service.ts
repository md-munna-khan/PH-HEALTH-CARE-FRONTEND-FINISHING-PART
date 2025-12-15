"use server"
/* eslint-disable @typescript-eslint/no-explicit-any */
import { serverFetch } from "@/lib/server-fetch";
import { IPrescriptionFormData } from "@/types/prescription.interface";
import { revalidateTag } from "next/cache";

export async function createPrescription(data: IPrescriptionFormData) {
    try {
        const response = await serverFetch.post("/prescription", {
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
            },
        });

        const result = await response.json();
        if (result.success) {
            revalidateTag('my-prescriptions', { expire: 0 });
            revalidateTag('my-appointments', { expire: 0 });
        }
        return result;
    } catch (error: any) {
        console.error("Error creating prescription:", error);
        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "Failed to create prescription",
        };
    }
}

export async function getMyPrescriptions(queryString?: string) {
    try {
        const response = await serverFetch.get(
            `/prescription/my-prescription${queryString ? `?${queryString}` : ""}`,
            {
                next: {
                    tags: ["my-prescriptions"],
                    revalidate: 300,
                },
            }
        );
        const result = await response.json();
        return result;
    } catch (error: any) {
        console.error("Error fetching prescriptions:", error);
        return {
            success: false,
            data: [],
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "Failed to fetch prescriptions",
        };
    }
}

export async function getAllPrescriptions(queryString?: string) {
    try {
        const response = await serverFetch.get(
            `/prescription${queryString ? `?${queryString}` : ""}`,
            {
                next: {
                    tags: ["prescriptions-list"],
                    revalidate: 300, // 5 minutes
                }
            }
        );
        const result = await response.json();
        return result;
    } catch (error: any) {
        console.error("Error fetching prescriptions:", error);
        return {
            success: false,
            data: [],
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "Failed to fetch prescriptions",
        };
    }
}