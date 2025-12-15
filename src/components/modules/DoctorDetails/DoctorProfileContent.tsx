import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IDoctor } from "@/types/doctor.interface";
import {
  Briefcase,
  Calendar,
  DollarSign,
  GraduationCap,
  Hospital,
  Mail,
  MapPin,
  Phone,
  Star,
} from "lucide-react";

interface DoctorProfileContentProps {
  doctor: IDoctor;
}

const DoctorProfileContent = ({ doctor }: DoctorProfileContentProps) => {
  const initials = doctor.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Doctor Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Picture */}
            <div className="flex justify-center md:justify-start">
              <Avatar className="h-32 w-32">
                {doctor.profilePhoto ? (
                  <AvatarImage
                    src={
                      typeof doctor.profilePhoto === "string"
                        ? doctor.profilePhoto
                        : undefined
                    }
                    alt={doctor.name}
                  />
                ) : (
                  <AvatarFallback className="text-3xl">
                    {initials}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>

            {/* Doctor Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold">{doctor.name}</h1>
                <p className="text-muted-foreground mt-1">
                  {doctor.designation}
                </p>
              </div>

              {/* Specialties */}
              {doctor.doctorSpecialties &&
                doctor.doctorSpecialties.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {doctor.doctorSpecialties.map((specialty) => (
                      <Badge key={specialty.specialitiesId} variant="secondary">
                        {specialty.specialities?.title || "Specialty"}
                      </Badge>
                    ))}
                  </div>
                )}

              {/* Rating & Fee */}
              <div className="flex flex-wrap gap-4">
                {doctor.averageRating && (
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">
                      {doctor.averageRating.toFixed(1)}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-primary">
                  <DollarSign className="h-5 w-5" />
                  <span className="font-semibold">
                    ${doctor.appointmentFee}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    per visit
                  </span>
                </div>
              </div>

              {/* {!isModal && (
                <div className="flex gap-4">
                  <Button>Book Appointment</Button>
                  <Button variant="outline">View Schedule</Button>
                </div>
              )} */}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <span>{doctor.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <span>{doctor.contactNumber}</span>
            </div>
            {doctor.address && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                <span>{doctor.address}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Professional Details */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Briefcase className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Experience</p>
                <p className="font-semibold">
                  {doctor.experience
                    ? `${doctor.experience} years`
                    : "Not specified"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Hospital className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Current Workplace
                </p>
                <p className="font-semibold">{doctor.currentWorkingPlace}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Registration Number
                </p>
                <p className="font-semibold">{doctor.registrationNumber}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Qualification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Qualification & Education
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{doctor.qualification}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorProfileContent;
