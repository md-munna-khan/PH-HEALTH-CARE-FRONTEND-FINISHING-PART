/* eslint-disable @typescript-eslint/no-explicit-any */

"use server"

import { serverFetch } from "@/lib/server-fetch";
import { zodValidator } from "@/lib/zodValidator";
import { createSpecialityZodSchema } from "@/zod/specialities.validation";
import { revalidateTag } from "next/cache";

export async function createSpeciality(_prevState: any, formData: FormData) {

    const validationPayload = {
        title: formData.get("title") as string,
        icon: formData.get("file") as File,
    }

    const validatedPayload = zodValidator(validationPayload, createSpecialityZodSchema);

    if (!validatedPayload.success && validatedPayload.errors) {
        return {
            success: false,
            message: "Validation failed",
            formData: validationPayload,
            errors: validatedPayload.errors,
        }
    }

    if (!validatedPayload.data) {
        return {
            success: false,
            message: "Validation failed",
            formData: validationPayload,
        }
    }

    const newFormData = new FormData()
    newFormData.append("data", JSON.stringify(validatedPayload.data))
    newFormData.append("file", formData.get("file") as Blob)

    try {
        const response = await serverFetch.post("/specialties", {
            body: newFormData,
        })


        const result = await response.json();

        if (result.success) {
            revalidateTag("specialities-list", { expire: 0 });
        }

        return result;
    } catch (error: any) {
        console.log(error);
        return {
            success: false, message: `${process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'}`,
            formData: validationPayload,
        }

    }
}

export async function getSpecialities() {
    try {
        const response = await serverFetch.get("/specialties", {
            next: {
                tags: ["specialities-list"],
                revalidate: 600 // 10 minutes - specialties rarely change
            }
        })
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

export async function deleteSpeciality(id: string) {
    try {
        const response = await serverFetch.delete(`/specialties/${id}`)
        const result = await response.json();
        if (result.success) {
            revalidateTag('specialities-list', { expire: 0 });
            revalidateTag(`specialty-${id}`, { expire: 0 });
            revalidateTag('doctors-list', { expire: 0 }); // Doctors have 
        }
        return result;
    } catch (error: any) {
        console.log(error);
        return {
            success: false,
            message: `${process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'}`
        };
    }
}