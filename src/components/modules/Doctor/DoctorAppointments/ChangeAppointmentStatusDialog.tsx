"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { changeAppointmentStatus } from "@/services/patient/appointment.service";
import {
  AppointmentStatus,
  IAppointment,
} from "@/types/appointments.interface";
import { AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ChangeStatusDialogProps {
  appointment: IAppointment;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangeAppointmentStatusDialog({
  appointment,
  isOpen,
  onClose,
}: ChangeStatusDialogProps) {
  const [newStatus, setNewStatus] = useState<AppointmentStatus>(
    appointment.status
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const statusOptions = [
    { value: AppointmentStatus.SCHEDULED, label: "Scheduled" },
    { value: AppointmentStatus.INPROGRESS, label: "In Progress" },
    { value: AppointmentStatus.COMPLETED, label: "Completed" },
    { value: AppointmentStatus.CANCELED, label: "Canceled" },
  ];

  const handleSubmit = async () => {
    if (newStatus === appointment.status) {
      toast.info("No changes made");
      onClose();
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await changeAppointmentStatus(appointment.id, newStatus);

      if (result.success) {
        toast.success("Appointment status updated successfully");

        // Show prescription reminder if completed
        if (
          newStatus === AppointmentStatus.COMPLETED &&
          !appointment.prescription
        ) {
          setTimeout(() => {
            toast.info(
              "Don't forget to provide a prescription for this patient",
              {
                duration: 5000,
              }
            );
          }, 1000);
        }

        onClose();
      } else {
        toast.error(result.message || "Failed to update status");
      }
    } catch (error) {
      toast.error("An error occurred while updating status");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Change Appointment Status</DialogTitle>
          <DialogDescription>
            Update the status for {appointment.patient?.name}&apos;s appointment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Status */}
          <div className="space-y-2">
            <Label>Current Status</Label>
            <div className="text-sm font-medium">
              {
                statusOptions.find((opt) => opt.value === appointment.status)
                  ?.label
              }
            </div>
          </div>

          {/* New Status */}
          <div className="space-y-2">
            <Label htmlFor="status">New Status</Label>
            <Select
              value={newStatus}
              onValueChange={(value) =>
                setNewStatus(value as AppointmentStatus)
              }
              disabled={isSubmitting}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Warning for Completion */}
          {newStatus === AppointmentStatus.COMPLETED &&
            !appointment.prescription && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <strong>Reminder:</strong> After marking as completed,
                    please provide a prescription for this patient.
                  </div>
                </div>
              </div>
            )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Confirm Change"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
