"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { IPrescription } from "@/types/prescription.interface";
import { format } from "date-fns";
import { Calendar, Clock, FileText, User } from "lucide-react";

interface PatientPrescriptionsListProps {
  prescriptions: IPrescription[];
}

export default function PatientPrescriptionsList({
  prescriptions = [],
}: PatientPrescriptionsListProps) {
  // Sort prescriptions by creation date (latest first)
  const sortedPrescriptions = [...prescriptions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (prescriptions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Prescriptions Yet</h3>
        <p className="text-muted-foreground">
          Your prescriptions will appear here after your appointments are
          completed.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {sortedPrescriptions.map((prescription) => (
        <Card
          key={prescription.id}
          className="p-6 hover:shadow-lg transition-shadow"
        >
          {/* Doctor Information */}
          <div className="flex items-start gap-3 mb-4 pb-4 border-b">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">
                {prescription.doctor?.name || "N/A"}
              </h3>
              <p className="text-sm text-muted-foreground truncate">
                {prescription.doctor?.email || "N/A"}
              </p>
              {prescription.doctor?.designation && (
                <p className="text-xs text-muted-foreground mt-1">
                  {prescription.doctor.designation}
                </p>
              )}
            </div>
          </div>

          {/* Appointment Date */}
          {prescription.appointment?.schedule?.startDateTime && (
            <div className="flex items-center gap-2 mb-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Appointment:</span>
              <span className="font-medium">
                {format(
                  new Date(prescription.appointment.schedule.startDateTime),
                  "PPP"
                )}
              </span>
            </div>
          )}

          {/* Instructions Preview */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Instructions</span>
            </div>
            <div className="bg-muted/50 p-3 rounded-md">
              <p className="text-sm text-muted-foreground line-clamp-3">
                {prescription.instructions}
              </p>
            </div>
          </div>

          {/* Follow-up Date */}
          {prescription.followUpDate && (
            <div className="mb-4">
              <Badge
                variant="outline"
                className="border-blue-500 text-blue-700 bg-blue-50"
              >
                <Calendar className="h-3 w-3 mr-1" />
                Follow-up: {format(new Date(prescription.followUpDate), "PPP")}
              </Badge>
            </div>
          )}

          {/* Prescribed Date */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-3 border-t">
            <Clock className="h-3 w-3" />
            <span>
              Prescribed on {format(new Date(prescription.createdAt), "PPP")}
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}
