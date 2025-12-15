/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import InputFieldError from "@/components/shared/InputFieldError";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { resetPassword } from "@/services/auth/auth.service";
import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

interface ResetPasswordFormProps {
  redirect?: string;
  email?: string;
  token?: string;
}

const ResetPasswordForm = ({
  redirect,
  email,
  token,
}: ResetPasswordFormProps) => {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(resetPassword, null);

  useEffect(() => {
    if (state && !state.success && state.message) {
      toast.error(state.message);
    }

    if (state && state.success && state.redirectToLogin) {
      toast.success(state.message);
      setTimeout(() => {
        router.push(redirect || "/login");
      }, 1500);
    }
  }, [state, router, redirect]);

  return (
    <form action={formAction}>
      {redirect && <Input type="hidden" name="redirect" value={redirect} />}
      {email && <Input type="hidden" name="email" value={email} />}
      {token && <Input type="hidden" name="token" value={token} />}
      {email && token && (
        <Input type="hidden" name="isEmailReset" value="true" />
      )}
      <Input
        type="hidden"
        name="isEmailReset"
        value={email && token ? "true" : "false"}
      />
      <FieldGroup>
        <div className="grid grid-cols-1 gap-4">
          {/* New Password */}
          <Field>
            <FieldLabel htmlFor="newPassword">New Password</FieldLabel>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              placeholder="Enter new password"
              autoComplete="new-password"
            />
            <InputFieldError field="newPassword" state={state as any} />
          </Field>

          {/* Confirm Password */}
          <Field>
            <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirm new password"
              autoComplete="new-password"
            />
            <InputFieldError field="confirmPassword" state={state as any} />
          </Field>
        </div>

        <FieldGroup className="mt-4">
          <Field>
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? "Resetting..." : "Reset Password"}
            </Button>

            <FieldDescription className="px-6 text-center mt-4">
              Remember your password?{" "}
              <a href="/login" className="text-blue-600 hover:underline">
                Back to Login
              </a>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </FieldGroup>
    </form>
  );
};

export default ResetPasswordForm;
