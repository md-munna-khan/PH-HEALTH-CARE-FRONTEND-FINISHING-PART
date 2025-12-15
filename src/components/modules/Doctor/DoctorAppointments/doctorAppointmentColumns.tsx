/* eslint-disable @typescript-eslint/no-explicit-any */
import { Column } from "@/components/shared/ManagementTable";
import { Badge } from "@/components/ui/badge";
import {
  AppointmentStatus,
  IAppointment,
} from "@/types/appointments.interface";
import { format } from "date-fns";
import AppointmentCountdown from "../../Patient/PatientAppointment/AppointmentCountdown";

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

export const doctorAppointmentColumns: Column<IAppointment>[] = [
  {
    header: "Patient",
    accessor: (appointment) => (
      <div className="flex items-center gap-2">
        <div>
          <p className="font-medium">{appointment.patient?.name || "N/A"}</p>
          <p className="text-xs text-muted-foreground">
            {appointment.patient?.email || ""}
          </p>
        </div>
      </div>
    ),
  },
  {
    header: "Date & Time",
    accessor: (appointment) => {
      if (!appointment.schedule?.startDateTime) return "N/A";
      return (
        <div className="text-sm space-y-1">
          <p className="font-medium">
            {format(
              new Date(appointment.schedule.startDateTime),
              "MMM d, yyyy"
            )}
          </p>
          <p className="text-muted-foreground">
            {format(new Date(appointment.schedule.startDateTime), "h:mm a")} -{" "}
            {format(new Date(appointment.schedule.endDateTime), "h:mm a")}
          </p>
          {appointment.status === AppointmentStatus.SCHEDULED &&
            appointment.schedule.startDateTime && (
              <div className="pt-1">
                <AppointmentCountdown
                  appointmentDateTime={appointment.schedule.startDateTime}
                  className="text-xs"
                />
              </div>
            )}
        </div>
      );
    },
    sortKey: "schedule.startDateTime",
  },
  {
    header: "Status",
    accessor: (appointment) => {
      const config = statusConfig[appointment.status];
      return (
        <Badge variant={config.variant} className={config.className}>
          {config.label}
        </Badge>
      );
    },
  },
  {
    header: "Payment",
    accessor: (appointment) => {
      const isPaid = appointment.paymentStatus === "PAID";
      return (
        <Badge
          variant={isPaid ? "default" : "secondary"}
          className={isPaid ? "bg-green-500" : ""}
        >
          {isPaid ? "Paid" : "Unpaid"}
        </Badge>
      );
    },
  },
  {
    header: "Prescription",
    accessor: (appointment) => {
      return appointment.prescription ? (
        <Badge variant="outline" className="bg-green-50 text-green-700">
          Provided
        </Badge>
      ) : appointment.status === AppointmentStatus.COMPLETED ? (
        <Badge variant="outline" className="bg-amber-50 text-amber-700">
          Pending
        </Badge>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  },
];
