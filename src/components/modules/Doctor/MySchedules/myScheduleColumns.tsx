"use client";

import { Column } from "@/components/shared/ManagementTable";
import { Badge } from "@/components/ui/badge";
import { IDoctorSchedule } from "@/types/schedule.interface";
import { format, isBefore, startOfDay } from "date-fns";

const isPastSchedule = (schedule: IDoctorSchedule) => {
  return isBefore(
    new Date(schedule.schedule?.startDateTime || ""),
    startOfDay(new Date())
  );
};

export const myScheduleColumns: Column<IDoctorSchedule>[] = [
  {
    header: "Date",
    accessor: (schedule) => (
      <span className="font-medium">
        {schedule.schedule?.startDateTime &&
          format(new Date(schedule.schedule.startDateTime), "MMM d, yyyy")}
      </span>
    ),
    sortKey: "schedule.startDateTime",
  },
  {
    header: "Time Slot",
    accessor: (schedule) => (
      <div className="flex items-center gap-2">
        <span className="text-sm">
          {schedule.schedule?.startDateTime &&
            format(new Date(schedule.schedule.startDateTime), "h:mm a")}{" "}
          -{" "}
          {schedule.schedule?.endDateTime &&
            format(new Date(schedule.schedule.endDateTime), "h:mm a")}
        </span>
      </div>
    ),
  },
  {
    header: "Status",
    accessor: (schedule) => {
      const isPast = isPastSchedule(schedule);
      return isPast ? (
        <Badge variant="secondary">Past</Badge>
      ) : (
        <Badge variant="outline" className="bg-green-50 text-green-700">
          Upcoming
        </Badge>
      );
    },
  },
  {
    header: "Booking Status",
    accessor: (schedule) =>
      schedule.isBooked ? (
        <Badge variant="default" className="bg-blue-600">
          Booked
        </Badge>
      ) : (
        <Badge variant="outline">Available</Badge>
      ),
  },
];
