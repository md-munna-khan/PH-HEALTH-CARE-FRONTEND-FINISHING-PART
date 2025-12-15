import z from "zod";

export const createPatientZodSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters long"),
    name: z.string().min(1, "Name is required").min(3, "Name must be at least 3 characters long"),
    email: z.email("Invalid email address").min(1, "Email is required"),
    contactNumber: z.string().min(1, "Contact Number is required").min(10, "Contact Number must be at least 10 characters long"),
    address: z.string().min(1, "Address is required"),
    profilePhoto: z
        .instanceof(File)
        .refine((file) => file.size > 0, "Profile photo is required"),
});

export const updatePatientZodSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters long").optional(),
    contactNumber: z.string().min(10, "Contact Number must be at least 10 characters long").optional(),
    address: z.string().optional(),
});
