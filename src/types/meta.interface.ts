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

export type IDashboardMeta = IAdminDashboardMeta | IDoctorDashboardMeta | IPatientDashboardMeta;
