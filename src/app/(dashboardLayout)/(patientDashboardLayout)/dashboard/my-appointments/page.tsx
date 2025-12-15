import AppointmentsList from "@/components/modules/Patient/PatientAppointment/AppointmentsList";
import { getMyAppointments } from "@/services/patient/appointment.service";
import { IAppointment } from "@/types/appointments.interface";

export default async function MyAppointmentsPage() {
  const response = await getMyAppointments();
  const appointments: IAppointment[] = response?.data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Appointments</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your scheduled appointments
        </p>
      </div>

      <AppointmentsList appointments={appointments} />
    </div>
  );
}
