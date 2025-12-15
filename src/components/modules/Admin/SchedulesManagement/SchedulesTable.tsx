"use client";

import DeleteConfirmationDialog from "@/components/shared/DeleteConfirmationDialog";
import ManagementTable from "@/components/shared/ManagementTable";
import { deleteSchedule } from "@/services/admin/schedulesManagement";
import { ISchedule } from "@/types/schedule.interface";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { schedulesColumns } from "./schedulesColumns";

interface SchedulesTableProps {
  schedules: ISchedule[];
}

const SchedulesTable = ({ schedules }: SchedulesTableProps) => {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [deletingSchedule, setDeletingSchedule] = useState<ISchedule | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const handleDelete = (schedule: ISchedule) => {
    setDeletingSchedule(schedule);
  };

  const confirmDelete = async () => {
    if (!deletingSchedule) return;

    setIsDeleting(true);
    const result = await deleteSchedule(deletingSchedule.id!);
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
        columns={schedulesColumns}
        onDelete={handleDelete}
        getRowKey={(schedule) => schedule.id!}
        emptyMessage="No schedules found"
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={!!deletingSchedule}
        onOpenChange={(open) => !open && setDeletingSchedule(null)}
        onConfirm={confirmDelete}
        title="Delete Schedule"
        description={`Are you sure you want to delete this schedule? This action cannot be undone.`}
        isDeleting={isDeleting}
      />
    </>
  );
};

export default SchedulesTable;
