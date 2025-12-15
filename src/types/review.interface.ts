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