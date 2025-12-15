export interface ISchedule {
    id: string;
    startDateTime: string;
    endDateTime: string;
    createdAt: string;
    updatedAt: string;
}

export interface IScheduleFormData {
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
}

export interface IDoctorSchedule {
    scheduleId: string;
    doctorId: string;
    isBooked: boolean;
    appointmentId?: string;
    createdAt: string;
    updatedAt: string;
    schedule?: ISchedule;
}

