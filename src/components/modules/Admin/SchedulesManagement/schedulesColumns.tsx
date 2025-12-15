"use client";

import { DateCell } from "@/components/shared/cell/DateCell";
import { Column } from "@/components/shared/ManagementTable";
import { ISchedule } from "@/types/schedule.interface";
import { Clock } from "lucide-react";

export const schedulesColumns: Column<ISchedule>[] = [
  {
    header: "Start Date & Time",
    accessor: (schedule) => <DateCell date={schedule.startDateTime} />,
    sortKey: "startDateTime",
  },
  {
    header: "End Date & Time",
    accessor: (schedule) => <DateCell date={schedule.endDateTime} />,
    sortKey: "endDateTime",
  },
  {
    header: "Duration",
    accessor: (schedule) => {
      const start = new Date(schedule.startDateTime);
      const end = new Date(schedule.endDateTime);
      const durationMinutes = Math.round(
        (end.getTime() - start.getTime()) / (1000 * 60)
      );
      return (
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{durationMinutes} min</span>
        </div>
      );
    },
  },
];
