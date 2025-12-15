import z from "zod";

export const createDoctorZodSchema = z.object({
    password: z.string().min(6, "Password must be at least 6 characters long"),
    name: z.string().min(1, "Name is required").min(3, "Name must be at least 3 characters long"),
    email: z.email("Invalid email address").min(1, "Email is required"),
    contactNumber: z.string().min(1, "Contact Number is required").min(10, "Contact Number must be at least 10 characters long"),
    address: z.string().optional(),
    registrationNumber: z.string().min(1, "Registration Number is required").min(3, "Registration Number must be at least 3 characters long"),
    experience: z.number().positive("Experience is required and must be more than 0"),
    gender: z.enum(["MALE", "FEMALE"], { message: "Gender must be either 'MALE' or 'FEMALE'" }),
    appointmentFee: z.number().positive("Appointment Fee is required and must be more than 0"),
    qualification: z.string().min(1, "Qualification is required").min(3, "Qualification must be at least 3 characters long"),
    currentWorkingPlace: z.string().min(1, "Current Working Place is required").min(3, "Current Working Place must be at least 3 characters long"),
    designation: z.string().min(1, "Designation is required").min(2, "Designation must be at least 2 characters long"),
    specialties: z.array(z.uuid("Each specialty must be a valid UUID")).min(1, "At least one specialty is required"),
    profilePhoto: z.instanceof(File).refine((file) => file.size > 0, {
        message: "Profile photo is required",
    }),
});

export const updateDoctorZodSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters long").optional(),
    profilePhoto: z.string().optional(),
    contactNumber: z.string().min(10, "Contact Number must be at least 10 characters long").optional(),
    address: z.string().optional(),
    registrationNumber: z.string().min(3, "Registration Number must be at least 3 characters long").optional(),
    experience: z.number().min(0, "Experience cannot be negative").optional(),
    gender: z.enum(["MALE", "FEMALE"], { message: "Gender must be either 'MALE' or 'FEMALE'" }).optional(),
    appointmentFee: z.number().min(0, "Appointment Fee cannot be negative").optional(),
    qualification: z.string().min(3, "Qualification must be at least 3 characters long").optional(),
    currentWorkingPlace: z.string().min(3, "Current Working Place must be at least 3 characters long").optional(),
    designation: z.string().min(2, "Designation must be at least 2 characters long").optional(),
    specialties: z.array(z.uuid("Each specialty must be a valid UUID")).optional(),
    removeSpecialties: z.array(z.uuid("Each specialty to remove must be a valid UUID")).optional(),
});