import InputFieldError from "@/components/shared/InputFieldError";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createSchedule } from "@/services/admin/schedulesManagement";
import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";

interface IScheduleFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ScheduleFormDialog = ({
  open,
  onClose,
  onSuccess,
}: IScheduleFormDialogProps) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(createSchedule, null);
  const prevStateRef = useRef(state);

  // Handle success/error from server
  useEffect(() => {
    if (state === prevStateRef.current) return;
    prevStateRef.current = state;
    if (state?.success) {
      toast.success(state.message || "Schedule created successfully");
      if (formRef.current) {
        formRef.current.reset();
      }
      onSuccess();
      onClose();
    } else if (state?.message && !state.success) {
      toast.error(state.message);
    }
  }, [state, onSuccess, onClose]);

  const handleClose = () => {
    formRef.current?.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>Create Schedule</DialogTitle>
        </DialogHeader>

        <form
          ref={formRef}
          action={formAction}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="flex-1 overflow-y-auto px-6 space-y-4 pb-4">
            {/* Start Date */}
            <Field>
              <FieldLabel htmlFor="startDate">Start Date</FieldLabel>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                defaultValue={state?.formData?.startDate || ""}
              />
              <InputFieldError field="startDate" state={state} />
            </Field>

            {/* End Date */}
            <Field>
              <FieldLabel htmlFor="endDate">End Date</FieldLabel>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                defaultValue={state?.formData?.endDate || ""}
              />
              <InputFieldError field="endDate" state={state} />
            </Field>

            {/* Start Time */}
            <Field>
              <FieldLabel htmlFor="startTime">Start Time</FieldLabel>
              <Input
                id="startTime"
                name="startTime"
                type="time"
                defaultValue={state?.formData?.startTime || ""}
                placeholder="HH:MM"
              />
              <p className="text-xs text-gray-500 mt-1">
                Example: 09:00 (24-hour format)
              </p>
              <InputFieldError field="startTime" state={state} />
            </Field>

            {/* End Time */}
            <Field>
              <FieldLabel htmlFor="endTime">End Time</FieldLabel>
              <Input
                id="endTime"
                name="endTime"
                type="time"
                defaultValue={state?.formData?.endTime || ""}
                placeholder="HH:MM"
              />
              <p className="text-xs text-gray-500 mt-1">
                Example: 17:00 (24-hour format). Schedules will be created in
                30-minute intervals.
              </p>
              <InputFieldError field="endTime" state={state} />
            </Field>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 px-6 py-4 border-t bg-gray-50">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Schedule"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleFormDialog;
