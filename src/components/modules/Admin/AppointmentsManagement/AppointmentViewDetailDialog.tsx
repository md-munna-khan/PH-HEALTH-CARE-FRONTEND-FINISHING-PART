"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  AppointmentStatus,
  IAppointment,
  PaymentStatus,
} from "@/types/appointments.interface";
import { Calendar, Clock, CreditCard, User, Video, X } from "lucide-react";

interface AppointmentViewDetailDialogProps {
  open: boolean;
  onClose: () => void;
  appointment: IAppointment | null;
}

const AppointmentViewDetailDialog = ({
  open,
  onClose,
  appointment,
}: AppointmentViewDetailDialogProps) => {
  if (!appointment) return null;

  const getStatusBadge = () => {
    if (appointment.status === AppointmentStatus.SCHEDULED) {
      return <Badge variant="default">Scheduled</Badge>;
    }
    if (appointment.status === AppointmentStatus.INPROGRESS) {
      return <Badge variant="secondary">In Progress</Badge>;
    }
    if (appointment.status === AppointmentStatus.COMPLETED) {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          Completed
        </Badge>
      );
    }
    return <Badge variant="destructive">Canceled</Badge>;
  };

  const getPaymentBadge = () => {
    if (appointment.paymentStatus === PaymentStatus.PAID) {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
          Paid
        </Badge>
      );
    }
    return <Badge variant="destructive">Unpaid</Badge>;
  };

  const startDate = appointment.schedule
    ? new Date(appointment.schedule.startDateTime)
    : null;
  const endDate = appointment.schedule
    ? new Date(appointment.schedule.endDateTime)
    : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle>Appointment Details</DialogTitle>
              <DialogDescription>
                View complete appointment information
              </DialogDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6 pr-4">
            {/* Status and Payment */}
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Status
                </div>
                {getStatusBadge()}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Payment Status
                </div>
                {getPaymentBadge()}
              </div>
            </div>

            <Separator />

            {/* Patient Information */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">Patient Information</h3>
              </div>
              <div className="space-y-2 ml-6">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Name
                  </div>
                  <div>{appointment.patient?.name || "N/A"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Email
                  </div>
                  <div>{appointment.patient?.email || "N/A"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Phone
                  </div>
                  <div>{appointment.patient?.contactNumber || "N/A"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Address
                  </div>
                  <div>{appointment.patient?.address || "N/A"}</div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Doctor Information */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">Doctor Information</h3>
              </div>
              <div className="space-y-2 ml-6">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Name
                  </div>
                  <div>{appointment.doctor?.name || "N/A"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Email
                  </div>
                  <div>{appointment.doctor?.email || "N/A"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Phone
                  </div>
                  <div>{appointment.doctor?.contactNumber || "N/A"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Designation
                  </div>
                  <div>{appointment.doctor?.designation || "N/A"}</div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Schedule Information */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">Schedule Information</h3>
              </div>
              <div className="space-y-2 ml-6">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Date
                  </div>
                  <div>
                    {startDate
                      ? startDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "N/A"}
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Start Time
                    </div>
                    <div>
                      {startDate
                        ? startDate.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "N/A"}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      End Time
                    </div>
                    <div>
                      {endDate
                        ? endDate.toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Additional Information */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Video className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">Additional Information</h3>
              </div>
              <div className="space-y-2 ml-6">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Video Calling ID
                  </div>
                  <div className="font-mono">
                    {appointment.videoCallingId || "Not set"}
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <CreditCard className="h-3 w-3" />
                      Payment Status
                    </div>
                    <div>
                      {appointment.paymentStatus === PaymentStatus.PAID
                        ? "Paid"
                        : "Unpaid"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Created At</div>
                <div>
                  {appointment.createdAt
                    ? new Date(appointment.createdAt).toLocaleString()
                    : "N/A"}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Updated At</div>
                <div>
                  {appointment.updatedAt
                    ? new Date(appointment.updatedAt).toLocaleString()
                    : "N/A"}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentViewDetailDialog;
