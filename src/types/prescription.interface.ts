import { IAppointment } from "./appointments.interface";
import { IDoctor } from "./doctor.interface";
import { IPatient } from "./patient.interface";

export interface IPrescription {
    id: string;
    appointmentId: string;
    appointment?: IAppointment;
    doctorId: string;
    doctor?: IDoctor;
    patientId: string;
    patient?: IPatient;
    instructions: string;
    followUpDate?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface IPrescriptionFormData {
    appointmentId: string;
    instructions: string;
    followUpDate?: string;
}