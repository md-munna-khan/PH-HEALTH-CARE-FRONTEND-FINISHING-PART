"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getInitials } from "@/lib/formatters";
import { IDoctor } from "@/types/doctor.interface";
import { Clock, DollarSign, Eye, MapPin, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import BookAppointmentDialog from "./BookAppointmentDialog";

interface DoctorCard {
  doctor: IDoctor;
}

export default function DoctorCard({ doctor }: DoctorCard) {
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={doctor.profilePhoto || ""} alt={doctor.name} />
              <AvatarFallback className="text-lg">
                {getInitials(doctor.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg line-clamp-1">
                Dr. {doctor.name}
              </CardTitle>
              <CardDescription className="line-clamp-1">
                {doctor.designation}
              </CardDescription>

              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">
                    {doctor.averageRating?.toFixed(1) || "N/A"}
                  </span>
                </div>
                {doctor.doctorSpecialties &&
                  doctor.doctorSpecialties.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {doctor.doctorSpecialties[0].specialities?.title}
                    </Badge>
                  )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pb-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 shrink-0" />
              <span className="truncate">{doctor.experience} years exp</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4 shrink-0" />
              <span className="font-semibold text-foreground">
                ${doctor.appointmentFee}
              </span>
            </div>
          </div>

          {doctor.currentWorkingPlace && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="line-clamp-1">{doctor.currentWorkingPlace}</span>
            </div>
          )}

          <div className="text-sm">
            <p className="font-medium mb-1">Qualification:</p>
            <p className="text-muted-foreground line-clamp-2">
              {doctor.qualification}
            </p>
          </div>

          {doctor.doctorSpecialties && doctor.doctorSpecialties.length > 1 && (
            <div className="flex flex-wrap gap-1">
              {doctor.doctorSpecialties.slice(1, 3).map((specialty) => (
                <Badge
                  key={specialty.specialitiesId}
                  variant="outline"
                  className="text-xs"
                >
                  {specialty.specialities?.title}
                </Badge>
              ))}
              {doctor.doctorSpecialties.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{doctor.doctorSpecialties.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-3 border-t flex gap-2">
          <Link className="flex-1" href={`/consultation/doctor/${doctor.id}`}>
            <Button variant="outline" className="w-full">
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </Link>
          <Button onClick={() => setShowScheduleModal(true)} className="flex-1">
            Book Appointment
          </Button>
        </CardFooter>
      </Card>

      <BookAppointmentDialog
        doctor={doctor}
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
      />
    </>
  );
}
