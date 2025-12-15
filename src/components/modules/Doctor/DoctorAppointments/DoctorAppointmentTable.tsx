"use client";

import ManagementTable from "@/components/shared/ManagementTable";
import {
  AppointmentStatus,
  IAppointment,
} from "@/types/appointments.interface";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import ChangeAppointmentStatusDialog from "./ChangeAppointmentStatusDialog";
import { doctorAppointmentColumns } from "./doctorAppointmentColumns";
import DoctorAppointmentDetailDialog from "./DoctorAppointmentDetailDialog";

interface DoctorAppointmentsTableProps {
  appointments: IAppointment[];
}

export default function DoctorAppointmentsTable({
  appointments = [],
}: DoctorAppointmentsTableProps) {
  const router = useRouter();
  const [viewingAppointment, setViewingAppointment] =
    useState<IAppointment | null>(null);
  const [changingStatusAppointment, setChangingStatusAppointment] =
    useState<IAppointment | null>(null);

  const handleView = (appointment: IAppointment) => {
    setViewingAppointment(appointment);
  };

  const handleStatusChange = (appointment: IAppointment) => {
    setChangingStatusAppointment(appointment);
  };

  // Custom wrapper to conditionally show edit action
  const handleEditClick = (appointment: IAppointment) => {
    // Cannot change status for:
    // 1. Canceled appointments
    // 2. Completed appointments with prescriptions
    if (appointment.status === AppointmentStatus.CANCELED) {
      toast.error("Cannot change status for canceled appointments", {
        description: "Canceled appointments are final and cannot be modified.",
      });
      return;
    }

    if (
      appointment.status === AppointmentStatus.COMPLETED &&
      !!appointment.prescription
    ) {
      toast.error("Cannot change status once prescription is provided", {
        description:
          "Appointment status is locked after prescription is created to maintain medical record integrity.",
      });
      return;
    }

    handleStatusChange(appointment);
  };

  return (
    <>
      <ManagementTable
        data={appointments}
        columns={doctorAppointmentColumns}
        onView={handleView}
        onEdit={handleEditClick}
        getRowKey={(appointment) => appointment.id}
        emptyMessage="No appointments found"
      />

      {/* View Detail Dialog */}
      {viewingAppointment && (
        <DoctorAppointmentDetailDialog
          appointment={viewingAppointment}
          open={!!viewingAppointment}
          onClose={() => {
            // Clear the state first to prevent showing stale data
            const shouldRefresh = true;
            setViewingAppointment(null);
            // Then refresh to get updated data from server
            if (shouldRefresh) {
              router.refresh();
            }
          }}
        />
      )}

      {/* Change Status Dialog */}
      {changingStatusAppointment && (
        <ChangeAppointmentStatusDialog
          appointment={changingStatusAppointment}
          isOpen={!!changingStatusAppointment}
          onClose={() => {
            setChangingStatusAppointment(null);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
