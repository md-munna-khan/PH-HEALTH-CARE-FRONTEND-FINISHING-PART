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
import { updatePatient } from "@/services/admin/patientsManagement";
import { IPatient } from "@/types/patient.interface";
import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";

interface IPatientFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  patient?: IPatient;
}

const PatientFormDialog = ({
  open,
  onClose,
  onSuccess,
  patient,
}: IPatientFormDialogProps) => {
  const formRef = useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState(
    updatePatient.bind(null, patient?.id as string),
    null
  );
  const prevStateRef = useRef(state);

  // Handle success/error from server
  useEffect(() => {
    if (state === prevStateRef.current) return;
    prevStateRef.current = state;
    if (state?.success) {
      toast.success(state.message || "Operation successful");
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
          <DialogTitle>Edit Patient</DialogTitle>
        </DialogHeader>

        <form
          ref={formRef}
          action={formAction}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="flex-1 overflow-y-auto px-6 space-y-4 pb-4">
            {/* Basic Information */}
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                id="name"
                name="name"
                placeholder="John Doe"
                defaultValue={state?.formData?.name || patient?.name || ""}
              />
              <InputFieldError field="name" state={state} />
            </Field>

            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="patient@example.com"
                defaultValue={state?.formData?.email || patient?.email || ""}
                disabled={isPending}
              />
              <InputFieldError field="email" state={state} />
            </Field>

            <Field>
              <FieldLabel htmlFor="contactNumber">Contact Number</FieldLabel>
              <Input
                id="contactNumber"
                name="contactNumber"
                placeholder="+1234567890"
                defaultValue={
                  state?.formData?.contactNumber || patient?.contactNumber || ""
                }
              />
              <InputFieldError field="contactNumber" state={state} />
            </Field>

            <Field>
              <FieldLabel htmlFor="address">Address</FieldLabel>
              <Input
                id="address"
                name="address"
                placeholder="123 Main St, City, Country"
                defaultValue={
                  state?.formData?.address || patient?.address || ""
                }
              />
              <InputFieldError field="address" state={state} />
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
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PatientFormDialog;
