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