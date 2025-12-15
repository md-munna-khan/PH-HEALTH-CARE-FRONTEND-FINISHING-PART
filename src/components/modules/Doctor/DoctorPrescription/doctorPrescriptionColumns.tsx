"use client";
import { Column } from "@/components/shared/ManagementTable";
import { Badge } from "@/components/ui/badge";
import { IPrescription } from "@/types/prescription.interface";
import { format } from "date-fns";

export const doctorPrescriptionColumns: Column<IPrescription>[] = [
  {
    header: "Patient",
    accessor: (prescription: IPrescription) => (
      <div>
        <p className="font-medium">{prescription.patient?.name || "N/A"}</p>
        <p className="text-sm text-muted-foreground">
          {prescription.patient?.email || "N/A"}
        </p>
      </div>
    ),
  },
  {
    header: "Appointment Date",
    accessor: (prescription: IPrescription) =>
      prescription.appointment?.schedule?.startDateTime
        ? format(
            new Date(prescription.appointment.schedule.startDateTime),
            "PPP"
          )
        : "N/A",
  },
  {
    header: "Follow-up Date",
    accessor: (prescription: IPrescription) =>
      prescription.followUpDate ? (
        <Badge variant="outline" className="border-blue-500 text-blue-700">
          {format(new Date(prescription.followUpDate), "PPP")}
        </Badge>
      ) : (
        <span className="text-muted-foreground text-sm">-</span>
      ),
  },
  {
    header: "Created At",
    accessor: (prescription) => format(new Date(prescription.createdAt), "PPP"),
    sortKey: "createdAt",
  },
];
