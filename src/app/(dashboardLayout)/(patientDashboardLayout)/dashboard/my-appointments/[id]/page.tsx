import AppointmentDetails from "@/components/modules/Patient/PatientAppointment/AppointmentDetails";
import { getAppointmentById } from "@/services/patient/appointment.service";
import { IAppointment } from "@/types/appointments.interface";
import { notFound } from "next/navigation";

interface AppointmentDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AppointmentDetailPage({
  params,
}: AppointmentDetailPageProps) {
  const { id } = await params;

  const response = await getAppointmentById(id);

  if (!response?.success || !response?.data) {
    notFound();
  }

  const appointment: IAppointment = response.data;

  return (
    <div className="container mx-auto px-4 py-8">
      <AppointmentDetails appointment={appointment} />
    </div>
  );
}
