## Part-10

## 75-1 Adding Server Actions, Types, Zod Validations For Payment, AI, Dashboard, Forgot And Change Password

- WE have some features left and now we are going to finish them. The parts are ai integration, payment, dashboard, change password, forgot password.
- we will also analyze the ssg ssr, isr and csr rendering methods in nextjs. and caching related things
- now lets start with the payment feature. we will use stripe for payment integration. we will create a subscription based payment system.

- zod -> appointment.validation.ts

```ts
import z from "zod";

export const createAppointmentSchema = z.object({
  doctorId: z.uuid(),
  scheduleId: z.uuid(),
});
```

- types - appointment.interface.ts

```ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { IDoctor } from "./doctor.interface";
import { IPatient } from "./patient.interface";
import { IPrescription } from "./prescription.interface";
import { IReview } from "./review.interface";
import { ISchedule } from "./schedule.interface";

export enum AppointmentStatus {
  SCHEDULED = "SCHEDULED",
  INPROGRESS = "INPROGRESS",
  COMPLETED = "COMPLETED",
  CANCELED = "CANCELED",
}

export enum PaymentStatus {
  PAID = "PAID",
  UNPAID = "UNPAID",
}

export interface IAppointment {
  id: string;
  patientId: string;
  patient?: IPatient;
  doctorId: string;
  doctor?: IDoctor;
  scheduleId: string;
  schedule?: ISchedule;
  videoCallingId: string;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  prescription?: IPrescription;
  review?: IReview;
  // payment?: IPayment;
}

export interface IPayment {
  id: string;
  appointmentId: string;
  amount: number;
  transactionId: string;
  status: PaymentStatus;
  paymentGatewayData?: any;
  stripeEventId?: string;

  createdAt: string;
  updatedAt: string;
}

export interface IAppointmentFormData {
  doctorId: string;
  scheduleId: string;
}
```

- types -> meta.interface.ts

```ts
export interface IBarChartData {
  month: Date | string;
  count: number;
}

export interface IPieChartData {
  status: string;
  count: number;
}

export interface IAdminDashboardMeta {
  appointmentCount: number;
  patientCount: number;
  doctorCount: number;
  adminCount?: number; // Only for super admin
  paymentCount: number;
  totalRevenue: {
    _sum: {
      amount: number | null;
    };
  };
  barChartData: IBarChartData[];
  pieCharData: IPieChartData[];
}

export interface IDoctorDashboardMeta {
  appointmentCount: number;
  patientCount: number;
  reviewCount: number;
  totalRevenue: {
    _sum: {
      amount: number | null;
    };
  };
  formattedAppointmentStatusDistribution: IPieChartData[];
}

export interface IPatientDashboardMeta {
  appointmentCount: number;
  prescriptionCount: number;
  reviewCount: number;
  formattedAppointmentStatusDistribution: IPieChartData[];
}

export type IDashboardMeta =
  | IAdminDashboardMeta
  | IDoctorDashboardMeta
  | IPatientDashboardMeta;
```

- types -> review.interface.ts

```ts
import { IAppointment } from "./appointments.interface";
import { IDoctor } from "./doctor.interface";
import { IPatient } from "./patient.interface";

export interface IReview {
  id: string;
  patientId: string;
  patient?: IPatient;
  doctorId: string;
  doctor?: IDoctor;
  appointmentId: string;
  appointment?: IAppointment;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface IReviewFormData {
  appointmentId: string;
  doctorId?: string;
  rating: number;
  comment: string;
}
```

- services -> payment -> payment.service.ts

```ts
"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { serverFetch } from "@/lib/server-fetch";

export async function initiatePayment(appointmentId: string) {
  try {
    const response = await serverFetch.post(
      `/appointment/${appointmentId}/initiate-payment`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error("Error initiating payment:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Failed to initiate payment",
    };
  }
}

export async function getPaymentStatus(appointmentId: string) {
  try {
    const response = await serverFetch.get(`/payment/status/${appointmentId}`);
    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error("Error fetching payment status:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Failed to fetch payment status",
    };
  }
}
```

- service -> meta -> dashboard.service.ts

```ts
/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { serverFetch } from "@/lib/server-fetch";
import { getUserInfo } from "../auth/getUserInfo";

export async function getDashboardMetaData() {
  try {
    const userInfo = await getUserInfo();
    const cacheTag = `${userInfo.role.toLowerCase()}-dashboard-meta`;

    const response = await serverFetch.get("/meta", {
      next: {
        tags: [cacheTag, "dashboard-meta", "meta-data"],
        // Faster revalidation for dashboard (30 seconds)
        // Dashboard stats should update frequently for real-time feel
        revalidate: 30,
      },
    });
    const result = await response.json();
    return result;
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: `${
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong"
      }`,
    };
  }
}
```

- services -> ai -> ai.service.ts

```ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { serverFetch } from "@/lib/server-fetch";

export async function getAIDoctorSuggestion(symptoms: string) {
  // Client-side validation
  if (!symptoms || typeof symptoms !== "string" || symptoms.trim().length < 5) {
    return {
      success: false,
      message: "Please provide valid symptoms (at least 5 characters)",
      data: null,
    };
  }

  try {
    const response = await serverFetch.post("/doctor/suggestion", {
      body: JSON.stringify({ symptoms: symptoms.trim() }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error("Error getting AI doctor suggestion:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Failed to get AI doctor suggestion. Please try again.",
      data: null,
    };
  }
}
```

- types -> ai.interface.ts

```ts
export interface AIDoctorSuggestionInput {
  symptoms: string;
}

export interface AISuggestedDoctor {
  id: string;
  name: string;
  specialties: string[];
  experience: number;
  averageRating: number;
  appointmentFee: number;
  profilePhoto?: string | null;
  qualification?: string;
  designation?: string;
  currentWorkingPlace?: string;
}
```

- auth.service.ts (forgot password and change password actions)

```ts
"use server";

import { verifyAccessToken } from "@/lib/jwtHanlders";
import { serverFetch } from "@/lib/server-fetch";
import { zodValidator } from "@/lib/zodValidator";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/zod/auth.validation";
import { parse } from "cookie";
import jwt from "jsonwebtoken";
import { revalidateTag } from "next/cache";
import { changePasswordSchema } from "./../../zod/auth.validation";
import { deleteCookie, getCookie, setCookie } from "./tokenHandlers";

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function updateMyProfile(formData: FormData) {
  try {
    // Create a new FormData with the data property
    const uploadFormData = new FormData();

    // Get all form fields except the file
    const data: any = {};
    formData.forEach((value, key) => {
      if (key !== "file" && value) {
        data[key] = value;
      }
    });

    // Add the data as JSON string
    uploadFormData.append("data", JSON.stringify(data));

    // Add the file if it exists
    const file = formData.get("file");
    if (file && file instanceof File && file.size > 0) {
      uploadFormData.append("file", file);
    }

    const response = await serverFetch.patch(`/user/update-my-profile`, {
      body: uploadFormData,
    });

    const result = await response.json();

    if (result.success) {
      revalidateTag("user-info", { expire: 0 });
    }
    return result;
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: `${
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong"
      }`,
    };
  }
}

// Reset Password
export async function resetPassword(_prevState: any, formData: FormData) {
  const isEmailReset = formData.get("isEmailReset") === "true";
  const email = formData.get("email") as string;
  const token = formData.get("token") as string;

  // Build validation payload
  const validationPayload = {
    newPassword: formData.get("newPassword") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  // Validate
  const validatedPayload = zodValidator(validationPayload, resetPasswordSchema);

  if (!validatedPayload.success && validatedPayload.errors) {
    return {
      success: false,
      message: "Validation failed",
      formData: validationPayload,
      errors: validatedPayload.errors,
    };
  }

  try {
    if (token) {
      jwt.verify(token, process.env.RESET_PASS_TOKEN as string);
    }

    let response;

    if (isEmailReset) {
      // Case 1: Password reset from email link (with token)
      if (!email || !token) {
        return {
          success: false,
          message: "Invalid reset link",
        };
      }

      response = await serverFetch.post("/auth/reset-password", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: email,
          password: validationPayload.newPassword,
        }),
      });
    } else {
      // Case 2: Newly created user (authenticated, needPasswordChange)
      response = await serverFetch.post("/auth/reset-password", {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: validationPayload.newPassword,
        }),
      });
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Password reset failed");
    }

    if (result.success) {
      revalidateTag("user-info", { expire: 0 });
    }

    return {
      success: true,
      message: "Password reset successfully! Redirecting to login...",
      redirectToLogin: true,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Something went wrong",
      formData: validationPayload,
    };
  }
}

export async function getNewAccessToken() {
  try {
    const accessToken = await getCookie("accessToken");
    const refreshToken = await getCookie("refreshToken");

    //Case 1: Both tokens are missing - user is logged out
    if (!accessToken && !refreshToken) {
      return {
        tokenRefreshed: false,
      };
    }

    // Case 2 : Access Token exist- and need to verify
    if (accessToken) {
      const verifiedToken = await verifyAccessToken(accessToken);

      if (verifiedToken.success) {
        return {
          tokenRefreshed: false,
        };
      }
    }

    //Case 3 : refresh Token is missing- user is logged out
    if (!refreshToken) {
      return {
        tokenRefreshed: false,
      };
    }

    //Case 4: Access Token is invalid/expired- try to get a new one using refresh token
    // This is the only case we need to call the API

    // Now we know: accessToken is invalid/missing AND refreshToken exists
    // Safe to call the API
    let accessTokenObject: null | any = null;
    let refreshTokenObject: null | any = null;

    // API Call - serverFetch will skip getNewAccessToken for /auth/refresh-token endpoint
    const response = await serverFetch.post("/auth/refresh-token", {
      headers: {
        Cookie: `refreshToken=${refreshToken}`,
      },
    });

    const result = await response.json();

    const setCookieHeaders = response.headers.getSetCookie();

    if (setCookieHeaders && setCookieHeaders.length > 0) {
      setCookieHeaders.forEach((cookie: string) => {
        const parsedCookie = parse(cookie);

        if (parsedCookie["accessToken"]) {
          accessTokenObject = parsedCookie;
        }
        if (parsedCookie["refreshToken"]) {
          refreshTokenObject = parsedCookie;
        }
      });
    } else {
      throw new Error("No Set-Cookie header found");
    }

    if (!accessTokenObject) {
      throw new Error("Tokens not found in cookies");
    }

    if (!refreshTokenObject) {
      throw new Error("Tokens not found in cookies");
    }

    await deleteCookie("accessToken");
    await setCookie("accessToken", accessTokenObject.accessToken, {
      secure: true,
      httpOnly: true,
      maxAge: parseInt(accessTokenObject["Max-Age"]) || 1000 * 60 * 60,
      path: accessTokenObject.Path || "/",
      sameSite: accessTokenObject["SameSite"] || "none",
    });

    await deleteCookie("refreshToken");
    await setCookie("refreshToken", refreshTokenObject.refreshToken, {
      secure: true,
      httpOnly: true,
      maxAge:
        parseInt(refreshTokenObject["Max-Age"]) || 1000 * 60 * 60 * 24 * 90,
      path: refreshTokenObject.Path || "/",
      sameSite: refreshTokenObject["SameSite"] || "none",
    });

    if (!result.success) {
      throw new Error(result.message || "Token refresh failed");
    }

    return {
      tokenRefreshed: true,
      success: true,
      message: "Token refreshed successfully",
    };
  } catch (error: any) {
    return {
      tokenRefreshed: false,
      success: false,
      message: error?.message || "Something went wrong",
    };
  }
}

export async function forgotPassword(_prevState: any, formData: FormData) {
  // Build validation payload
  const validationPayload = {
    email: formData.get("email") as string,
  };

  // Validate
  const validatedPayload = zodValidator(
    validationPayload,
    forgotPasswordSchema
  );

  if (!validatedPayload.success && validatedPayload.errors) {
    return {
      success: false,
      message: "Validation failed",
      formData: validationPayload,
      errors: validatedPayload.errors,
    };
  }

  try {
    // API Call
    const response = await serverFetch.post("/auth/forgot-password", {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: validationPayload.email,
      }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Failed to send reset link");
    }

    return {
      success: true,
      message: "Password reset link has been sent to your email!",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Something went wrong",
      formData: validationPayload,
    };
  }
}

export async function changePassword(_prevState: any, formData: FormData) {
  // Build validation payload
  const validationPayload = {
    oldPassword: formData.get("oldPassword") as string,
    newPassword: formData.get("newPassword") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  // Validate
  const validatedPayload = zodValidator(
    validationPayload,
    changePasswordSchema
  );

  if (!validatedPayload.success && validatedPayload.errors) {
    return {
      success: false,
      message: "Validation failed",
      formData: validationPayload,
      errors: validatedPayload.errors,
    };
  }

  try {
    // API Call
    const response = await serverFetch.post("/auth/change-password", {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        oldPassword: validationPayload.oldPassword,
        newPassword: validationPayload.newPassword,
      }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Password change failed");
    }

    return {
      success: true,
      message: result.message || "Password changed successfully!",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Something went wrong",
      formData: validationPayload,
    };
  }
}
```

- check the zod for this as well

## 75-2 Understanding Reset Password Workflow

- auth.service.ts -> resetPassword function

```ts
export async function resetPassword(_prevState: any, formData: FormData) {
  const isEmailReset = formData.get("isEmailReset") === "true";
  const email = formData.get("email") as string;
  const token = formData.get("token") as string;

  // Build validation payload
  const validationPayload = {
    newPassword: formData.get("newPassword") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  // Validate
  const validatedPayload = zodValidator(validationPayload, resetPasswordSchema);

  if (!validatedPayload.success && validatedPayload.errors) {
    return {
      success: false,
      message: "Validation failed",
      formData: validationPayload,
      errors: validatedPayload.errors,
    };
  }

  try {
    if (token) {
      jwt.verify(token, process.env.RESET_PASS_TOKEN as string);
    }

    let response;

    if (isEmailReset) {
      // Case 1: Password reset from email link (with token)
      if (!email || !token) {
        return {
          success: false,
          message: "Invalid reset link",
        };
      }

      response = await serverFetch.post("/auth/reset-password", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: email,
          password: validationPayload.newPassword,
        }),
      });
    } else {
      // Case 2: Newly created user (authenticated, needPasswordChange)
      response = await serverFetch.post("/auth/reset-password", {
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: validationPayload.newPassword,
        }),
      });
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Password reset failed");
    }

    if (result.success) {
      revalidateTag("user-info", { expire: 0 });
    }

    return {
      success: true,
      message: "Password reset successfully! Redirecting to login...",
      redirectToLogin: true,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Something went wrong",
      formData: validationPayload,
    };
  }
}
```

## 75-3 Fixing Forgot Password API And Adding Caching And Revalidation At Server Actions

- changed in backend level see backend reset password works
- tags provided for caching
- services -> admin -> admin.service.ts

```ts
export async function createAdmin(_prevState: any, formData: FormData) {
  // Build validation payload
  const validationPayload = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    contactNumber: formData.get("contactNumber") as string,
    password: formData.get("password") as string,
    profilePhoto: formData.get("file") as File,
  };

  const validatedPayload = zodValidator(
    validationPayload,
    createAdminZodSchema
  );

  if (!validatedPayload.success && validatedPayload.errors) {
    return {
      success: validatedPayload.success,
      message: "Validation failed",
      formData: validationPayload,
      errors: validatedPayload.errors,
    };
  }

  if (!validatedPayload.data) {
    return {
      success: false,
      message: "Validation failed",
      formData: validationPayload,
    };
  }
  const backendPayload = {
    password: validatedPayload.data.password,
    admin: {
      name: validatedPayload.data.name,
      email: validatedPayload.data.email,
      contactNumber: validatedPayload.data.contactNumber,
      password: validatedPayload.data.password,
    },
  };
  const newFormData = new FormData();
  newFormData.append("data", JSON.stringify(backendPayload));
  newFormData.append("file", formData.get("file") as Blob);
  try {
    const response = await serverFetch.post("/user/create-admin", {
      body: newFormData,
    });

    const result = await response.json();
    if (result.success) {
      revalidateTag("admins-list", { expire: 0 });
      revalidateTag("admins-page-1", { expire: 0 });
      revalidateTag("admin-dashboard-meta", { expire: 0 });
    }
    return result;
  } catch (error: any) {
    console.error("Create admin error:", error);
    return {
      success: false,
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Failed to create admin",
      formData: validationPayload,
    };
  }
}
export async function getAdmins(queryString?: string) {
  try {
    const searchParams = new URLSearchParams(queryString);
    const page = searchParams.get("page") || "1";
    const searchTerm = searchParams.get("searchTerm") || "all";
    const response = await serverFetch.get(
      `/admin${queryString ? `?${queryString}` : ""}`,
      {
        next: {
          tags: [
            "admins-list",
            `admins-page-${page}`,
            `admins-search-${searchTerm}`,
          ],
          revalidate: 180,
          //  this is doing the works of incremental static regeneration
        },
      }
    );
    const result = await response.json();
    return result;
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: `${
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong"
      }`,
    };
  }
}

export async function getAdminById(id: string) {
  try {
    const response = await serverFetch.get(`/admin/${id}`, {
      next: {
        tags: [`admin-${id}`, "admins-list"],
        revalidate: 180, // more responsive admin profile updates
      },
    });
    const result = await response.json();
    return result;
  } catch (error: any) {
    console.log(error);
    return {
      success: false,
      message: `${
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong"
      }`,
    };
  }
}
```

- this is doing the works of incremental static regeneration(isr) (combination os ssg and ssr)

=

## 75-4 Completing Caching And Revalidation At Server Actions

- all caching related works done


## 75-5 Creating Components And Pages For Payment

- (commonProtectedLayout) -> payment -> page.tsx 

```tsx 
import PaymentSuccessContent from "@/components/modules/Payment/PaymentSuccessContent";

// Force dynamic rendering to ensure fresh data after payment
export const dynamic = "force-dynamic";

export default async function PaymentSuccessPage() {
  return <PaymentSuccessContent />;
}

```

- components -> modules -> Payment -> PaymentSuccessContent.tsx

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { revalidate } from "@/lib/revalidate";
import { CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const PaymentSuccessContent = () => {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Get return URL from session storage only on client
    revalidate("my-appointments");
    const storedUrl =
      sessionStorage.getItem("paymentReturnUrl") ||
      "/dashboard/my-appointments";
    sessionStorage.removeItem("paymentReturnUrl");

    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Redirect after countdown
    const redirectTimer = setTimeout(() => {
      router.push(storedUrl);
    }, 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  const handleManualRedirect = () => {
    const storedUrl =
      sessionStorage.getItem("paymentReturnUrl") ||
      "/dashboard/my-appointments";
    sessionStorage.removeItem("paymentReturnUrl");
    router.push(storedUrl);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-green-50 to-emerald-50">
      <Card className="max-w-md w-full border-green-200 shadow-lg">
        <CardContent className="pt-8 pb-6">
          <div className="text-center space-y-6">
            {/* Success Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-green-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <div className="relative bg-green-100 rounded-full p-4">
                  <CheckCircle2 className="h-20 w-20 text-green-600" />
                </div>
              </div>
            </div>

            {/* Success Message */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-green-900">
                Payment Successful!
              </h1>
              <p className="text-green-700">
                Your appointment has been confirmed and payment received.
              </p>
            </div>

            {/* Details */}
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <p className="text-sm text-green-800">
                A confirmation email has been sent to your registered email
                address with appointment details.
              </p>
            </div>

            {/* Countdown */}
            <div className="text-sm text-green-600">
              Redirecting to your appointments in {countdown} seconds...
            </div>

            {/* Action Button */}
            <Button
              onClick={handleManualRedirect}
              className="w-full bg-green-600 hover:bg-green-700"
              size="lg"
            >
              View My Appointments
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccessContent;

```

- components -> modules -> Patient -> AppointmentConfirmation.tsx

```tsx 
"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  createAppointment,
  createAppointmentWithPayLater,
} from "@/services/patient/appointment.service";
import { IDoctor } from "@/types/doctor.interface";
import { ISchedule } from "@/types/schedule.interface";
import { format } from "date-fns";
import {
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  MapPin,
  Phone,
  Stethoscope,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface AppointmentConfirmationProps {
  doctor: IDoctor;
  schedule: ISchedule;
}

const AppointmentConfirmation = ({
  doctor,
  schedule,
}: AppointmentConfirmationProps) => {
  const router = useRouter();
  const [isPayingNow, setIsPayingNow] = useState(false);
  const [isPayingLater, setIsPayingLater] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const handleConfirmBooking = async () => {
    setIsPayingNow(true);

    try {
      const result = await createAppointment({
        doctorId: doctor.id!,
        scheduleId: schedule.id,
      });

      if (result.success && result.data?.paymentUrl) {
        toast.success("Redirecting to payment...");
        // Redirect to Stripe checkout
        window.location.replace(result.data.paymentUrl);
      } else if (result.success) {
        setBookingSuccess(true);
        toast.success("Appointment booked successfully!");

        // Redirect after 2 seconds
        setTimeout(() => {
          router.push("/dashboard/my-appointments");
        }, 2000);
      } else {
        toast.error(result.message || "Failed to book appointment");
        setIsPayingNow(false);
      }
    } catch (error) {
      toast.error("An error occurred while booking the appointment");
      setIsPayingNow(false);
      console.error(error);
    }
  };

  const handlePayLater = async () => {
    setIsPayingLater(true);

    try {
      const result = await createAppointmentWithPayLater({
        doctorId: doctor.id!,
        scheduleId: schedule.id,
      });

      if (result.success) {
        setBookingSuccess(true);
        toast.success(
          "Appointment booked! You can pay later from your appointments page."
        );

        // Redirect after 2 seconds
        setTimeout(() => {
          router.push("/dashboard/my-appointments");
        }, 2000);
      } else {
        toast.error(result.message || "Failed to book appointment");
        setIsPayingLater(false);
      }
    } catch (error) {
      toast.error("An error occurred while booking the appointment");
      setIsPayingLater(false);
      console.error(error);
    }
  };

  if (bookingSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 className="h-16 w-16 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-green-900">
                  Appointment Confirmed!
                </h2>
                <p className="text-green-700 mt-2">
                  Your appointment has been successfully booked
                </p>
              </div>
              <p className="text-sm text-green-600">
                Redirecting to your appointments...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Confirm Appointment
        </h1>
        <p className="text-muted-foreground mt-2">
          Review the details below and confirm your appointment
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Doctor Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Doctor Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-2xl font-semibold">{doctor.name}</p>
              <p className="text-muted-foreground">{doctor.designation}</p>
            </div>

            <Separator />

            {doctor.doctorSpecialties &&
              doctor.doctorSpecialties.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Stethoscope className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Specialties</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {doctor.doctorSpecialties.map((ds, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-200"
                      >
                        {ds.specialities?.title || "N/A"}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            <Separator />

            <div className="space-y-2">
              {doctor.qualification && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Qualification:
                  </span>
                  <span className="text-sm font-medium">
                    {doctor.qualification}
                  </span>
                </div>
              )}

              {doctor.experience !== undefined && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Experience:
                  </span>
                  <span className="text-sm font-medium">
                    {doctor.experience} years
                  </span>
                </div>
              )}

              {doctor.currentWorkingPlace && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Working at:
                  </span>
                  <span className="text-sm font-medium">
                    {doctor.currentWorkingPlace}
                  </span>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              {doctor.contactNumber && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{doctor.contactNumber}</span>
                </div>
              )}

              {doctor.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{doctor.address}</span>
                </div>
              )}
            </div>

            <Separator />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-900">
                  Consultation Fee
                </span>
                <span className="text-xl font-bold text-blue-600">
                  ${doctor.appointmentFee}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Appointment Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-linear-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Date</p>
                <p className="text-2xl font-bold text-blue-900">
                  {format(new Date(schedule.startDateTime), "EEEE")}
                </p>
                <p className="text-lg text-blue-700">
                  {format(new Date(schedule.startDateTime), "MMMM d, yyyy")}
                </p>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="text-lg font-semibold text-blue-900">
                    {format(new Date(schedule.startDateTime), "h:mm a")} -{" "}
                    {format(new Date(schedule.endDateTime), "h:mm a")}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <h3 className="font-semibold text-sm">Important Information</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>
                    Please arrive 10 minutes before your scheduled time
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>
                    Bring any relevant medical records or prescriptions
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>
                    You can cancel or reschedule from your appointments page
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>
                    A confirmation will be sent to your registered email
                  </span>
                </li>
              </ul>
            </div>

            <Separator />

            <div className="space-y-3 pt-2">
              <Button
                onClick={handleConfirmBooking}
                disabled={isBooking}
                className="w-full"
                size="lg"
              >
                {isPayingNow ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay Now & Book Appointment
                  </>
                )}
              </Button>

              <Button
                onClick={handlePayLater}
                disabled={isBooking}
                variant="outline"
                className="w-full"
                size="lg"
              >
                {isPayingLater ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Booking Appointment...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Book Now, Pay Later
                  </>
                )}
              </Button>

              <Button
                variant="ghost"
                onClick={() => router.back()}
                disabled={isBooking}
                className="w-full"
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppointmentConfirmation;

```

- pay Later functionality AppointmentList.tsx 

```tsx 
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { initiatePayment } from "@/services/payment/payment.service";
import {
  AppointmentStatus,
  IAppointment,
  PaymentStatus,
} from "@/types/appointments.interface";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  CreditCard,
  FileText,
  Loader2,
  MapPin,
  MessageSquare,
  Star,
  Stethoscope,
  User,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import AppointmentCountdown from "./AppointmentCountdown";

interface AppointmentsListProps {
  appointments: IAppointment[];
}

const AppointmentsList = ({ appointments }: AppointmentsListProps) => {
  const [processingPaymentId, setProcessingPaymentId] = useState<string | null>(
    null
  );

  const handlePayNow = async (appointmentId: string) => {
    setProcessingPaymentId(appointmentId);
    try {
      const result = await initiatePayment(appointmentId);

      if (result.success && result.data?.paymentUrl) {
        toast.success("Redirecting to payment...");
        // Store return URL before redirecting to payment
        sessionStorage.setItem(
          "paymentReturnUrl",
          "/dashboard/my-appointments"
        );
        window.location.replace(result.data.paymentUrl);
      } else {
        toast.error(result.message || "Failed to initiate payment");
        setProcessingPaymentId(null);
      }
    } catch (error) {
      toast.error("An error occurred while initiating payment");
      setProcessingPaymentId(null);
      console.error(error);
    }
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    const statusConfig: Record<
      AppointmentStatus,
      { variant: any; label: string; className?: string }
    > = {
      [AppointmentStatus.SCHEDULED]: {
        variant: "default",
        label: "Scheduled",
        className: "bg-blue-500 hover:bg-blue-600",
      },
      [AppointmentStatus.INPROGRESS]: {
        variant: "secondary",
        label: "In Progress",
      },
      [AppointmentStatus.COMPLETED]: {
        variant: "default",
        label: "Completed",
        className: "bg-green-500 hover:bg-green-600",
      },
      [AppointmentStatus.CANCELED]: {
        variant: "destructive",
        label: "Canceled",
      },
    };

    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    if (status === PaymentStatus.PAID) {
      return (
        <Badge
          variant="default"
          className="bg-emerald-500 hover:bg-emerald-600"
        >
          Paid
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="bg-orange-50 text-orange-700 border-orange-300"
      >
        Payment Pending
      </Badge>
    );
  };

  if (appointments.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Appointments Yet</h3>
          <p className="text-muted-foreground text-center max-w-sm">
            You haven&apos;t booked any appointments. Browse our doctors and
            book your first consultation.
          </p>
          <Button className="mt-4" asChild>
            <a href="/consultation">Find a Doctor</a>
          </Button>
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {appointments.map((appointment) => (
        <Card
          key={appointment.id}
          className="hover:shadow-lg transition-shadow"
        >
          <CardContent className="pt-6 space-y-4">
            {/* Status and Review Badge */}
            <div className="flex justify-between items-start gap-2 flex-wrap">
              <div className="flex gap-2 flex-wrap">
                {getStatusBadge(appointment.status)}
                {getPaymentStatusBadge(appointment.paymentStatus)}
              </div>
              <div className="flex gap-2 flex-wrap">
                {appointment.prescription && (
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700"
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    Prescription
                  </Badge>
                )}
                {appointment.status === AppointmentStatus.COMPLETED &&
                  !appointment.review && (
                    <Badge
                      variant="outline"
                      className="bg-amber-50 text-amber-700 border-amber-300 animate-pulse"
                    >
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Can Review
                    </Badge>
                  )}
              </div>
            </div>

            {/* Doctor Info */}
            <div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {appointment.doctor?.name || "N/A"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {appointment.doctor?.designation || "Doctor"}
                  </p>
                </div>
              </div>
            </div>

            {/* Specialties */}
            {appointment.doctor?.doctorSpecialties &&
              appointment.doctor.doctorSpecialties.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                  {appointment.doctor.doctorSpecialties
                    .slice(0, 2)
                    .map((ds, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {ds.specialities?.title || "N/A"}
                      </Badge>
                    ))}
                  {appointment.doctor.doctorSpecialties.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{appointment.doctor.doctorSpecialties.length - 2} more
                    </Badge>
                  )}
                </div>
              )}

            {/* Schedule */}
            {appointment.schedule && (
              <div className="space-y-2 bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {format(
                      new Date(appointment.schedule.startDateTime),
                      "EEEE, MMM d, yyyy"
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {format(
                      new Date(appointment.schedule.startDateTime),
                      "h:mm a"
                    )}{" "}
                    -{" "}
                    {format(
                      new Date(appointment.schedule.endDateTime),
                      "h:mm a"
                    )}
                  </span>
                </div>
                {appointment.status === AppointmentStatus.SCHEDULED &&
                  appointment.schedule.startDateTime && (
                    <div className="pt-2 border-t border-gray-200">
                      <AppointmentCountdown
                        appointmentDateTime={appointment.schedule.startDateTime}
                      />
                    </div>
                  )}
              </div>
            )}

            {/* Address */}
            {appointment.doctor?.address && (
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span className="line-clamp-2">
                  {appointment.doctor.address}
                </span>
              </div>
            )}

            {/* Review Status */}
            {appointment.status === AppointmentStatus.COMPLETED && (
              <div>
                {appointment.review ? (
                  <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 rounded-lg p-2">
                    <Star className="h-4 w-4 fill-yellow-600" />
                    <span>Rated {appointment.review.rating}/5</span>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground bg-gray-50 rounded-lg p-2">
                    No review yet
                  </div>
                )}
              </div>
            )}
          </CardContent>

          <CardFooter className="border-t pt-4">
            <div className="flex gap-2 w-full">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link href={`/dashboard/my-appointments/${appointment.id}`}>
                  View Details
                </Link>
              </Button>
              {appointment.paymentStatus === PaymentStatus.UNPAID &&
                appointment.status !== AppointmentStatus.CANCELED && (
                  <Button
                    onClick={() => handlePayNow(appointment.id)}
                    disabled={processingPaymentId === appointment.id}
                    size="sm"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    {processingPaymentId === appointment.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Pay Now
                      </>
                    )}
                  </Button>
                )}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default AppointmentsList;

```
- AppointmentCountdown.tsx 

```tsx 
"use client";

import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface AppointmentCountdownProps {
  appointmentDateTime: string;
  className?: string;
}

const AppointmentCountdown = ({
  appointmentDateTime,
  className = "",
}: AppointmentCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [isPast, setIsPast] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const appointmentTime = new Date(appointmentDateTime).getTime();
      const difference = appointmentTime - now;

      if (difference <= 0) {
        setIsPast(true);
        setTimeLeft("Appointment time passed");
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [appointmentDateTime]);

  return (
    <div
      className={`flex items-center gap-2 text-sm ${
        isPast ? "text-red-600" : "text-blue-600"
      } ${className}`}
    >
      <Clock className="h-4 w-4" />
      <span className="font-medium">
        {isPast ? "Appointment passed" : `Starts in: ${timeLeft}`}
      </span>
    </div>
  );
};

export default AppointmentCountdown;

```
- AppointmentDetails.tsx 

```tsx 
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  MapPin,
  Phone,
  Star,
  Stethoscope,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
// import ReviewDialog from "./ReviewDialog";
import { changeAppointmentStatus } from "@/services/patient/appointment.service";
import { initiatePayment } from "@/services/payment/payment.service";
import {
  AppointmentStatus,
  IAppointment,
  PaymentStatus,
} from "@/types/appointments.interface";
import { toast } from "sonner";
import AppointmentCountdown from "./AppointmentCountdown";
import ReviewDialog from "./ReviewDialog";

interface AppointmentDetailProps {
  appointment: IAppointment;
}

const AppointmentDetails = ({ appointment }: AppointmentDetailProps) => {
  const router = useRouter();
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const isCompleted = appointment.status === AppointmentStatus.COMPLETED;
  const isCanceled = appointment.status === AppointmentStatus.CANCELED;
  const isScheduled = appointment.status === AppointmentStatus.SCHEDULED;
  const canReview =
    isCompleted &&
    !appointment.review &&
    appointment.paymentStatus === PaymentStatus.PAID;
  const canCancel = isScheduled && !isCanceled;

  const handlePayNow = async () => {
    setIsProcessingPayment(true);
    try {
      const result = await initiatePayment(appointment.id);

      if (result.success && result.data?.paymentUrl) {
        toast.success("Redirecting to payment...");
        // Store return URL before redirecting to payment
        sessionStorage.setItem(
          "paymentReturnUrl",
          "/dashboard/my-appointments"
        );
        window.location.replace(result.data.paymentUrl);
      } else {
        toast.error(result.message || "Failed to initiate payment");
        setIsProcessingPayment(false);
      }
    } catch (error) {
      toast.error("An error occurred while initiating payment");
      setIsProcessingPayment(false);
      console.error(error);
    }
  };

  const handleCancelAppointment = async () => {
    if (!confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    setIsCancelling(true);
    try {
      const result = await changeAppointmentStatus(
        appointment.id,
        AppointmentStatus.CANCELED
      );

      if (result.success) {
        toast.success("Appointment cancelled successfully");
        router.refresh();
      } else {
        toast.error(result.message || "Failed to cancel appointment");
      }
    } catch (error) {
      toast.error("An error occurred while cancelling appointment");
      console.error(error);
    } finally {
      setIsCancelling(false);
    }
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    const statusConfig: Record<
      AppointmentStatus,
      { variant: any; label: string; className?: string }
    > = {
      [AppointmentStatus.SCHEDULED]: {
        variant: "default",
        label: "Scheduled",
        className: "bg-blue-500 hover:bg-blue-600",
      },
      [AppointmentStatus.INPROGRESS]: {
        variant: "secondary",
        label: "In Progress",
      },
      [AppointmentStatus.COMPLETED]: {
        variant: "default",
        label: "Completed",
        className: "bg-green-500 hover:bg-green-600",
      },
      [AppointmentStatus.CANCELED]: {
        variant: "destructive",
        label: "Canceled",
      },
    };

    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Appointment Details
          </h1>
          <p className="text-muted-foreground mt-2">
            Complete information about your appointment
          </p>
        </div>
        <div className="flex gap-2">
          {canCancel && (
            <Button
              variant="destructive"
              onClick={handleCancelAppointment}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Appointment"
              )}
            </Button>
          )}
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </div>
      </div>

      {/* Review Notification - Only show if can review (completed but no review) */}
      {canReview && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900">
                  Review This Appointment
                </h3>
                <p className="text-sm text-amber-700 mt-1">
                  Your appointment has been completed. Share your experience by
                  leaving a review for Dr. {appointment.doctor?.name}.
                </p>
                <Button
                  onClick={() => setShowReviewDialog(true)}
                  className="mt-3"
                  size="sm"
                >
                  Write a Review
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Required Alert - Show if completed but not paid */}
      {!isCompleted &&
        !appointment.review &&
        appointment.paymentStatus === PaymentStatus.UNPAID && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900">
                    Payment Required to Review
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    Please complete the payment for this appointment before
                    leaving a review.
                  </p>
                  <Button
                    onClick={handlePayNow}
                    disabled={isProcessingPayment}
                    className="mt-3 bg-red-600 hover:bg-red-700"
                    size="sm"
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Pay Now
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Cannot Review Yet - Only show if not completed and no review */}
      {!isCompleted && !appointment.review && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900">
                  Review Not Available Yet
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  You can review this appointment after it has been completed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Doctor Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Doctor Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-2xl font-semibold">
                {appointment.doctor?.name || "N/A"}
              </p>
              <p className="text-muted-foreground">
                {appointment.doctor?.designation || "Doctor"}
              </p>
            </div>

            <Separator />

            {appointment.doctor?.doctorSpecialties &&
              appointment.doctor.doctorSpecialties.length > 0 && (
                <>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Stethoscope className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Specialties</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {appointment.doctor.doctorSpecialties.map((ds, idx) => (
                        <Badge key={idx} variant="secondary">
                          {ds.specialities?.title || "N/A"}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

            <div className="space-y-2">
              {appointment.doctor?.qualification && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Qualification:</span>
                  <span className="font-medium">
                    {appointment.doctor.qualification}
                  </span>
                </div>
              )}

              {appointment.doctor?.experience !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Experience:</span>
                  <span className="font-medium">
                    {appointment.doctor.experience} years
                  </span>
                </div>
              )}

              {appointment.doctor?.currentWorkingPlace && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Working at:</span>
                  <span className="font-medium">
                    {appointment.doctor.currentWorkingPlace}
                  </span>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              {appointment.doctor?.contactNumber && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{appointment.doctor.contactNumber}</span>
                </div>
              )}

              {appointment.doctor?.address && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>{appointment.doctor.address}</span>
                </div>
              )}
            </div>

            {appointment.doctor?.appointmentFee !== undefined && (
              <>
                <Separator />
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-900">
                      Consultation Fee
                    </span>
                    <span className="text-xl font-bold text-blue-600">
                      ${appointment.doctor.appointmentFee}
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Appointment Details */}
        <div className="space-y-6 lg:col-span-1">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Appointment Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Current Status
                </span>
                {getStatusBadge(appointment.status)}
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          {appointment.schedule && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-linear-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Date</p>
                    <p className="text-xl font-bold text-blue-900">
                      {format(
                        new Date(appointment.schedule.startDateTime),
                        "EEEE"
                      )}
                    </p>
                    <p className="text-blue-700">
                      {format(
                        new Date(appointment.schedule.startDateTime),
                        "MMMM d, yyyy"
                      )}
                    </p>
                  </div>

                  <Separator className="bg-blue-200" />

                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p className="font-semibold text-blue-900">
                        {format(
                          new Date(appointment.schedule.startDateTime),
                          "h:mm a"
                        )}{" "}
                        -{" "}
                        {format(
                          new Date(appointment.schedule.endDateTime),
                          "h:mm a"
                        )}
                      </p>
                    </div>
                  </div>

                  {appointment.status === AppointmentStatus.SCHEDULED &&
                    appointment.schedule.startDateTime && (
                      <>
                        <Separator className="bg-blue-200" />
                        <div className="pt-2">
                          <AppointmentCountdown
                            appointmentDateTime={
                              appointment.schedule.startDateTime
                            }
                            className="text-blue-700"
                          />
                        </div>
                      </>
                    )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Prescription */}
          {appointment.prescription && (
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-5 w-5" />
                  Prescription Available
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-green-50 rounded-lg p-3 space-y-2">
                  <div>
                    <span className="text-sm font-medium text-green-900">
                      Instructions:
                    </span>
                    <p className="text-sm text-green-700 mt-1">
                      {appointment.prescription.instructions}
                    </p>
                  </div>

                  {appointment.prescription.followUpDate && (
                    <div>
                      <span className="text-sm font-medium text-green-900">
                        Follow-up Date:
                      </span>
                      <p className="text-sm text-green-700">
                        {format(
                          new Date(appointment.prescription.followUpDate),
                          "MMMM d, yyyy"
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Review Section - Full Width Below */}
      {appointment.review && (
        <Card className="border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <Star className="h-5 w-5 fill-yellow-600" />
              Your Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-yellow-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= appointment.review!.rating
                        ? "fill-yellow-500 text-yellow-500"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm font-medium text-yellow-900">
                  {appointment.review.rating}/5
                </span>
              </div>

              {appointment.review.comment && (
                <div>
                  <p className="text-sm text-yellow-900 font-medium mb-1">
                    Comment:
                  </p>
                  <p className="text-sm text-yellow-800">
                    {appointment.review.comment}
                  </p>
                </div>
              )}

              <p className="text-xs text-yellow-600 italic">
                Reviews cannot be edited or deleted once submitted.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review Dialog */}
      {canReview && (
        <ReviewDialog
          isOpen={showReviewDialog}
          onClose={() => setShowReviewDialog(false)}
          appointmentId={appointment.id}
          doctorName={appointment.doctor?.name || "the doctor"}
        />
      )}
    </div>
  );
};

export default AppointmentDetails;

```

- lib -> revalidate.ts (for making the successful payment revalidating cache as the work is done by stripe webhook)

```ts
"use server";
import { revalidateTag } from "next/cache";

export const revalidate = async (tag: string) => {
    revalidateTag(tag, { expire: 0 });
}
```

## 75-6 Completing Payment And Caching Issue Of Appointments


- all payment facility checked

## 75-7 Creating Components And Pages For AI Doctor Search And Suggestion

- components -> shared -> AIISearchDialog.tsx 

```tsx 
"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import { getAIDoctorSuggestion } from "@/services/ai/ai.service";
import { AISuggestedDoctor } from "@/types/ai.interface";
import {
  Award,
  Briefcase,
  DollarSign,
  Loader2,
  MapPin,
  Search,
  Sparkles,
  Star,
  Stethoscope,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "../ui/badge";

interface AISearchDialogProps {
  initialSymptoms?: string;
  externalOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSearchComplete?: () => void;
}

export default function AISearchDialog({
  initialSymptoms = "",
  externalOpen,
  onOpenChange,
  onSearchComplete,
}: AISearchDialogProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [symptoms, setSymptoms] = useState(initialSymptoms);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedDoctors, setSuggestedDoctors] = useState<AISuggestedDoctor[]>(
    []
  );
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasAutoSearched, setHasAutoSearched] = useState(false);
  const [triggerSearch, setTriggerSearch] = useState(false);

  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  // Update symptoms when initialSymptoms changes (from external source)
  useEffect(() => {
    if (initialSymptoms && initialSymptoms !== symptoms && !open) {
      // Only update when dialog is closed to prevent interference with user editing
      setSymptoms(initialSymptoms);
      setHasAutoSearched(false);
      setTriggerSearch(true); // Mark that we should auto-search
    }
  }, [initialSymptoms, symptoms, open]);

  const handleSearch = async () => {
    if (!symptoms.trim() || symptoms.trim().length < 5) {
      toast.error("Please describe your symptoms (at least 5 characters)");
      return;
    }

    setIsLoading(true);
    setSuggestedDoctors([]);
    setShowSuggestions(false);

    try {
      const response = await getAIDoctorSuggestion(symptoms);
      if (response.success && response.data) {
        const doctors = Array.isArray(response.data)
          ? response.data
          : [response.data];
        setSuggestedDoctors(doctors);
        setShowSuggestions(true);
        toast.success("AI suggestions found!");
      } else {
        toast.error(response.message || "Failed to get AI suggestions");
      }
    } catch (error) {
      console.error("Error getting AI suggestion:", error);
      toast.error("Failed to get AI suggestion. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-trigger search when dialog opens with symptoms (only for external triggers)
  useEffect(() => {
    if (
      open &&
      triggerSearch &&
      symptoms &&
      symptoms.trim().length >= 5 &&
      !hasAutoSearched
    ) {
      setHasAutoSearched(true);
      setTriggerSearch(false); // Reset trigger
      // Small delay to ensure dialog is fully rendered
      setTimeout(() => {
        handleSearch();
      }, 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, triggerSearch, hasAutoSearched]);

  // Reset when dialog is manually closed
  const handleDialogOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      // Dialog is opening
      setOpen(newOpen);
    } else {
      // Dialog is closing - reset state
      setOpen(newOpen);
      setTimeout(() => {
        setHasAutoSearched(false);
        setTriggerSearch(false);
        setSymptoms("");
        setSuggestedDoctors([]);
        setShowSuggestions(false);
        onSearchComplete?.();
      }, 100);
    }
  };

  const handleDoctorClick = () => {
    setOpen(false);
    setSymptoms("");
    setSuggestedDoctors([]);
    setShowSuggestions(false);
    setHasAutoSearched(false);
    setTriggerSearch(false);
    onSearchComplete?.();
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:inline">AI Search</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary rounded-lg">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle>AI Doctor Search</DialogTitle>
              <DialogDescription>
                Describe your symptoms to find the right doctor
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Textarea
              placeholder="Describe your symptoms in detail (e.g., severe headache for 3 days, high fever with chills, persistent cough with chest pain, etc.)..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              onKeyDown={(e) => {
                // Prevent keyboard shortcuts from triggering while typing
                e.stopPropagation();
                // Allow Enter to create new line, not trigger search
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  !e.ctrlKey &&
                  !e.metaKey
                ) {
                  // Only trigger search if explicitly pressing Enter alone
                  // Comment this out to prevent Enter from searching while typing
                  // e.preventDefault();
                  // handleSearch();
                }
              }}
              rows={4}
              className="resize-none border-primary/30 focus:border-primary focus:ring-primary/50"
              disabled={isLoading}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-muted-foreground">
                {symptoms.length} characters
              </p>
              <p className="text-xs text-primary font-medium">
                Minimum 5 characters required
              </p>
            </div>
          </div>

          <Button
            onClick={handleSearch}
            disabled={isLoading || symptoms.trim().length < 5}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing symptoms...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search with AI
              </>
            )}
          </Button>

          {showSuggestions && suggestedDoctors.length > 0 && (
            <div className="space-y-4 p-4 bg-linear-to-br from-primary/5 to-white rounded-lg border-2 border-primary/20">
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/30"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Recommended ({suggestedDoctors.length})
                </Badge>
                <p className="text-xs text-muted-foreground">
                  Based on your symptoms
                </p>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {suggestedDoctors.map((doctor, index) => (
                  <div
                    key={doctor.id || index}
                    className="p-4 bg-white rounded-lg border border-primary/20 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="shrink-0">
                        <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                      </div>

                      {/* Doctor Photo */}
                      <div className="shrink-0">
                        {doctor.profilePhoto ? (
                          <Image
                            src={doctor.profilePhoto}
                            alt={doctor.name}
                            width={64}
                            height={64}
                            className="w-16 h-16 rounded-full object-cover border-2 border-primary/30"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center">
                            <span className="text-xl font-bold text-primary">
                              {doctor.name
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2) || "DR"}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900">
                              {doctor.name || "N/A"}
                            </h4>
                            {doctor.averageRating > 0 && (
                              <div className="flex items-center gap-1 text-amber-600">
                                <Star className="h-4 w-4 fill-amber-600" />
                                <span className="text-sm font-medium">
                                  {doctor.averageRating.toFixed(1)}
                                </span>
                              </div>
                            )}
                          </div>
                          {doctor.designation && (
                            <p className="text-sm text-gray-600">
                              {doctor.designation}
                            </p>
                          )}
                        </div>

                        {/* All Specialties */}
                        {doctor.specialties &&
                          doctor.specialties.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {doctor.specialties.map((specialty, idx) => (
                                <Badge
                                  key={idx}
                                  variant={
                                    idx % 2 === 0 ? "default" : "outline"
                                  }
                                  className={
                                    idx % 2 === 0
                                      ? "bg-blue-600 text-white"
                                      : ""
                                  }
                                >
                                  <Stethoscope className="h-3 w-3 mr-1" />
                                  {specialty}
                                </Badge>
                              ))}
                            </div>
                          )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          {doctor.experience > 0 && (
                            <div className="flex items-center gap-2 text-gray-700">
                              <Briefcase className="h-4 w-4 text-primary" />
                              <span>{doctor.experience} years</span>
                            </div>
                          )}
                          {doctor.qualification && (
                            <div className="flex items-center gap-2 text-gray-700">
                              <Award className="h-4 w-4 text-primary" />
                              <span className="truncate">
                                {doctor.qualification}
                              </span>
                            </div>
                          )}
                          {doctor.currentWorkingPlace && (
                            <div className="flex items-center gap-2 text-gray-700">
                              <MapPin className="h-4 w-4 text-primary" />
                              <span className="truncate">
                                {doctor.currentWorkingPlace}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-primary/20">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-semibold text-green-700">
                              ৳{doctor.appointmentFee}
                            </span>
                            <span className="text-xs text-gray-500">fee</span>
                          </div>
                          <Link
                            href={`/consultation/doctor/${doctor.id}`}
                            onClick={handleDoctorClick}
                          >
                            <Button size="sm">
                              <User className="h-3 w-3 mr-1" />
                              View Profile
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-blue-200">
                <p className="text-xs text-center text-muted-foreground">
                  ⚠️ AI suggestions are for guidance only. Please consult a
                  medical professional for accurate diagnosis.
                </p>
              </div>
            </div>
          )}

          {showSuggestions && suggestedDoctors.length === 0 && (
            <div className="p-6 bg-amber-50 rounded-lg border-2 border-amber-200 text-center">
              <p className="text-amber-700 font-medium">
                No doctor recommendations found
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Try describing your symptoms differently.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

```

- components -> Components -> PublicNavbar.tsx 

```tsx 
import { getDefaultDashboardRoute } from "@/lib/auth-utils";
import { getUserInfo } from "@/services/auth/getUserInfo";
import { getCookie } from "@/services/auth/tokenHandlers";
import Link from "next/link";
import AISearchDialog from "./AISSearchDialog";
import MobileMenu from "./MobileMenu";
import NavbarAuthButtons from "./NavbarAuthButtons";

const PublicNavbar = async () => {
  const navItems = [
    { href: "/consultation", label: "Consultation" },
    { href: "/health-plans", label: "Health Plans" },
    { href: "/medicine", label: "Medicine" },
    { href: "/diagnostics", label: "Diagnostics" },
    { href: "/ngos", label: "NGOs" },
  ];

  const accessToken = await getCookie("accessToken");
  const userInfo = accessToken ? await getUserInfo() : null;
  const dashboardRoute = userInfo
    ? getDefaultDashboardRoute(userInfo.role)
    : "/";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur  dark:bg-background/95">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-primary">PH Doc</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navItems.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              prefetch={true}
              className="text-foreground hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center space-x-2">
          <AISearchDialog />
          <NavbarAuthButtons
            initialHasToken={!!accessToken}
            initialUserInfo={userInfo}
            initialDashboardRoute={dashboardRoute}
          />
        </div>

        {/* Mobile Menu */}
        <MobileMenu
          navItems={navItems}
          hasAccessToken={!!accessToken}
          userInfo={userInfo}
          dashboardRoute={dashboardRoute}
        />
      </div>
    </header>
  );
};

export default PublicNavbar;

```
- components -> shared -> NavBarAuthButtons.tsx 

```tsx 
"use client";

import { useAuthToken } from "@/hooks/useAuthToken";
import { UserInfo } from "@/types/user.interface";
import { LayoutDashboard } from "lucide-react";
import Link from "next/link";
import UserDropdown from "../modules/Dashboard/UserDropdown";
import { Button } from "../ui/button";

interface NavbarAuthButtonsProps {
  initialHasToken: boolean;
  initialUserInfo: UserInfo | null;
  initialDashboardRoute: string;
}

export default function NavbarAuthButtons({
  initialHasToken,
  initialUserInfo,
  initialDashboardRoute,
}: NavbarAuthButtonsProps) {
  // Detect client-side auth state changes on navigation
  const clientHasToken = useAuthToken();

  // Use client token state if available, otherwise fall back to server state
  const hasToken = clientHasToken || initialHasToken;
  const userInfo = hasToken ? initialUserInfo : null;
  const dashboardRoute = initialDashboardRoute;

  if (hasToken && userInfo) {
    return (
      <>
        <Link href={dashboardRoute}>
          <Button variant="outline" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Button>
        </Link>
        <UserDropdown userInfo={userInfo} />
      </>
    );
  }

  return (
    <Link href="/login">
      <Button>Login</Button>
    </Link>
  );
}

```


- components -> shared -> MobileMenu.tsx 

```tsx 
"use client";

import { UserInfo } from "@/types/user.interface";
import { LayoutDashboard, Menu } from "lucide-react";
import Link from "next/link";
import UserDropdown from "../modules/Dashboard/UserDropdown";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "../ui/sheet";
import AISearchDialog from "./AISSearchDialog";

interface MobileMenuProps {
  navItems: Array<{ href: string; label: string }>;
  hasAccessToken: boolean;
  userInfo?: UserInfo | null;
  dashboardRoute?: string;
}

const MobileMenu = ({
  navItems,
  hasAccessToken,
  userInfo,
  dashboardRoute,
}: MobileMenuProps) => {
  return (
    <div className="md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">
            <Menu />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] sm:w-[400px] p-4">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <nav className="flex flex-col space-y-4 mt-8">
            {navItems.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-lg font-medium"
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t pt-4 flex flex-col space-y-4">
              <div className="flex justify-center w-full">
                <AISearchDialog />
              </div>
              {hasAccessToken && userInfo ? (
                <>
                  <Link
                    href={dashboardRoute || "/"}
                    className="text-lg font-medium"
                  >
                    <Button className="w-full gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <div className="flex justify-center">
                    <UserDropdown userInfo={userInfo} />
                  </div>
                </>
              ) : (
                <Link href="/login" className="text-lg font-medium">
                  <Button className="w-full">Login</Button>
                </Link>
              )}
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileMenu;

```

- components -> modules -> Consultation -> AiDoctorSuggestion.tsx 

```tsx 
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getAIDoctorSuggestion } from "@/services/ai/ai.service";
import { AISuggestedDoctor } from "@/types/ai.interface";

import {
  Award,
  Briefcase,
  DollarSign,
  Loader2,
  MapPin,
  Sparkles,
  Star,
  Stethoscope,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function AIDoctorSuggestion() {
  const [symptoms, setSymptoms] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedDoctors, setSuggestedDoctors] = useState<AISuggestedDoctor[]>(
    []
  );
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleGetSuggestion = async () => {
    if (!symptoms.trim() || symptoms.trim().length < 5) {
      toast.error("Please describe your symptoms (at least 5 characters)");
      return;
    }

    setIsLoading(true);
    setSuggestedDoctors([]);
    setShowSuggestions(false);

    try {
      const response = await getAIDoctorSuggestion(symptoms);
      if (response.success && response.data) {
        const doctors = Array.isArray(response.data)
          ? response.data
          : [response.data];
        setSuggestedDoctors(doctors);
        setShowSuggestions(true);
        toast.success("AI suggestions generated successfully!");
      } else {
        toast.error(response.message || "Failed to get AI suggestions");
      }
    } catch (error) {
      console.error("Error getting AI suggestion:", error);
      toast.error("Failed to get AI suggestion. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-white to-primary/5 border-primary/20 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary rounded-lg">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-primary">AI Doctor Suggestion</CardTitle>
            <CardDescription className="text-primary/80">
              Describe your symptoms and get AI-powered doctor recommendations
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Textarea
            placeholder="Describe your symptoms in detail (e.g., severe headache for 3 days, high fever with chills, persistent cough with chest pain, etc.)..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            rows={4}
            className="resize-none bg-white border-primary/30 focus:border-primary focus:ring-primary/50"
            disabled={isLoading}
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-muted-foreground">
              {symptoms.length} characters
            </p>
            <p className="text-xs text-primary font-medium">
              Minimum 5 characters required
            </p>
          </div>
        </div>

        <Button
          onClick={handleGetSuggestion}
          disabled={isLoading || symptoms.trim().length < 5}
          className="w-full shadow-md"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing symptoms with AI...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Get AI Recommendations
            </>
          )}
        </Button>

        {showSuggestions && suggestedDoctors.length > 0 && (
          <div className="space-y-4 p-4 bg-white rounded-lg border-2 border-primary/20 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/30"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Recommended ({suggestedDoctors.length})
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Based on your symptoms
              </p>
            </div>

            <div className="space-y-3">
              {suggestedDoctors.map((doctor, index) => (
                <div
                  key={doctor.id || index}
                  className="p-4 bg-gradient-to-br from-primary/5 to-white rounded-lg border border-primary/20 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    {/* Doctor Number Badge */}
                    <div className="shrink-0">
                      <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                    </div>

                    {/* Doctor Photo */}
                    <div className="shrink-0">
                      {doctor.profilePhoto ? (
                        <Image
                          src={doctor.profilePhoto}
                          alt={doctor.name}
                          width={64}
                          height={64}
                          className="w-16 h-16 rounded-full object-cover border-2 border-primary/30"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center">
                          <span className="text-xl font-bold text-primary">
                            {doctor.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2) || "DR"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Doctor Info */}
                    <div className="flex-1 space-y-2 min-h-[180px] flex flex-col">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">
                            {doctor.name || "N/A"}
                          </h4>
                          {doctor.averageRating > 0 && (
                            <div className="flex items-center gap-1 text-amber-600">
                              <Star className="h-4 w-4 fill-amber-600" />
                              <span className="text-sm font-medium">
                                {doctor.averageRating.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                        {doctor.designation && (
                          <p className="text-sm text-gray-600">
                            {doctor.designation}
                          </p>
                        )}
                      </div>

                      {/* Specialties - Always show in same spot */}
                      <div className="flex flex-wrap gap-1 min-h-7">
                        {doctor.specialties && doctor.specialties.length > 0 ? (
                          doctor.specialties.map((specialty, idx) => (
                            <Badge
                              key={idx}
                              variant={idx % 2 === 0 ? "default" : "outline"}
                            >
                              <Stethoscope className="h-3 w-3 mr-1" />
                              {specialty}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="secondary">General</Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm flex-1">
                        {doctor.experience > 0 && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <Briefcase className="h-4 w-4 text-purple-600" />
                            <span>{doctor.experience} years exp</span>
                          </div>
                        )}
                        {doctor.qualification && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <Award className="h-4 w-4 text-purple-600" />
                            <span className="truncate">
                              {doctor.qualification}
                            </span>
                          </div>
                        )}
                        {doctor.currentWorkingPlace && (
                          <div className="flex items-center gap-2 text-gray-700 md:col-span-2">
                            <MapPin className="h-4 w-4 text-purple-600" />
                            <span className="truncate">
                              {doctor.currentWorkingPlace}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-primary/20 mt-auto">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-semibold text-green-700">
                            ৳{doctor.appointmentFee}
                          </span>
                          <span className="text-xs text-gray-500">
                            consultation fee
                          </span>
                        </div>
                        <Link href={`/consultation/doctor/${doctor.id}`}>
                          <Button size="sm">
                            <User className="h-3 w-3 mr-1" />
                            View Profile
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-primary/20">
              <p className="text-xs text-center text-muted-foreground">
                ⚠️ AI suggestions are for guidance only. Please consult a
                medical professional for accurate diagnosis.
              </p>
            </div>
          </div>
        )}

        {showSuggestions && suggestedDoctors.length === 0 && (
          <div className="p-6 bg-white rounded-lg border-2 border-amber-200 text-center">
            <p className="text-amber-700 font-medium">
              No doctor recommendations found
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Try describing your symptoms differently or browse all doctors
              below.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

```

## 75-8 Fixing AI Search Issue And Creating Components And Pages For Dashboard

- for chart we will use rechart 

- components -> shared -> AppointmentBarChart.tsx 

```tsx 
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface BarChartData {
  month: Date | string;
  count: number;
}

interface AppointmentBarChartProps {
  data: BarChartData[];
}

export function AppointmentBarChart({ data }: AppointmentBarChartProps) {
  const colors = useMemo(() => {
    // Get computed colors from CSS variables
    if (typeof window === "undefined") {
      return {
        primary: "#3b82f6",
        muted: "#9ca3af",
        border: "#e5e7eb",
        accent: "#f3f4f6",
      };
    }

    const root = document.documentElement;
    const styles = getComputedStyle(root);

    return {
      primary: styles.getPropertyValue("--primary").trim(),
      muted: styles.getPropertyValue("--muted-foreground").trim(),
      border: styles.getPropertyValue("--border").trim(),
      accent: styles.getPropertyValue("--accent").trim(),
    };
  }, []);

  // Format data for recharts
  const formattedData = data.map((item) => ({
    month:
      typeof item.month === "string"
        ? format(new Date(item.month), "MMM yyyy")
        : format(item.month, "MMM yyyy"),
    appointments: Number(item.count),
  }));

  // Handle empty data
  if (formattedData.length === 0) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Appointment Trends</CardTitle>
          <CardDescription>Monthly appointment statistics</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="flex items-center justify-center h-[350px]">
            <p className="text-sm text-muted-foreground">No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Appointment Trends</CardTitle>
        <CardDescription>Monthly appointment statistics</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={formattedData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={colors.border}
              opacity={0.3}
            />
            <XAxis
              dataKey="month"
              stroke={colors.muted}
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke={colors.muted}
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              cursor={{ fill: colors.primary, opacity: 0.1 }}
              contentStyle={{
                backgroundColor: colors.accent,
                border: `1px solid ${colors.border}`,
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              itemStyle={{
                color: colors.muted,
              }}
              labelStyle={{
                fontWeight: 600,
                marginBottom: "4px",
                color: colors.muted,
              }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: "20px",
              }}
            />
            <Bar
              dataKey="appointments"
              fill={colors.primary}
              radius={[8, 8, 0, 0]}
              maxBarSize={60}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

```


- components -> shared -> AppointmentPieChart.tsx 

```tsx 
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useMemo } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface PieChartData {
  status: string;
  count: number;
}

interface AppointmentPieChartProps {
  data: PieChartData[];
  title?: string;
  description?: string;
}

export function AppointmentPieChart({
  data,
  title = "Appointment Status",
  description = "Distribution of appointment statuses",
}: AppointmentPieChartProps) {
  const chartColors = useMemo(() => {
    // Get computed colors from CSS variables and use primary/destructive for better theme alignment
    if (typeof window === "undefined") {
      return {
        scheduled: "#f97316", // Orange - pending
        inprogress: "#14b8a6", // Teal - active
        completed: "#0ea5e9", // Sky blue - success
        canceled: "#eab308", // Yellow - warning
        primary: "#3b82f6", // Blue - default
      };
    }

    const root = document.documentElement;
    const styles = getComputedStyle(root);

    return {
      scheduled:
        styles.getPropertyValue("--chart-5").trim() || "oklch(0.77 0.19 70)", // Orange variant
      inprogress:
        styles.getPropertyValue("--chart-2").trim() || "oklch(0.6 0.12 185)", // Teal
      completed:
        styles.getPropertyValue("--primary").trim() || "oklch(0.55 0.2 250)", // Primary blue
      canceled:
        styles.getPropertyValue("--chart-4").trim() || "oklch(0.83 0.19 84)", // Lime/yellow
      primary:
        styles.getPropertyValue("--chart-1").trim() || "oklch(0.65 0.22 40)", // Orange
    };
  }, []);

  const background = useMemo(() => {
    if (typeof window === "undefined") return "#ffffff";
    const root = document.documentElement;
    const styles = getComputedStyle(root);
    return styles.getPropertyValue("--background").trim();
  }, []);

  const cardBg = useMemo(() => {
    if (typeof window === "undefined") return "#ffffff";
    const root = document.documentElement;
    const styles = getComputedStyle(root);
    return styles.getPropertyValue("--card").trim();
  }, []);

  const borderColor = useMemo(() => {
    if (typeof window === "undefined") return "#e5e7eb";
    const root = document.documentElement;
    const styles = getComputedStyle(root);
    return styles.getPropertyValue("--border").trim();
  }, []);

  const STATUS_COLORS: Record<string, string> = {
    SCHEDULED: "scheduled", // Orange variant - pending appointments
    INPROGRESS: "inprogress", // Teal - active/ongoing
    COMPLETED: "completed", // Primary blue - successfully completed
    CANCELED: "canceled", // Yellow/lime - canceled/warning
    PAID: "completed", // Primary blue - paid (success state)
    UNPAID: "primary", // Orange - unpaid (needs attention)
  };

  // Format data for recharts
  const formattedData = data.map((item) => ({
    name: item.status
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase()),
    value: Number(item.count),
    originalStatus: item.status,
  }));

  const getColor = (index: number, status?: string) => {
    if (status && STATUS_COLORS[status]) {
      return chartColors[STATUS_COLORS[status] as keyof typeof chartColors];
    }
    // Fallback to cycling through colors
    const colorKeys = Object.keys(chartColors);
    return chartColors[
      colorKeys[index % colorKeys.length] as keyof typeof chartColors
    ];
  };

  // Handle empty data
  if (formattedData.length === 0 || formattedData.every((d) => d.value === 0)) {
    return (
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-sm text-muted-foreground">No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={formattedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name}: ${(percent! * 100).toFixed(0)}%`
              }
              outerRadius={80}
              dataKey="value"
              strokeWidth={2}
              stroke={background}
            >
              {formattedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getColor(index, entry.originalStatus)}
                  style={{
                    filter: "drop-shadow(0 1px 2px rgb(0 0 0 / 0.1))",
                  }}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: cardBg,
                border: `1px solid ${borderColor}`,
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: "20px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

```

- components -> shared -> startCard.tsx 

```tsx 
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  iconName: string;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  iconClassName?: string;
}

export function StatsCard({
  title,
  value,
  iconName,
  description,
  trend,
  className,
  iconClassName,
}: StatsCardProps) {
  // Dynamically get the icon component
  const Icon = (Icons as any)[iconName] || Icons.HelpCircle;

  return (
    <Card
      className={cn(
        "hover:shadow-lg transition-all duration-300 hover:scale-105",
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div
          className={cn(
            "h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center transition-colors",
            iconClassName
          )}
        >
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            <span
              className={cn(
                "text-xs font-medium",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}
            >
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </span>
            <span className="text-xs text-muted-foreground">
              from last month
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

```

- patient dashboard page -> page.tsx 

```tsx 
import { AppointmentPieChart } from "@/components/shared/AppointmentPieChart";
import { DashboardSkeleton } from "@/components/shared/DashboardSkeleton";
import { StatsCard } from "@/components/shared/StatCard";
import { getDashboardMetaData } from "@/services/meta/dashboard.service";
import { IPatientDashboardMeta } from "@/types/meta.interface";
import { Suspense } from "react";

// Dynamic SSR with fetch-level caching (30s in service for real-time stats)
export const dynamic = "force-dynamic";

async function PatientDashboardContent() {
  // CRITICAL: Server-side role verification before rendering
  const result = await getDashboardMetaData();

  const data: IPatientDashboardMeta = result.data;

  return (
    <div className="space-y-6">
      {/* Stats Cards Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatsCard
          title="Total Appointments"
          value={data.appointmentCount.toLocaleString()}
          iconName="CalendarDays"
          description="All time appointments"
          iconClassName="bg-blue-100"
        />
        <StatsCard
          title="Total Prescriptions"
          value={data.prescriptionCount.toLocaleString()}
          iconName="FileText"
          description="Medical prescriptions"
          iconClassName="bg-purple-100"
        />
        <StatsCard
          title="Total Reviews"
          value={data.reviewCount.toLocaleString()}
          iconName="Star"
          description="Reviews given"
          iconClassName="bg-yellow-100"
        />
      </div>

      {/* Appointment Status Chart */}
      <div className="grid gap-4">
        <AppointmentPieChart
          data={data.formattedAppointmentStatusDistribution}
          title="Appointment Status Distribution"
          description="Overview of your appointment statuses"
        />
      </div>
    </div>
  );
}

const PatientDashboardPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your health records and appointment history
        </p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <PatientDashboardContent />
      </Suspense>
    </div>
  );
};

export default PatientDashboardPage;

```

## 75-9 Creating Components And Pages For Change Password And Forgot Password And Optimizing Proxy FIle For Reset Password

- common protected layout -> change password -> page.tsx 

```tsx 
import ChangePasswordForm from "@/components/ChangePasswordForm";

// Dynamic SSR - authenticated page
export const dynamic = "force-dynamic";

const ChangePasswordPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Change Password</h1>
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border bg-card p-6">
          <p className="mb-6 text-sm text-muted-foreground">
            Update your password to keep your account secure. Make sure your new
            password is strong and unique.
          </p>
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;

```


- components -> changePasswordForm.tsx 

```tsx
"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePassword } from "@/services/auth/auth.service";
import { CheckCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { useActionState, useState } from "react";

const ChangePasswordForm = () => {
  const [state, formAction, isPending] = useActionState(changePassword, null);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-6">
      {state?.success && (
        <Alert className="border-green-500 bg-green-50 text-green-900">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      {state?.success === false && (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <Field>
        <Label htmlFor="oldPassword">Current Password</Label>
        <div className="relative">
          <Input
            id="oldPassword"
            name="oldPassword"
            type={showOldPassword ? "text" : "password"}
            placeholder="Enter your current password"
            defaultValue={state?.formData?.oldPassword || ""}
            required
            disabled={isPending}
          />
          <Button
            variant="ghost"
            onClick={() => setShowOldPassword(!showOldPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            {showOldPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        {state?.errors?.find((e) => e.field === "oldPassword") && (
          <p className="text-sm text-red-500">
            {state.errors.find((e) => e.field === "oldPassword")?.message}
          </p>
        )}
      </Field>

      <Field>
        <Label htmlFor="newPassword">New Password</Label>
        <div className="relative">
          <Input
            id="newPassword"
            name="newPassword"
            type={showNewPassword ? "text" : "password"}
            placeholder="Enter your new password"
            defaultValue={state?.formData?.newPassword || ""}
            required
            disabled={isPending}
          />
          <Button
            variant="ghost"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            {showNewPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        {state?.errors?.find((e) => e.field === "newPassword") && (
          <p className="text-sm text-red-500">
            {state.errors.find((e) => e.field === "newPassword")?.message}
          </p>
        )}
      </Field>

      <Field>
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your new password"
            defaultValue={state?.formData?.confirmPassword || ""}
            required
            disabled={isPending}
          />
          <Button
            variant="ghost"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        {state?.errors?.find((e) => e.field === "confirmPassword") && (
          <p className="text-sm text-red-500">
            {state.errors.find((e) => e.field === "confirmPassword")?.message}
          </p>
        )}
      </Field>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Changing Password...
          </>
        ) : (
          "Change Password"
        )}
      </Button>
    </form>
  );
};

export default ChangePasswordForm;

```

- components -> forgotPasswordForm.tsx 

```tsx
"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPassword } from "@/services/auth/auth.service";
import { CheckCircle, Loader2, Mail } from "lucide-react";
import { useActionState } from "react";

const ForgotPasswordForm = () => {
  const [state, formAction, isPending] = useActionState(forgotPassword, null);

  return (
    <form action={formAction} className="space-y-6">
      {state?.success && (
        <Alert className="border-green-500 bg-green-50 text-green-900">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      {state?.success === false && (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <Field>
        <Label htmlFor="email">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            className="pl-10"
            defaultValue={state?.formData?.email || ""}
            required
            disabled={isPending}
          />
        </div>
        {state?.errors?.find((e) => e.field === "email") && (
          <p className="text-sm text-red-500">
            {state.errors.find((e) => e.field === "email")?.message}
          </p>
        )}
      </Field>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending Reset Link...
          </>
        ) : (
          "Send Reset Link"
        )}
      </Button>
    </form>
  );
};

export default ForgotPasswordForm;

```

- commonLayout -> auth -> forgotPassword -> page.tsx 

```tsx 
import ForgotPasswordForm from "@/components/ForgotPasswordForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

interface ForgotPasswordPageProps {
  searchParams: Promise<{ error?: string }>;
}

const ForgotPasswordPage = async ({
  searchParams,
}: ForgotPasswordPageProps) => {
  const params = await searchParams;
  const error = params.error;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Forgot Password</CardTitle>
          <CardDescription>
            Enter your email address and we&apos;ll send you a link to reset
            your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error === "invalid-link" && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Invalid password reset link. The email or token does not match.
              </AlertDescription>
            </Alert>
          )}
          {error === "expired-link" && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your password reset link has expired. Please request a new one.
              </AlertDescription>
            </Alert>
          )}
          <ForgotPasswordForm />
          <div className="mt-4 text-center text-sm">
            Remember your password?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;

```

- update proxy file for the conditional password reset

```tsx 
import jwt, { JwtPayload } from 'jsonwebtoken';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getDefaultDashboardRoute, getRouteOwner, isAuthRoute, UserRole } from './lib/auth-utils';
import { verifyResetPasswordToken } from './lib/jwtHanlders';
import { getNewAccessToken } from './services/auth/auth.service';
import { getUserInfo } from './services/auth/getUserInfo';
import { deleteCookie, getCookie } from './services/auth/tokenHandlers';



// This function can be marked `async` if using `await` inside
export async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;
    const hasTokenRefreshedParam = request.nextUrl.searchParams.has('tokenRefreshed');

    // If coming back after token refresh, remove the param and continue
    if (hasTokenRefreshedParam) {
        const url = request.nextUrl.clone();
        url.searchParams.delete('tokenRefreshed');
        return NextResponse.redirect(url);
    }

    const tokenRefreshResult = await getNewAccessToken();

    // If token was refreshed, redirect to same page to fetch with new token
    if (tokenRefreshResult?.tokenRefreshed) {
        const url = request.nextUrl.clone();
        url.searchParams.set('tokenRefreshed', 'true');
        return NextResponse.redirect(url);
    }

    // const accessToken = request.cookies.get("accessToken")?.value || null;

    const accessToken = await getCookie("accessToken") || null;

    let userRole: UserRole | null = null;
    if (accessToken) {
        const verifiedToken: JwtPayload | string = jwt.verify(accessToken, process.env.JWT_SECRET as string);

        if (typeof verifiedToken === "string") {
            await deleteCookie("accessToken");
            await deleteCookie("refreshToken");
            return NextResponse.redirect(new URL('/login', request.url));
        }

        userRole = verifiedToken.role;
    }

    const routerOwner = getRouteOwner(pathname);
    //path = /doctor/appointments => "DOCTOR"
    //path = /my-profile => "COMMON"
    //path = /login => null

    const isAuth = isAuthRoute(pathname)

    // Rule 1 : User is logged in and trying to access auth route. Redirect to default dashboard
    if (accessToken && isAuth) {
        return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole as UserRole), request.url))
    }

    // Rule 2: Handle /reset-password route BEFORE checking authentication
    // This route has two valid cases:
    // 1. User coming from email reset link (has email + token in query params)
    // 2. Authenticated user with needPasswordChange=true
    if (pathname === "/reset-password") {
        const email = request.nextUrl.searchParams.get("email");
        const token = request.nextUrl.searchParams.get("token");

        // Case 1: User has needPasswordChange (newly created admin/doctor)
        if (accessToken) {
            const userInfo = await getUserInfo();
            if (userInfo.needPasswordChange) {
                return NextResponse.next();
            }

            // User doesn't need password change and no valid token, redirect to dashboard
            return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole as UserRole), request.url));
        }

        // Case 2: Coming from email reset link (has email and token)
        if (email && token) {
            try {
                // Verify the token
                const verifiedToken = await verifyResetPasswordToken(token);

                if (!verifiedToken.success) {
                    return NextResponse.redirect(new URL('/forgot-password?error=expired-link', request.url));
                }

                // Verify email matches token
                if (verifiedToken.success && verifiedToken.payload!.email !== email) {
                    return NextResponse.redirect(new URL('/forgot-password?error=invalid-link', request.url));
                }

                // Token and email are valid, allow access without authentication
                return NextResponse.next();
            } catch {
                // Token is invalid or expired
                return NextResponse.redirect(new URL('/forgot-password?error=expired-link', request.url));
            }
        }



        // No access token and no valid reset token, redirect to login
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }



    // Rule 3 : User is trying to access open public route
    if (routerOwner === null) {
        return NextResponse.next();
    }

    // Rule 1 & 2 for open public routes and auth routes

    if (!accessToken) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Rule 4 : User need password change
    if (accessToken) {
        const userInfo = await getUserInfo();
        if (userInfo.needPasswordChange) {
            if (pathname !== "/reset-password") {
                const resetPasswordUrl = new URL("/reset-password", request.url);
                resetPasswordUrl.searchParams.set("redirect", pathname);
                return NextResponse.redirect(resetPasswordUrl);
            }
            return NextResponse.next();
        }

        if (userInfo && !userInfo.needPasswordChange && pathname === '/reset-password') {
            return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole as UserRole), request.url));
        }
    }

    // Rule 5 : User is trying to access common protected route
    if (routerOwner === "COMMON") {
        return NextResponse.next();
    }

    // Rule 6 : User is trying to access role based protected route
    if (routerOwner === "ADMIN" || routerOwner === "DOCTOR" || routerOwner === "PATIENT") {
        if (userRole !== routerOwner) {
            return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole as UserRole), request.url))
        }
    }

    return NextResponse.next();
}



export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.well-known).*)',
    ],
}
```
## 75-10 Fixing Reset Password Issue For Email Reset And New User Reset

## 75-11 Fixing Form Dialogs Infinity Loop Issue And Creating Public Pages

## 75-12 Adding Loaders, Skeleton And Polishing In Dashboard Pages

## 75-13 Creating Production Build For Deploying Frontend

## 75-14 Module Wrap Up
