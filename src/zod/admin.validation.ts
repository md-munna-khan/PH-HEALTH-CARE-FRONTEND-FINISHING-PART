import { z } from "zod";

export const createAdminZodSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Valid email is required"),
    contactNumber: z.string().min(1, "Contact number is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    profilePhoto: z
        .instanceof(File)
        .refine((file) => file.size > 0, "Profile photo is required"),
});

export const updateAdminZodSchema = z.object({
    name: z.string().min(1, "Name is required"),
    contactNumber: z.string().min(1, "Contact number is required"),
});
