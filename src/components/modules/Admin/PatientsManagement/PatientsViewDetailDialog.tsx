import InfoRow from "@/components/shared/InoRow";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { formatDateTime, getInitials } from "@/lib/formatters";
import { IPatient } from "@/types/patient.interface";
import {
  Activity,
  Calendar,
  Droplet,
  FileText,
  Heart,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";

interface IPatientViewDialogProps {
  open: boolean;
  onClose: () => void;
  patient: IPatient | null;
}

const PatientViewDetailDialog = ({
  open,
  onClose,
  patient,
}: IPatientViewDialogProps) => {
  if (!patient) {
    return null;
  }

  const healthData = patient.patientHealthData;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="min-w-5xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Patient Profile</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {/* Patient Profile Header */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 bg-linear-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg mb-6">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
              <AvatarImage
                src={patient?.profilePhoto || ""}
                alt={patient?.name}
              />
              <AvatarFallback className="text-2xl">
                {getInitials(patient?.name || "")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-3xl font-bold mb-1">{patient?.name}</h2>
              <p className="text-muted-foreground mb-2 flex items-center justify-center sm:justify-start gap-2">
                <Mail className="h-4 w-4" />
                {patient?.email}
              </p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <Badge
                  variant={patient?.isDeleted ? "destructive" : "default"}
                  className="text-sm"
                >
                  {patient?.isDeleted ? "Inactive" : "Active"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Information Grid */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Phone className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-lg">Contact Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
                  <InfoRow
                    label="Contact Number"
                    value={patient?.contactNumber || "Not provided"}
                  />
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
                  <InfoRow
                    label="Email"
                    value={patient?.email || "Not provided"}
                  />
                </div>
                <div className="flex items-start gap-3 md:col-span-2">
                  <MapPin className="h-4 w-4 mt-1 text-muted-foreground" />
                  <InfoRow
                    label="Address"
                    value={patient?.address || "Not provided"}
                  />
                </div>
              </div>
            </div>

            {/* Health Data */}
            {healthData && (
              <>
                <Separator />
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Heart className="h-5 w-5 text-red-600" />
                    <h3 className="font-semibold text-lg">
                      Health Information
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <User className="h-4 w-4 mt-1 text-muted-foreground" />
                      <InfoRow
                        label="Gender"
                        value={
                          healthData.gender
                            ? healthData.gender.charAt(0) +
                              healthData.gender.slice(1).toLowerCase()
                            : "Not specified"
                        }
                      />
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                      <InfoRow
                        label="Date of Birth"
                        value={formatDateTime(healthData.dateOfBirth || "")}
                      />
                    </div>
                    <div className="flex items-start gap-3">
                      <Droplet className="h-4 w-4 mt-1 text-muted-foreground" />
                      <InfoRow
                        label="Blood Group"
                        value={
                          healthData.bloodGroup?.replace(/_/g, " ") ||
                          "Not specified"
                        }
                      />
                    </div>
                    <div className="flex items-start gap-3">
                      <Activity className="h-4 w-4 mt-1 text-muted-foreground" />
                      <InfoRow
                        label="Height"
                        value={healthData.height || "Not specified"}
                      />
                    </div>
                    <div className="flex items-start gap-3">
                      <Activity className="h-4 w-4 mt-1 text-muted-foreground" />
                      <InfoRow
                        label="Weight"
                        value={healthData.weight || "Not specified"}
                      />
                    </div>
                    <div className="flex items-start gap-3">
                      <Heart className="h-4 w-4 mt-1 text-muted-foreground" />
                      <InfoRow
                        label="Marital Status"
                        value={
                          healthData.maritalStatus
                            ? healthData.maritalStatus.charAt(0) +
                              healthData.maritalStatus.slice(1).toLowerCase()
                            : "Not specified"
                        }
                      />
                    </div>
                    <div className="flex items-start gap-3 md:col-span-2">
                      <Activity className="h-4 w-4 mt-1 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground mb-1">
                          Medical Conditions
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {healthData.hasAllergies && (
                            <Badge variant="outline" className="text-xs">
                              Allergies
                            </Badge>
                          )}
                          {healthData.hasDiabetes && (
                            <Badge variant="outline" className="text-xs">
                              Diabetes
                            </Badge>
                          )}
                          {healthData.smokingStatus && (
                            <Badge variant="outline" className="text-xs">
                              Smoker
                            </Badge>
                          )}
                          {healthData.hasPastSurgeries && (
                            <Badge variant="outline" className="text-xs">
                              Past Surgeries
                            </Badge>
                          )}
                          {healthData.recentAnxiety && (
                            <Badge variant="outline" className="text-xs">
                              Recent Anxiety
                            </Badge>
                          )}
                          {healthData.recentDepression && (
                            <Badge variant="outline" className="text-xs">
                              Recent Depression
                            </Badge>
                          )}
                          {!healthData.hasAllergies &&
                            !healthData.hasDiabetes &&
                            !healthData.smokingStatus &&
                            !healthData.hasPastSurgeries &&
                            !healthData.recentAnxiety &&
                            !healthData.recentDepression && (
                              <span className="text-sm text-muted-foreground">
                                No major conditions
                              </span>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Medical Reports */}
            {patient.medicalReport && patient.medicalReport.length > 0 && (
              <>
                <Separator />
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold text-lg">Medical Reports</h3>
                  </div>
                  <div className="space-y-2">
                    {patient.medicalReport.map((report) => (
                      <div
                        key={report.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="text-sm font-medium">
                              {report.reportName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDateTime(report.createdAt)}
                            </div>
                          </div>
                        </div>
                        <a
                          href={report.reportLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View Report
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Personal Information */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-orange-600" />
                <h3 className="font-semibold text-lg">Account Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                  <InfoRow
                    label="Joined On"
                    value={formatDateTime(patient?.createdAt || "")}
                  />
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                  <InfoRow
                    label="Last Updated"
                    value={formatDateTime(patient?.updatedAt || "")}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PatientViewDetailDialog;
