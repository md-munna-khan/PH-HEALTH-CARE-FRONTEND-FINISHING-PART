"use client";

import { Column } from "@/components/shared/ManagementTable";
import { Badge } from "@/components/ui/badge";
import {
  AppointmentStatus,
  IAppointment,
  PaymentStatus,
} from "@/types/appointments.interface";

export const appointmentsColumns: Column<IAppointment>[] = [
  {
    header: "Patient",
    accessor: (appointment) => {
      const patient = appointment.patient;
      return (
        <div>
          <div className="font-medium">{patient?.name || "N/A"}</div>
          <div className="text-sm text-muted-foreground">
            {patient?.email || ""}
          </div>
        </div>
      );
    },
  },
  {
    header: "Doctor",
    accessor: (appointment) => {
      const doctor = appointment.doctor;
      return (
        <div>
          <div className="font-medium">{doctor?.name || "N/A"}</div>
          <div className="text-sm text-muted-foreground">
            {doctor?.email || ""}
          </div>
        </div>
      );
    },
  },
  {
    header: "Schedule",
    accessor: (appointment) => {
      const schedule = appointment.schedule;
      if (!schedule) return "N/A";

      const startDate = new Date(schedule.startDateTime);
      const endDate = new Date(schedule.endDateTime);

      return (
        <div>
          <div className="font-medium">
            {startDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
          <div className="text-sm text-muted-foreground">
            {startDate.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            -{" "}
            {endDate.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      );
    },
  },
  {
    header: "Status",
    accessor: (appointment) => {
      const status = appointment.status;

      if (status === AppointmentStatus.SCHEDULED) {
        return <Badge variant="default">Scheduled</Badge>;
      }
      if (status === AppointmentStatus.INPROGRESS) {
        return <Badge variant="secondary">In Progress</Badge>;
      }
      if (status === AppointmentStatus.COMPLETED) {
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            Completed
          </Badge>
        );
      }
      return <Badge variant="destructive">Canceled</Badge>;
    },
  },
  {
    header: "Payment",
    accessor: (appointment) => {
      const paymentStatus = appointment.paymentStatus;

      if (paymentStatus === PaymentStatus.PAID) {
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            Paid
          </Badge>
        );
      }
      return <Badge variant="destructive">Unpaid</Badge>;
    },
  },
  {
    header: "Video Call",
    accessor: (appointment) => {
      const videoCallingId = appointment.videoCallingId;
      return videoCallingId ? (
        <span className="text-sm font-mono">{videoCallingId}</span>
      ) : (
        <span className="text-sm text-muted-foreground">Not set</span>
      );
    },
  },
  {
    header: "Created",
    accessor: (appointment) => {
      const date = new Date(appointment.createdAt!);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    },
  },
];
