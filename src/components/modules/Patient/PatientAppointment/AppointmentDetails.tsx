/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  MapPin,
  Phone,
  Star,
  Stethoscope,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
// import ReviewDialog from "./ReviewDialog";
import { changeAppointmentStatus } from "@/services/patient/appointment.service";
import { initiatePayment } from "@/services/payment/payment.service";
import {
  AppointmentStatus,
  IAppointment,
  PaymentStatus,
} from "@/types/appointments.interface";
import { toast } from "sonner";
import AppointmentCountdown from "./AppointmentCountdown";
import ReviewDialog from "./ReviewDialog";

interface AppointmentDetailProps {
  appointment: IAppointment;
}

const AppointmentDetails = ({ appointment }: AppointmentDetailProps) => {
  const router = useRouter();
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const isCompleted = appointment.status === AppointmentStatus.COMPLETED;
  const isCanceled = appointment.status === AppointmentStatus.CANCELED;
  const isScheduled = appointment.status === AppointmentStatus.SCHEDULED;
  const canReview =
    isCompleted &&
    !appointment.review &&
    appointment.paymentStatus === PaymentStatus.PAID;
  const canCancel = isScheduled && !isCanceled;

  const handlePayNow = async () => {
    setIsProcessingPayment(true);
    try {
      const result = await initiatePayment(appointment.id);

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
        setIsProcessingPayment(false);
      }
    } catch (error) {
      toast.error("An error occurred while initiating payment");
      setIsProcessingPayment(false);
      console.error(error);
    }
  };

  const handleCancelAppointment = async () => {
    if (!confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    setIsCancelling(true);
    try {
      const result = await changeAppointmentStatus(
        appointment.id,
        AppointmentStatus.CANCELED
      );

      if (result.success) {
        toast.success("Appointment cancelled successfully");
        router.refresh();
      } else {
        toast.error(result.message || "Failed to cancel appointment");
      }
    } catch (error) {
      toast.error("An error occurred while cancelling appointment");
      console.error(error);
    } finally {
      setIsCancelling(false);
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
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Appointment Details
          </h1>
          <p className="text-muted-foreground mt-2">
            Complete information about your appointment
          </p>
        </div>
        <div className="flex gap-2">
          {canCancel && (
            <Button
              variant="destructive"
              onClick={handleCancelAppointment}
              disabled={isCancelling}
            >
              {isCancelling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Cancel Appointment"
              )}
            </Button>
          )}
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
        </div>
      </div>

      {/* Review Notification - Only show if can review (completed but no review) */}
      {canReview && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900">
                  Review This Appointment
                </h3>
                <p className="text-sm text-amber-700 mt-1">
                  Your appointment has been completed. Share your experience by
                  leaving a review for Dr. {appointment.doctor?.name}.
                </p>
                <Button
                  onClick={() => setShowReviewDialog(true)}
                  className="mt-3"
                  size="sm"
                >
                  Write a Review
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Required Alert - Show if completed but not paid */}
      {!isCompleted &&
        !appointment.review &&
        appointment.paymentStatus === PaymentStatus.UNPAID && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900">
                    Payment Required to Review
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    Please complete the payment for this appointment before
                    leaving a review.
                  </p>
                  <Button
                    onClick={handlePayNow}
                    disabled={isProcessingPayment}
                    className="mt-3 bg-red-600 hover:bg-red-700"
                    size="sm"
                  >
                    {isProcessingPayment ? (
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
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Cannot Review Yet - Only show if not completed and no review */}
      {!isCompleted && !appointment.review && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900">
                  Review Not Available Yet
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  You can review this appointment after it has been completed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Doctor Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Doctor Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-2xl font-semibold">
                {appointment.doctor?.name || "N/A"}
              </p>
              <p className="text-muted-foreground">
                {appointment.doctor?.designation || "Doctor"}
              </p>
            </div>

            <Separator />

            {appointment.doctor?.doctorSpecialties &&
              appointment.doctor.doctorSpecialties.length > 0 && (
                <>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Stethoscope className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Specialties</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {appointment.doctor.doctorSpecialties.map((ds, idx) => (
                        <Badge key={idx} variant="secondary">
                          {ds.specialities?.title || "N/A"}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

            <div className="space-y-2">
              {appointment.doctor?.qualification && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Qualification:</span>
                  <span className="font-medium">
                    {appointment.doctor.qualification}
                  </span>
                </div>
              )}

              {appointment.doctor?.experience !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Experience:</span>
                  <span className="font-medium">
                    {appointment.doctor.experience} years
                  </span>
                </div>
              )}

              {appointment.doctor?.currentWorkingPlace && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Working at:</span>
                  <span className="font-medium">
                    {appointment.doctor.currentWorkingPlace}
                  </span>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              {appointment.doctor?.contactNumber && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{appointment.doctor.contactNumber}</span>
                </div>
              )}

              {appointment.doctor?.address && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span>{appointment.doctor.address}</span>
                </div>
              )}
            </div>

            {appointment.doctor?.appointmentFee !== undefined && (
              <>
                <Separator />
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-blue-900">
                      Consultation Fee
                    </span>
                    <span className="text-xl font-bold text-blue-600">
                      ${appointment.doctor.appointmentFee}
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Appointment Details */}
        <div className="space-y-6 lg:col-span-1">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Appointment Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Current Status
                </span>
                {getStatusBadge(appointment.status)}
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          {appointment.schedule && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-linear-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Date</p>
                    <p className="text-xl font-bold text-blue-900">
                      {format(
                        new Date(appointment.schedule.startDateTime),
                        "EEEE"
                      )}
                    </p>
                    <p className="text-blue-700">
                      {format(
                        new Date(appointment.schedule.startDateTime),
                        "MMMM d, yyyy"
                      )}
                    </p>
                  </div>

                  <Separator className="bg-blue-200" />

                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p className="font-semibold text-blue-900">
                        {format(
                          new Date(appointment.schedule.startDateTime),
                          "h:mm a"
                        )}{" "}
                        -{" "}
                        {format(
                          new Date(appointment.schedule.endDateTime),
                          "h:mm a"
                        )}
                      </p>
                    </div>
                  </div>

                  {appointment.status === AppointmentStatus.SCHEDULED &&
                    appointment.schedule.startDateTime && (
                      <>
                        <Separator className="bg-blue-200" />
                        <div className="pt-2">
                          <AppointmentCountdown
                            appointmentDateTime={
                              appointment.schedule.startDateTime
                            }
                            className="text-blue-700"
                          />
                        </div>
                      </>
                    )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Prescription */}
          {appointment.prescription && (
            <Card className="border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-5 w-5" />
                  Prescription Available
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-green-50 rounded-lg p-3 space-y-2">
                  <div>
                    <span className="text-sm font-medium text-green-900">
                      Instructions:
                    </span>
                    <p className="text-sm text-green-700 mt-1">
                      {appointment.prescription.instructions}
                    </p>
                  </div>

                  {appointment.prescription.followUpDate && (
                    <div>
                      <span className="text-sm font-medium text-green-900">
                        Follow-up Date:
                      </span>
                      <p className="text-sm text-green-700">
                        {format(
                          new Date(appointment.prescription.followUpDate),
                          "MMMM d, yyyy"
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Review Section - Full Width Below */}
      {appointment.review && (
        <Card className="border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <Star className="h-5 w-5 fill-yellow-600" />
              Your Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-yellow-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= appointment.review!.rating
                        ? "fill-yellow-500 text-yellow-500"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm font-medium text-yellow-900">
                  {appointment.review.rating}/5
                </span>
              </div>

              {appointment.review.comment && (
                <div>
                  <p className="text-sm text-yellow-900 font-medium mb-1">
                    Comment:
                  </p>
                  <p className="text-sm text-yellow-800">
                    {appointment.review.comment}
                  </p>
                </div>
              )}

              <p className="text-xs text-yellow-600 italic">
                Reviews cannot be edited or deleted once submitted.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review Dialog */}
      {canReview && (
        <ReviewDialog
          isOpen={showReviewDialog}
          onClose={() => setShowReviewDialog(false)}
          appointmentId={appointment.id}
          doctorName={appointment.doctor?.name || "the doctor"}
        />
      )}
    </div>
  );
};

export default AppointmentDetails;
