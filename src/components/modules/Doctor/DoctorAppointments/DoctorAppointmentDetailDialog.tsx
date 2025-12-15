"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createPrescription } from "@/services/patient/prescription.service";
import { IAppointment } from "@/types/appointments.interface";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import AppointmentCountdown from "../../Patient/PatientAppointment/AppointmentCountdown";

interface DoctorAppointmentDetailDialogProps {
  appointment: IAppointment | null;
  open: boolean;
  onClose: () => void;
}

export default function DoctorAppointmentDetailDialog({
  appointment,
  open,
  onClose,
}: DoctorAppointmentDetailDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [instructions, setInstructions] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");

  if (!appointment) return null;

  const { patient, schedule, status, paymentStatus, prescription } =
    appointment;

  const isCompleted = status === "COMPLETED";
  const hasPrescription = !!prescription;
  const canWritePrescription = isCompleted && !hasPrescription;

  const handleSubmitPrescription = async () => {
    if (!instructions.trim()) {
      toast.error("Please provide prescription instructions");
      return;
    }

    if (instructions.trim().length < 20) {
      toast.error(
        "Instructions must be at least 20 characters long for clarity"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const prescriptionData: {
        appointmentId: string;
        instructions: string;
        followUpDate?: string;
      } = {
        appointmentId: appointment.id,
        instructions: instructions.trim(),
      };

      if (followUpDate) {
        // Convert to ISO-8601 DateTime format
        prescriptionData.followUpDate = new Date(followUpDate).toISOString();
      }

      const result = await createPrescription(prescriptionData);

      if (result.success) {
        toast.success("Prescription created successfully");
        setInstructions("");
        setFollowUpDate("");
        // Close dialog first, then refresh will update the data
        setTimeout(() => {
          onClose();
        }, 100);
      } else {
        toast.error(result.message || "Failed to create prescription");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error creating prescription:", error);
      toast.error("An error occurred while creating prescription");
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setInstructions("");
    setFollowUpDate("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="min-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Appointment Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Patient Information */}
          <div className="border rounded-lg p-4 bg-muted/50">
            <h3 className="font-semibold text-lg mb-3">Patient Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Name</p>
                <p className="font-medium">{patient?.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{patient?.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Contact Number</p>
                <p className="font-medium">
                  {patient?.contactNumber || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Address</p>
                <p className="font-medium">
                  {patient?.address || "Not provided"}
                </p>
              </div>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3">Appointment Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Schedule Date</p>
                <p className="font-medium">
                  {schedule?.startDateTime
                    ? format(new Date(schedule.startDateTime), "PPP")
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Time</p>
                <p className="font-medium">
                  {schedule?.startDateTime && schedule?.endDateTime
                    ? `${format(
                        new Date(schedule.startDateTime),
                        "p"
                      )} - ${format(new Date(schedule.endDateTime), "p")}`
                    : "N/A"}
                </p>
              </div>
              {status === "SCHEDULED" && schedule?.startDateTime && (
                <div className="col-span-2 pt-2 border-t">
                  <p className="text-muted-foreground mb-2">
                    Time Until Appointment
                  </p>
                  <AppointmentCountdown
                    appointmentDateTime={schedule.startDateTime}
                  />
                </div>
              )}
              <div>
                <p className="text-muted-foreground">Status</p>
                <div>
                  <Badge
                    variant="outline"
                    className={
                      status === "COMPLETED"
                        ? "border-green-500 text-green-700 bg-green-50"
                        : status === "INPROGRESS"
                        ? "border-blue-500 text-blue-700 bg-blue-50"
                        : status === "SCHEDULED"
                        ? "border-purple-500 text-purple-700 bg-purple-50"
                        : "border-red-500 text-red-700 bg-red-50"
                    }
                  >
                    {status}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground">Payment</p>
                <div>
                  <Badge
                    variant={
                      paymentStatus === "PAID" ? "default" : "destructive"
                    }
                  >
                    {paymentStatus}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Prescription Section */}
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3">Prescription</h3>

            {status === "CANCELED" && (
              <div className="text-sm text-muted-foreground p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800">
                  ⚠️ This appointment has been canceled. No prescription can be
                  provided.
                </p>
              </div>
            )}

            {!isCompleted && status !== "CANCELED" && (
              <div className="text-sm text-muted-foreground p-4 bg-muted/50 rounded-md">
                <p>
                  You can write a prescription once the appointment is marked as{" "}
                  <span className="font-semibold text-green-700">
                    COMPLETED
                  </span>
                  .
                </p>
              </div>
            )}

            {canWritePrescription && (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
                  <p className="text-sm text-amber-800">
                    ⚠️ Once created, prescriptions cannot be edited or deleted.
                    Please ensure all information is correct.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions">
                    Instructions <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="instructions"
                    placeholder="Enter prescription instructions (minimum 20 characters)..."
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    {instructions.length} / 20 characters minimum
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="followUpDate">
                    Follow-up Date & Time (Optional)
                  </Label>
                  <Input
                    id="followUpDate"
                    type="datetime-local"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>

                <Button
                  onClick={handleSubmitPrescription}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting
                    ? "Creating Prescription..."
                    : "Create Prescription"}
                </Button>
              </div>
            )}

            {hasPrescription && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
                  <p className="text-sm text-green-800">
                    ✓ Prescription has been provided for this appointment
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    Note: Appointment status cannot be changed once prescription
                    is provided
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Instructions
                    </p>
                    <div className="bg-muted/50 p-3 rounded-md">
                      <p className="text-sm whitespace-pre-wrap">
                        {prescription.instructions}
                      </p>
                    </div>
                  </div>

                  {prescription.followUpDate && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Follow-up Date
                      </p>
                      <p className="text-sm font-medium">
                        {format(new Date(prescription.followUpDate), "PPP")}
                      </p>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground italic pt-2 border-t">
                    Note: Prescriptions cannot be edited or deleted once created
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
