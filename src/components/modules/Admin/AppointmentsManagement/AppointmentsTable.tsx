"use client";

import ManagementTable from "@/components/shared/ManagementTable";
import { IAppointment } from "@/types/appointments.interface";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { appointmentsColumns } from "./appointmentsColumns";
import AppointmentViewDetailDialog from "./AppointmentViewDetailDialog";
import ChangeAppointmentStatusDialog from "./ChangeAppointmentStatusDialog";

interface AppointmentsTableProps {
  appointments: IAppointment[];
}

const AppointmentsTable = ({ appointments }: AppointmentsTableProps) => {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [viewingAppointment, setViewingAppointment] =
    useState<IAppointment | null>(null);
  const [changingStatusAppointment, setChangingStatusAppointment] =
    useState<IAppointment | null>(null);

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const handleView = (appointment: IAppointment) => {
    setViewingAppointment(appointment);
  };

  const handleEdit = (appointment: IAppointment) => {
    setChangingStatusAppointment(appointment);
  };

  return (
    <>
      <ManagementTable
        data={appointments}
        columns={appointmentsColumns}
        onView={handleView}
        onEdit={handleEdit}
        getRowKey={(appointment) => appointment.id!}
        emptyMessage="No appointments found"
      />

      {/* View Appointment Detail Dialog */}
      <AppointmentViewDetailDialog
        open={!!viewingAppointment}
        onClose={() => setViewingAppointment(null)}
        appointment={viewingAppointment}
      />

      {/* Change Status Dialog */}
      <ChangeAppointmentStatusDialog
        open={!!changingStatusAppointment}
        onClose={() => setChangingStatusAppointment(null)}
        appointment={changingStatusAppointment}
        onSuccess={() => {
          setChangingStatusAppointment(null);
          handleRefresh();
        }}
      />
    </>
  );
};

export default AppointmentsTable;
