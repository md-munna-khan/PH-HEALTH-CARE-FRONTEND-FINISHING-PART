/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { initiatePayment } from "@/services/payment/payment.service";
import {
  AppointmentStatus,
  IAppointment,
  PaymentStatus,
} from "@/types/appointments.interface";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  CreditCard,
  FileText,
  Loader2,
  MapPin,
  MessageSquare,
  Star,
  Stethoscope,
  User,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import AppointmentCountdown from "./AppointmentCountdown";

interface AppointmentsListProps {
  appointments: IAppointment[];
}

const AppointmentsList = ({ appointments }: AppointmentsListProps) => {
  const [processingPaymentId, setProcessingPaymentId] = useState<string | null>(
    null
  );

  const handlePayNow = async (appointmentId: string) => {
    setProcessingPaymentId(appointmentId);
    try {
      const result = await initiatePayment(appointmentId);

      if (result.success && result.data?.paymentUrl) {
        toast.success("Redirecting to payment...");
        // Store return URL before redirecting to payment
        sessionStorage.setItem(
          "paymentReturnUrl",
          "/dashboard/my-appointments"
        );
        window.location.replace(result.data.paymentUrl);
      } else {
        toast.error(result.message || "Failed to initiate payment");
        setProcessingPaymentId(null);
      }
    } catch (error) {
      toast.error("An error occurred while initiating payment");
      setProcessingPaymentId(null);
      console.error(error);
    }
  };

  const getStatusBadge = (status: AppointmentStatus) => {
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

    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    if (status === PaymentStatus.PAID) {
      return (
        <Badge
          variant="default"
          className="bg-emerald-500 hover:bg-emerald-600"
        >
          Paid
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="bg-orange-50 text-orange-700 border-orange-300"
      >
        Payment Pending
      </Badge>
    );
  };

  if (appointments.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Appointments Yet</h3>
          <p className="text-muted-foreground text-center max-w-sm">
            You haven&apos;t booked any appointments. Browse our doctors and
            book your first consultation.
          </p>
          <Button className="mt-4" asChild>
            <a href="/consultation">Find a Doctor</a>
          </Button>
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {appointments.map((appointment) => (
        <Card
          key={appointment.id}
          className="hover:shadow-lg transition-shadow"
        >
          <CardContent className="pt-6 space-y-4">
            {/* Status and Review Badge */}
            <div className="flex justify-between items-start gap-2 flex-wrap">
              <div className="flex gap-2 flex-wrap">
                {getStatusBadge(appointment.status)}
                {getPaymentStatusBadge(appointment.paymentStatus)}
              </div>
              <div className="flex gap-2 flex-wrap">
                {appointment.prescription && (
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700"
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    Prescription
                  </Badge>
                )}
                {appointment.status === AppointmentStatus.COMPLETED &&
                  !appointment.review && (
                    <Badge
                      variant="outline"
                      className="bg-amber-50 text-amber-700 border-amber-300 animate-pulse"
                    >
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Can Review
                    </Badge>
                  )}
              </div>
            </div>

            {/* Doctor Info */}
            <div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">
                    {appointment.doctor?.name || "N/A"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {appointment.doctor?.designation || "Doctor"}
                  </p>
                </div>
              </div>
            </div>

            {/* Specialties */}
            {appointment.doctor?.doctorSpecialties &&
              appointment.doctor.doctorSpecialties.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                  {appointment.doctor.doctorSpecialties
                    .slice(0, 2)
                    .map((ds, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {ds.specialities?.title || "N/A"}
                      </Badge>
                    ))}
                  {appointment.doctor.doctorSpecialties.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{appointment.doctor.doctorSpecialties.length - 2} more
                    </Badge>
                  )}
                </div>
              )}

            {/* Schedule */}
            {appointment.schedule && (
              <div className="space-y-2 bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {format(
                      new Date(appointment.schedule.startDateTime),
                      "EEEE, MMM d, yyyy"
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {format(
                      new Date(appointment.schedule.startDateTime),
                      "h:mm a"
                    )}{" "}
                    -{" "}
                    {format(
                      new Date(appointment.schedule.endDateTime),
                      "h:mm a"
                    )}
                  </span>
                </div>
                {appointment.status === AppointmentStatus.SCHEDULED &&
                  appointment.schedule.startDateTime && (
                    <div className="pt-2 border-t border-gray-200">
                      <AppointmentCountdown
                        appointmentDateTime={appointment.schedule.startDateTime}
                      />
                    </div>
                  )}
              </div>
            )}

            {/* Address */}
            {appointment.doctor?.address && (
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span className="line-clamp-2">
                  {appointment.doctor.address}
                </span>
              </div>
            )}

            {/* Review Status */}
            {appointment.status === AppointmentStatus.COMPLETED && (
              <div>
                {appointment.review ? (
                  <div className="flex items-center gap-2 text-sm text-yellow-600 bg-yellow-50 rounded-lg p-2">
                    <Star className="h-4 w-4 fill-yellow-600" />
                    <span>Rated {appointment.review.rating}/5</span>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground bg-gray-50 rounded-lg p-2">
                    No review yet
                  </div>
                )}
              </div>
            )}
          </CardContent>

          <CardFooter className="border-t pt-4">
            <div className="flex gap-2 w-full">
              <Button variant="outline" size="sm" className="flex-1" asChild>
                <Link href={`/dashboard/my-appointments/${appointment.id}`}>
                  View Details
                </Link>
              </Button>
              {appointment.paymentStatus === PaymentStatus.UNPAID &&
                appointment.status !== AppointmentStatus.CANCELED && (
                  <Button
                    onClick={() => handlePayNow(appointment.id)}
                    disabled={processingPaymentId === appointment.id}
                    size="sm"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    {processingPaymentId === appointment.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Pay Now
                      </>
                    )}
                  </Button>
                )}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default AppointmentsList;
