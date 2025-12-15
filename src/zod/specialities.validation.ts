import z from "zod";

export const createSpecialityZodSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters long"),
    icon: z
        .instanceof(File)
        .refine((file) => file.size > 0, "Profile photo is required"),
})