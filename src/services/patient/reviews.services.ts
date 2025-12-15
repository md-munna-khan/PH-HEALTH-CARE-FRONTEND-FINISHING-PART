/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { serverFetch } from "@/lib/server-fetch";
import { IReviewFormData } from "@/types/review.interface";
import { revalidateTag } from "next/cache";

export async function getReviews(queryString?: string) {
    try {
        const url = queryString ? `/review?${queryString}` : "/review";

        const response = await serverFetch.get(url, {
            next: {
                tags: ["reviews-list"],
                revalidate: 300, // 5 minutes
            }
        });
        const result = await response.json();


        return {
            success: true,
            data: result.data,
            meta: result.meta,
        };
    } catch (error: any) {
        console.error("Get reviews error:", error);
        return {
            success: false,
            message: error.message || "Failed to fetch reviews",
            data: null,
        };
    }
}

export async function createReview(data: IReviewFormData) {
    try {
        const response = await serverFetch.post("/review", {
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
            },
        });

        const result = await response.json();

        if (result.success && data.doctorId) {
            revalidateTag('reviews-list', { expire: 0 });
            revalidateTag(`doctor-${data.doctorId}`, { expire: 0 }); // Update doctor's review count
        }

        return result;
    } catch (error: any) {
        console.error("Error creating review:", error);
        return {
            success: false,
            message:
                process.env.NODE_ENV === "development"
                    ? error.message
                    : "Failed to create review",
        };
    }
}