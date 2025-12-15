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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { changeAppointmentStatus } from "@/services/admin/appoitmentsManagement";
import {
  AppointmentStatus,
  IAppointment,
} from "@/types/appointments.interface";
import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

interface ChangeAppointmentStatusDialogProps {
  open: boolean;
  onClose: () => void;
  appointment: IAppointment | null;
  onSuccess: () => void;
}

const ChangeAppointmentStatusDialog = ({
  open,
  onClose,
  appointment,
  onSuccess,
}: ChangeAppointmentStatusDialogProps) => {
  // Initialize state based on the appointment prop
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus>(
    appointment?.status || AppointmentStatus.SCHEDULED
  );
  const [isPending, startTransition] = useTransition();

  // Reset status when dialog opens with different appointment
  if (appointment && open && selectedStatus !== appointment.status) {
    setSelectedStatus(appointment.status);
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!appointment) return;

    startTransition(async () => {
      const result = await changeAppointmentStatus(
        appointment.id!,
        selectedStatus
      );

      if (result?.success) {
        toast.success("Appointment status updated successfully!");
        onSuccess();
      } else {
        toast.error(result?.message || "Failed to update status");
      }
    });
  };

  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Appointment Status</DialogTitle>
          <DialogDescription>
            Update the status for this appointment
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Current Appointment Info */}
            <div className="rounded-lg border p-3 space-y-1">
              <div className="text-sm text-muted-foreground">Patient</div>
              <div className="font-medium">{appointment.patient?.name}</div>
              <div className="text-sm text-muted-foreground">Doctor</div>
              <div className="font-medium">{appointment.doctor?.name}</div>
              <div className="text-sm text-muted-foreground mt-2">
                Current Status:{" "}
                <span className="font-medium">{appointment.status}</span>
              </div>
            </div>

            {/* Status Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">New Status</label>
              <Select
                value={selectedStatus}
                onValueChange={(value) =>
                  setSelectedStatus(value as AppointmentStatus)
                }
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AppointmentStatus.SCHEDULED}>
                    Scheduled
                  </SelectItem>
                  <SelectItem value={AppointmentStatus.INPROGRESS}>
                    In Progress
                  </SelectItem>
                  <SelectItem value={AppointmentStatus.COMPLETED}>
                    Completed
                  </SelectItem>
                  <SelectItem value={AppointmentStatus.CANCELED}>
                    Canceled
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Status
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeAppointmentStatusDialog;
