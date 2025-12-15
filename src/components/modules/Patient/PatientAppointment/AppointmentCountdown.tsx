"use client";

import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface AppointmentCountdownProps {
  appointmentDateTime: string;
  className?: string;
}

const AppointmentCountdown = ({
  appointmentDateTime,
  className = "",
}: AppointmentCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [isPast, setIsPast] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const appointmentTime = new Date(appointmentDateTime).getTime();
      const difference = appointmentTime - now;

      if (difference <= 0) {
        setIsPast(true);
        setTimeLeft("Appointment time passed");
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [appointmentDateTime]);

  return (
    <div
      className={`flex items-center gap-2 text-sm ${
        isPast ? "text-red-600" : "text-blue-600"
      } ${className}`}
    >
      <Clock className="h-4 w-4" />
      <span className="font-medium">
        {isPast ? "Appointment passed" : `Starts in: ${timeLeft}`}
      </span>
    </div>
  );
};

export default AppointmentCountdown;
