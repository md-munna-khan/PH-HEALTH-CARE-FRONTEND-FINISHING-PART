"use client";

import DeleteConfirmationDialog from "@/components/shared/DeleteConfirmationDialog";
import ManagementTable from "@/components/shared/ManagementTable";
import { deleteDoctorOwnSchedule } from "@/services/doctor/doctorScedule.services";
import { IDoctorSchedule } from "@/types/schedule.interface";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { myScheduleColumns } from "./myScheduleColumns";

interface MySchedulesTableProps {
  schedules: IDoctorSchedule[];
}

export default function MySchedulesTable({
  schedules = [],
}: MySchedulesTableProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [deletingSchedule, setDeletingSchedule] =
    useState<IDoctorSchedule | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const handleDelete = (schedule: IDoctorSchedule) => {
    // Only allow deletion of unbooked schedules
    if (!schedule.isBooked) {
      setDeletingSchedule(schedule);
    } else {
      toast.error("Cannot delete booked schedule");
    }
  };

  const confirmDelete = async () => {
    if (!deletingSchedule) return;

    setIsDeleting(true);
    const result = await deleteDoctorOwnSchedule(deletingSchedule.scheduleId);
    setIsDeleting(false);

    if (result.success) {
      toast.success(result.message || "Schedule deleted successfully");
      setDeletingSchedule(null);
      handleRefresh();
    } else {
      toast.error(result.message || "Failed to delete schedule");
    }
  };

  return (
    <>
      <ManagementTable
        data={schedules}
        columns={myScheduleColumns}
        onDelete={handleDelete}
        getRowKey={(schedule) => schedule.scheduleId}
        emptyMessage="No schedules found. Try adjusting your filters or book new schedules."
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={!!deletingSchedule}
        onOpenChange={(open) => !open && setDeletingSchedule(null)}
        onConfirm={confirmDelete}
        title="Delete Schedule"
        description="Are you sure you want to delete this schedule slot? This action cannot be undone."
        isDeleting={isDeleting}
      />
    </>
  );
}
