"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getAIDoctorSuggestion } from "@/services/ai/ai.service";
import { AISuggestedDoctor } from "@/types/ai.interface";

import {
  Award,
  Briefcase,
  DollarSign,
  Loader2,
  MapPin,
  Sparkles,
  Star,
  Stethoscope,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export default function AIDoctorSuggestion() {
  const [symptoms, setSymptoms] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedDoctors, setSuggestedDoctors] = useState<AISuggestedDoctor[]>(
    []
  );
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleGetSuggestion = async () => {
    if (!symptoms.trim() || symptoms.trim().length < 5) {
      toast.error("Please describe your symptoms (at least 5 characters)");
      return;
    }

    setIsLoading(true);
    setSuggestedDoctors([]);
    setShowSuggestions(false);

    try {
      const response = await getAIDoctorSuggestion(symptoms);
      if (response.success && response.data) {
        const doctors = Array.isArray(response.data)
          ? response.data
          : [response.data];
        setSuggestedDoctors(doctors);
        setShowSuggestions(true);
        toast.success("AI suggestions generated successfully!");
      } else {
        toast.error(response.message || "Failed to get AI suggestions");
      }
    } catch (error) {
      console.error("Error getting AI suggestion:", error);
      toast.error("Failed to get AI suggestion. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-primary/5 via-white to-primary/5 border-primary/20 shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary rounded-lg">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-primary">AI Doctor Suggestion</CardTitle>
            <CardDescription className="text-primary/80">
              Describe your symptoms and get AI-powered doctor recommendations
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Textarea
            placeholder="Describe your symptoms in detail (e.g., severe headache for 3 days, high fever with chills, persistent cough with chest pain, etc.)..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            rows={4}
            className="resize-none bg-white border-primary/30 focus:border-primary focus:ring-primary/50"
            disabled={isLoading}
          />
          <div className="flex justify-between items-center mt-1">
            <p className="text-xs text-muted-foreground">
              {symptoms.length} characters
            </p>
            <p className="text-xs text-primary font-medium">
              Minimum 5 characters required
            </p>
          </div>
        </div>

        <Button
          onClick={handleGetSuggestion}
          disabled={isLoading || symptoms.trim().length < 5}
          className="w-full shadow-md"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing symptoms with AI...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Get AI Recommendations
            </>
          )}
        </Button>

        {showSuggestions && suggestedDoctors.length > 0 && (
          <div className="space-y-4 p-4 bg-white rounded-lg border-2 border-primary/20 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/30"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Recommended ({suggestedDoctors.length})
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Based on your symptoms
              </p>
            </div>

            <div className="space-y-3">
              {suggestedDoctors.map((doctor, index) => (
                <div
                  key={doctor.id || index}
                  className="p-4 bg-gradient-to-br from-primary/5 to-white rounded-lg border border-primary/20 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    {/* Doctor Number Badge */}
                    <div className="shrink-0">
                      <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                    </div>

                    {/* Doctor Photo */}
                    <div className="shrink-0">
                      {doctor.profilePhoto ? (
                        <Image
                          src={doctor.profilePhoto}
                          alt={doctor.name}
                          width={64}
                          height={64}
                          className="w-16 h-16 rounded-full object-cover border-2 border-primary/30"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center">
                          <span className="text-xl font-bold text-primary">
                            {doctor.name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2) || "DR"}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Doctor Info */}
                    <div className="flex-1 space-y-2 min-h-[180px] flex flex-col">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">
                            {doctor.name || "N/A"}
                          </h4>
                          {doctor.averageRating > 0 && (
                            <div className="flex items-center gap-1 text-amber-600">
                              <Star className="h-4 w-4 fill-amber-600" />
                              <span className="text-sm font-medium">
                                {doctor.averageRating.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                        {doctor.designation && (
                          <p className="text-sm text-gray-600">
                            {doctor.designation}
                          </p>
                        )}
                      </div>

                      {/* Specialties - Always show in same spot */}
                      <div className="flex flex-wrap gap-1 min-h-7">
                        {doctor.specialties && doctor.specialties.length > 0 ? (
                          doctor.specialties.map((specialty, idx) => (
                            <Badge
                              key={idx}
                              variant={idx % 2 === 0 ? "default" : "outline"}
                            >
                              <Stethoscope className="h-3 w-3 mr-1" />
                              {specialty}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="secondary">General</Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm flex-1">
                        {doctor.experience > 0 && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <Briefcase className="h-4 w-4 text-purple-600" />
                            <span>{doctor.experience} years exp</span>
                          </div>
                        )}
                        {doctor.qualification && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <Award className="h-4 w-4 text-purple-600" />
                            <span className="truncate">
                              {doctor.qualification}
                            </span>
                          </div>
                        )}
                        {doctor.currentWorkingPlace && (
                          <div className="flex items-center gap-2 text-gray-700 md:col-span-2">
                            <MapPin className="h-4 w-4 text-purple-600" />
                            <span className="truncate">
                              {doctor.currentWorkingPlace}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-primary/20 mt-auto">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-semibold text-green-700">
                            ৳{doctor.appointmentFee}
                          </span>
                          <span className="text-xs text-gray-500">
                            consultation fee
                          </span>
                        </div>
                        <Link href={`/consultation/doctor/${doctor.id}`}>
                          <Button size="sm">
                            <User className="h-3 w-3 mr-1" />
                            View Profile
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-primary/20">
              <p className="text-xs text-center text-muted-foreground">
                ⚠️ AI suggestions are for guidance only. Please consult a
                medical professional for accurate diagnosis.
              </p>
            </div>
          </div>
        )}

        {showSuggestions && suggestedDoctors.length === 0 && (
          <div className="p-6 bg-white rounded-lg border-2 border-amber-200 text-center">
            <p className="text-amber-700 font-medium">
              No doctor recommendations found
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Try describing your symptoms differently or browse all doctors
              below.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
