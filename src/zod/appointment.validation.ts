import z from "zod";

export const createAppointmentSchema = z.object({
    doctorId: z.uuid(),
    scheduleId: z.uuid(),
});