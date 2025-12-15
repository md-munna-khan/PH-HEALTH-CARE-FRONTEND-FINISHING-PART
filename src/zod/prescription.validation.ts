import z from "zod";

export const createPrescriptionSchema = z.object({
    appointmentId: z.uuid(),
    instructions: z
        .string()
        .min(10, "Instructions must be at least 10 characters"),
    followUpDate: z.string().optional(),
});