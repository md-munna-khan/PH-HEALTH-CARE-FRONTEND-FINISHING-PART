"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import { getAIDoctorSuggestion } from "@/services/ai/ai.service";
import { AISuggestedDoctor } from "@/types/ai.interface";
import {
  Award,
  Briefcase,
  DollarSign,
  Loader2,
  MapPin,
  Search,
  Sparkles,
  Star,
  Stethoscope,
  User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "../ui/badge";

interface AISearchDialogProps {
  initialSymptoms?: string;
  externalOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSearchComplete?: () => void;
}

export default function AISearchDialog({
  initialSymptoms = "",
  externalOpen,
  onOpenChange,
  onSearchComplete,
}: AISearchDialogProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [symptoms, setSymptoms] = useState(initialSymptoms);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedDoctors, setSuggestedDoctors] = useState<AISuggestedDoctor[]>(
    []
  );
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasAutoSearched, setHasAutoSearched] = useState(false);
  const [triggerSearch, setTriggerSearch] = useState(false);

  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  // Update symptoms when initialSymptoms changes (from external source)
  useEffect(() => {
    if (initialSymptoms && initialSymptoms !== symptoms && !open) {
      // Only update when dialog is closed to prevent interference with user editing
      setSymptoms(initialSymptoms);
      setHasAutoSearched(false);
      setTriggerSearch(true); // Mark that we should auto-search
    }
  }, [initialSymptoms, symptoms, open]);

  const handleSearch = async () => {
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
        toast.success("AI suggestions found!");
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

  // Auto-trigger search when dialog opens with symptoms (only for external triggers)
  useEffect(() => {
    if (
      open &&
      triggerSearch &&
      symptoms &&
      symptoms.trim().length >= 5 &&
      !hasAutoSearched
    ) {
      setHasAutoSearched(true);
      setTriggerSearch(false); // Reset trigger
      // Small delay to ensure dialog is fully rendered
      setTimeout(() => {
        handleSearch();
      }, 50);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, triggerSearch, hasAutoSearched]);

  // Reset when dialog is manually closed
  const handleDialogOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      // Dialog is opening
      setOpen(newOpen);
    } else {
      // Dialog is closing - reset state
      setOpen(newOpen);
      setTimeout(() => {
        setHasAutoSearched(false);
        setTriggerSearch(false);
        setSymptoms("");
        setSuggestedDoctors([]);
        setShowSuggestions(false);
        onSearchComplete?.();
      }, 100);
    }
  };

  const handleDoctorClick = () => {
    setOpen(false);
    setSymptoms("");
    setSuggestedDoctors([]);
    setShowSuggestions(false);
    setHasAutoSearched(false);
    setTriggerSearch(false);
    onSearchComplete?.();
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:inline">AI Search</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary rounded-lg">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle>AI Doctor Search</DialogTitle>
              <DialogDescription>
                Describe your symptoms to find the right doctor
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Textarea
              placeholder="Describe your symptoms in detail (e.g., severe headache for 3 days, high fever with chills, persistent cough with chest pain, etc.)..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              onKeyDown={(e) => {
                // Prevent keyboard shortcuts from triggering while typing
                e.stopPropagation();
                // Allow Enter to create new line, not trigger search
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  !e.ctrlKey &&
                  !e.metaKey
                ) {
                  // Only trigger search if explicitly pressing Enter alone
                  // Comment this out to prevent Enter from searching while typing
                  // e.preventDefault();
                  // handleSearch();
                }
              }}
              rows={4}
              className="resize-none border-primary/30 focus:border-primary focus:ring-primary/50"
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
            onClick={handleSearch}
            disabled={isLoading || symptoms.trim().length < 5}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing symptoms...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search with AI
              </>
            )}
          </Button>

          {showSuggestions && suggestedDoctors.length > 0 && (
            <div className="space-y-4 p-4 bg-linear-to-br from-primary/5 to-white rounded-lg border-2 border-primary/20">
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/30"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  AI Recommended ({suggestedDoctors.length})
                </Badge>
                <p className="text-xs text-muted-foreground">
                  Based on your symptoms
                </p>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {suggestedDoctors.map((doctor, index) => (
                  <div
                    key={doctor.id || index}
                    className="p-4 bg-white rounded-lg border border-primary/20 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
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

                      <div className="flex-1 space-y-2">
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

                        {/* All Specialties */}
                        {doctor.specialties &&
                          doctor.specialties.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {doctor.specialties.map((specialty, idx) => (
                                <Badge
                                  key={idx}
                                  variant={
                                    idx % 2 === 0 ? "default" : "outline"
                                  }
                                  className={
                                    idx % 2 === 0
                                      ? "bg-blue-600 text-white"
                                      : ""
                                  }
                                >
                                  <Stethoscope className="h-3 w-3 mr-1" />
                                  {specialty}
                                </Badge>
                              ))}
                            </div>
                          )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          {doctor.experience > 0 && (
                            <div className="flex items-center gap-2 text-gray-700">
                              <Briefcase className="h-4 w-4 text-primary" />
                              <span>{doctor.experience} years</span>
                            </div>
                          )}
                          {doctor.qualification && (
                            <div className="flex items-center gap-2 text-gray-700">
                              <Award className="h-4 w-4 text-primary" />
                              <span className="truncate">
                                {doctor.qualification}
                              </span>
                            </div>
                          )}
                          {doctor.currentWorkingPlace && (
                            <div className="flex items-center gap-2 text-gray-700">
                              <MapPin className="h-4 w-4 text-primary" />
                              <span className="truncate">
                                {doctor.currentWorkingPlace}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-primary/20">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="font-semibold text-green-700">
                              ৳{doctor.appointmentFee}
                            </span>
                            <span className="text-xs text-gray-500">fee</span>
                          </div>
                          <Link
                            href={`/consultation/doctor/${doctor.id}`}
                            onClick={handleDoctorClick}
                          >
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

              <div className="pt-2 border-t border-blue-200">
                <p className="text-xs text-center text-muted-foreground">
                  ⚠️ AI suggestions are for guidance only. Please consult a
                  medical professional for accurate diagnosis.
                </p>
              </div>
            </div>
          )}

          {showSuggestions && suggestedDoctors.length === 0 && (
            <div className="p-6 bg-amber-50 rounded-lg border-2 border-amber-200 text-center">
              <p className="text-amber-700 font-medium">
                No doctor recommendations found
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Try describing your symptoms differently.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
