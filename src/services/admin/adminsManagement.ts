/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { serverFetch } from "@/lib/server-fetch";
import { zodValidator } from "@/lib/zodValidator";
import { createAdminZodSchema, updateAdminZodSchema } from "@/zod/admin.validation";
import { revalidateTag } from "next/cache";

/**
 * CREATE ADMIN
 * API: POST /user/create-admin
 */
export async function createAdmin(_prevState: any, formData: FormData) {
    // Build validation payload
    const validationPayload = {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        contactNumber: formData.get("contactNumber") as string,
        password: formData.get("password") as string,
        profilePhoto: formData.get("file") as File,
    };

    const validatedPayload = zodValidator(validationPayload, createAdminZodSchema);

    if (!validatedPayload.success && validatedPayload.errors) {
        return {
            success: validatedPayload.success,
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
    const backendPayload = {
        password: validatedPayload.data.password,
        admin: {
            name: validatedPayload.data.name,
            email: validatedPayload.data.email,
            contactNumber: validatedPayload.data.contactNumber,
            password: validatedPayload.data.password,
        }
    };
    const newFormData = new FormData()
    newFormData.append("data", JSON.stringify(backendPayload))
    newFormData.append("file", formData.get("file") as Blob)
    try {


        const response = await serverFetch.post("/user/create-admin", {
            body: newFormData,
        });

        const result = await response.json();
        if (result.success) {
            revalidateTag('admins-list', { expire: 0 });
            revalidateTag('admins-page-1', { expire: 0 });
            revalidateTag('admin-dashboard-meta', { expire: 0 });
        }
        return result;
    } catch (error: any) {
        console.error("Create admin error:", error);
        return {
            success: false,
            message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to create admin',
            formData: validationPayload
        };
    }
}

/**
 * GET ALL ADMINS
 * API: GET /admin?queryParams
 */
export async function getAdmins(queryString?: string) {
    try {
        const searchParams = new URLSearchParams(queryString);
        const page = searchParams.get("page") || "1";
        const searchTerm = searchParams.get("searchTerm") || "all";
        const response = await serverFetch.get(`/admin${queryString ? `?${queryString}` : ""}`, {
            next: {
                tags: [
                    "admins-list",
                    `admins-page-${page}`,
                    `admins-search-${searchTerm}`,
                ],
                revalidate: 180
            }
        });
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

/**
 * GET ADMIN BY ID
 * API: GET /admin/:id
 */
export async function getAdminById(id: string) {
    try {
        const response = await serverFetch.get(`/admin/${id}`, {
            next: {
                tags: [`admin-${id}`, "admins-list"],
                revalidate: 180, // more responsive admin profile updates
            }
        });
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

/**
 * UPDATE ADMIN
 * API: PATCH /admin/:id
 */
export async function updateAdmin(id: string, _prevState: any, formData: FormData) {
    const validationPayload: any = {
        name: formData.get("name") as string,
        contactNumber: formData.get("contactNumber") as string,
    };

    /*
    // Server-side validation
        const validation = updateAdminZodSchema.safeParse(validationPayload);
        if (!validation.success) {
            const errors = validation.error.issues.map((err: any) => ({
                field: err.path[0] as string,
                message: err.message,
            }));
            return {
                success: false,
                message: "Validation failed",
                formData: validationPayload,
                errors,
            };
        }
    */

    const validation = zodValidator(validationPayload, updateAdminZodSchema);
    if (!validation.success && validation.errors) {
        return {
            success: validation.success,
            message: "Validation failed",
            formData: validationPayload,
            errors: validation.errors,
        };
    }
    if (!validation.data) {
        return {
            success: false,
            message: "Validation failed",
            formData: validationPayload,
        };
    }

    try {
        const response = await serverFetch.patch(`/admin/${id}`, {
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(validation.data),
        });

        const result = await response.json();
        if (result.success) {
            revalidateTag('admins-list', { expire: 0 });
            revalidateTag('admins-page-1', { expire: 0 });
            revalidateTag('admin-dashboard-meta', { expire: 0 });
        }
        return result;
    } catch (error: any) {
        console.error("Update admin error:", error);
        return {
            success: false,
            message: process.env.NODE_ENV === 'development' ? error.message : 'Failed to update admin',
            formData: validationPayload
        };
    }
}

/**
 * SOFT DELETE ADMIN
 * API: DELETE /admin/soft/:id
 */
export async function softDeleteAdmin(id: string) {
    try {
        const response = await serverFetch.delete(`/admin/soft/${id}`)
        const result = await response.json();
        if (result.success) {
            revalidateTag('admins-list', { expire: 0 });
            revalidateTag('admins-page-1', { expire: 0 });
            revalidateTag('admin-dashboard-meta', { expire: 0 });
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

/**
 * HARD DELETE ADMIN
 * API: DELETE /admin/:id
 */
export async function deleteAdmin(id: string) {
    try {
        const response = await serverFetch.delete(`/admin/${id}`)
        const result = await response.json();
        if (result.success) {
            revalidateTag('admins-list', { expire: 0 });
            revalidateTag('admins-page-1', { expire: 0 });
            revalidateTag('admin-dashboard-meta', { expire: 0 });
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
