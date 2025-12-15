"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePassword } from "@/services/auth/auth.service";
import { CheckCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { useActionState, useState } from "react";

const ChangePasswordForm = () => {
  const [state, formAction, isPending] = useActionState(changePassword, null);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-6">
      {state?.success && (
        <Alert className="border-green-500 bg-green-50 text-green-900">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      {state?.success === false && (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <Field>
        <Label htmlFor="oldPassword">Current Password</Label>
        <div className="relative">
          <Input
            id="oldPassword"
            name="oldPassword"
            type={showOldPassword ? "text" : "password"}
            placeholder="Enter your current password"
            defaultValue={state?.formData?.oldPassword || ""}
            required
            disabled={isPending}
          />
          <Button
            variant="ghost"
            onClick={() => setShowOldPassword(!showOldPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            {showOldPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        {state?.errors?.find((e) => e.field === "oldPassword") && (
          <p className="text-sm text-red-500">
            {state.errors.find((e) => e.field === "oldPassword")?.message}
          </p>
        )}
      </Field>

      <Field>
        <Label htmlFor="newPassword">New Password</Label>
        <div className="relative">
          <Input
            id="newPassword"
            name="newPassword"
            type={showNewPassword ? "text" : "password"}
            placeholder="Enter your new password"
            defaultValue={state?.formData?.newPassword || ""}
            required
            disabled={isPending}
          />
          <Button
            variant="ghost"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            {showNewPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        {state?.errors?.find((e) => e.field === "newPassword") && (
          <p className="text-sm text-red-500">
            {state.errors.find((e) => e.field === "newPassword")?.message}
          </p>
        )}
      </Field>

      <Field>
        <Label htmlFor="confirmPassword">Confirm New Password</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your new password"
            defaultValue={state?.formData?.confirmPassword || ""}
            required
            disabled={isPending}
          />
          <Button
            variant="ghost"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        {state?.errors?.find((e) => e.field === "confirmPassword") && (
          <p className="text-sm text-red-500">
            {state.errors.find((e) => e.field === "confirmPassword")?.message}
          </p>
        )}
      </Field>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Changing Password...
          </>
        ) : (
          "Change Password"
        )}
      </Button>
    </form>
  );
};

export default ChangePasswordForm;
