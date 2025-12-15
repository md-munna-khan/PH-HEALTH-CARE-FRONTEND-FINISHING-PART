"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  createAppointment,
  createAppointmentWithPayLater,
} from "@/services/patient/appointment.service";
import { IDoctor } from "@/types/doctor.interface";
import { ISchedule } from "@/types/schedule.interface";
import { format } from "date-fns";
import {
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  MapPin,
  Phone,
  Stethoscope,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface AppointmentConfirmationProps {
  doctor: IDoctor;
  schedule: ISchedule;
}

const AppointmentConfirmation = ({
  doctor,
  schedule,
}: AppointmentConfirmationProps) => {
  const router = useRouter();
  const [isPayingNow, setIsPayingNow] = useState(false);
  const [isPayingLater, setIsPayingLater] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const handleConfirmBooking = async () => {
    setIsPayingNow(true);

    try {
      const result = await createAppointment({
        doctorId: doctor.id!,
        scheduleId: schedule.id,
      });

      if (result.success && result.data?.paymentUrl) {
        toast.success("Redirecting to payment...");
        // Redirect to Stripe checkout
        window.location.replace(result.data.paymentUrl);
      } else if (result.success) {
        setBookingSuccess(true);
        toast.success("Appointment booked successfully!");

        // Redirect after 2 seconds
        setTimeout(() => {
          router.push("/dashboard/my-appointments");
        }, 2000);
      } else {
        toast.error(result.message || "Failed to book appointment");
        setIsPayingNow(false);
      }
    } catch (error) {
      toast.error("An error occurred while booking the appointment");
      setIsPayingNow(false);
      console.error(error);
    }
  };

  const handlePayLater = async () => {
    setIsPayingLater(true);

    try {
      const result = await createAppointmentWithPayLater({
        doctorId: doctor.id!,
        scheduleId: schedule.id,
      });

      if (result.success) {
        setBookingSuccess(true);
        toast.success(
          "Appointment booked! You can pay later from your appointments page."
        );

        // Redirect after 2 seconds
        setTimeout(() => {
          router.push("/dashboard/my-appointments");
        }, 2000);
      } else {
        toast.error(result.message || "Failed to book appointment");
        setIsPayingLater(false);
      }
    } catch (error) {
      toast.error("An error occurred while booking the appointment");
      setIsPayingLater(false);
      console.error(error);
    }
  };

  if (bookingSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle2 className="h-16 w-16 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-green-900">
                  Appointment Confirmed!
                </h2>
                <p className="text-green-700 mt-2">
                  Your appointment has been successfully booked
                </p>
              </div>
              <p className="text-sm text-green-600">
                Redirecting to your appointments...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Confirm Appointment
        </h1>
        <p className="text-muted-foreground mt-2">
          Review the details below and confirm your appointment
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Doctor Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Doctor Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-2xl font-semibold">{doctor.name}</p>
              <p className="text-muted-foreground">{doctor.designation}</p>
            </div>

            <Separator />

            {doctor.doctorSpecialties &&
              doctor.doctorSpecialties.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Stethoscope className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Specialties</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {doctor.doctorSpecialties.map((ds, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-200"
                      >
                        {ds.specialities?.title || "N/A"}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            <Separator />

            <div className="space-y-2">
              {doctor.qualification && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Qualification:
                  </span>
                  <span className="text-sm font-medium">
                    {doctor.qualification}
                  </span>
                </div>
              )}

              {doctor.experience !== undefined && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Experience:
                  </span>
                  <span className="text-sm font-medium">
                    {doctor.experience} years
                  </span>
                </div>
              )}

              {doctor.currentWorkingPlace && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Working at:
                  </span>
                  <span className="text-sm font-medium">
                    {doctor.currentWorkingPlace}
                  </span>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              {doctor.contactNumber && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{doctor.contactNumber}</span>
                </div>
              )}

              {doctor.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{doctor.address}</span>
                </div>
              )}
            </div>

            <Separator />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-blue-900">
                  Consultation Fee
                </span>
                <span className="text-xl font-bold text-blue-600">
                  ${doctor.appointmentFee}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Appointment Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-linear-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Date</p>
                <p className="text-2xl font-bold text-blue-900">
                  {format(new Date(schedule.startDateTime), "EEEE")}
                </p>
                <p className="text-lg text-blue-700">
                  {format(new Date(schedule.startDateTime), "MMMM d, yyyy")}
                </p>
              </div>

              <Separator />

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="text-lg font-semibold text-blue-900">
                    {format(new Date(schedule.startDateTime), "h:mm a")} -{" "}
                    {format(new Date(schedule.endDateTime), "h:mm a")}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <h3 className="font-semibold text-sm">Important Information</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>
                    Please arrive 10 minutes before your scheduled time
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>
                    Bring any relevant medical records or prescriptions
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>
                    You can cancel or reschedule from your appointments page
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>
                    A confirmation will be sent to your registered email
                  </span>
                </li>
              </ul>
            </div>

            <Separator />

            <div className="space-y-3 pt-2">
              <Button
                onClick={handleConfirmBooking}
                disabled={isBooking}
                className="w-full"
                size="lg"
              >
                {isPayingNow ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Pay Now & Book Appointment
                  </>
                )}
              </Button>

              <Button
                onClick={handlePayLater}
                disabled={isBooking}
                variant="outline"
                className="w-full"
                size="lg"
              >
                {isPayingLater ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Booking Appointment...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Book Now, Pay Later
                  </>
                )}
              </Button>

              <Button
                variant="ghost"
                onClick={() => router.back()}
                disabled={isBooking}
                className="w-full"
              >
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppointmentConfirmation;
