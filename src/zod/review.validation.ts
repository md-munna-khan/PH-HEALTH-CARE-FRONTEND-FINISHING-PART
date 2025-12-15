import z from "zod";

export const createReviewSchema = z.object({
    appointmentId: z.uuid(),
    rating: z
        .number()
        .min(1, "Rating must be at least 1")
        .max(5, "Rating must be at most 5"),
    comment: z
        .string()
        .min(10, "Comment must be at least 10 characters"),
});