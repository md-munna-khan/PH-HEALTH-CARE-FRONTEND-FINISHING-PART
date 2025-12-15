"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  createDoctorSchedule,
  getAvailableSchedules,
} from "@/services/doctor/doctorScedule.services";
import { ISchedule } from "@/types/schedule.interface";
import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface BookScheduleDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  availableSchedules: ISchedule[];
}

export default function BookScheduleDialog({
  open,
  onClose,
  onSuccess,
  availableSchedules: initialAvailableSchedules = [],
}: BookScheduleDialogProps) {
  const [availableSchedules, setAvailableSchedules] = useState<ISchedule[]>(
    initialAvailableSchedules
  );
  const [selectedSchedules, setSelectedSchedules] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      loadAvailableSchedules();
    } else {
      setSelectedSchedules([]);
    }
  }, [open]);

  const loadAvailableSchedules = async () => {
    try {
      setLoadingSchedules(true);
      const response = await getAvailableSchedules();
      setAvailableSchedules(response?.data || []);
    } catch (error) {
      console.error("Error loading schedules:", error);
      toast.error("Failed to load available schedules");
    } finally {
      setLoadingSchedules(false);
    }
  };

  const handleToggleSchedule = (scheduleId: string) => {
    setSelectedSchedules((prev) =>
      prev.includes(scheduleId)
        ? prev.filter((id) => id !== scheduleId)
        : [...prev, scheduleId]
    );
  };

  const handleSubmit = async () => {
    if (selectedSchedules.length === 0) {
      toast.error("Please select at least one schedule");
      return;
    }

    try {
      setIsLoading(true);
      await createDoctorSchedule(selectedSchedules);
      toast.success(
        `Successfully booked ${selectedSchedules.length} schedule${
          selectedSchedules.length > 1 ? "s" : ""
        }`
      );
      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
      onClose();
    } catch (error) {
      console.error("Error booking schedules:", error);
      toast.error("Failed to book schedules");
    } finally {
      setIsLoading(false);
    }
  };

  const groupSchedulesByDate = () => {
    const grouped: Record<string, ISchedule[]> = {};

    if (availableSchedules.length > 0) {
      availableSchedules.forEach((schedule) => {
        const date = format(new Date(schedule.startDateTime), "yyyy-MM-dd");
        if (!grouped[date]) {
          grouped[date] = [];
        }
        grouped[date].push(schedule);
      });
    }

    return Object.entries(grouped).sort(
      ([dateA], [dateB]) =>
        new Date(dateA).getTime() - new Date(dateB).getTime()
    );
  };

  const groupedSchedules = groupSchedulesByDate();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Schedules</DialogTitle>
          <DialogDescription>
            Select time slots from available schedules to add to your calendar
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {loadingSchedules ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading schedules...</p>
            </div>
          ) : availableSchedules.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">
                No available schedules found
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedSchedules.map(([date, daySchedules]) => (
                <div key={date}>
                  <h3 className="font-medium mb-3">
                    {format(new Date(date), "EEEE, MMMM d, yyyy")}
                  </h3>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {daySchedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-accent cursor-pointer"
                        onClick={() => handleToggleSchedule(schedule.id)}
                      >
                        <Checkbox
                          id={schedule.id}
                          checked={selectedSchedules.includes(schedule.id)}
                          onCheckedChange={() =>
                            handleToggleSchedule(schedule.id)
                          }
                        />
                        <Label
                          htmlFor={schedule.id}
                          className="flex-1 cursor-pointer"
                        >
                          {format(new Date(schedule.startDateTime), "h:mm a")} -{" "}
                          {format(new Date(schedule.endDateTime), "h:mm a")}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <p className="text-sm text-muted-foreground">
              {selectedSchedules.length} schedule
              {selectedSchedules.length !== 1 ? "s" : ""} selected
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={selectedSchedules.length === 0 || isLoading}
              >
                {isLoading ? "Booking..." : "Book Schedules"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
