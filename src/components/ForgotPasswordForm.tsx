"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPassword } from "@/services/auth/auth.service";
import { CheckCircle, Loader2, Mail } from "lucide-react";
import { useActionState } from "react";

const ForgotPasswordForm = () => {
  const [state, formAction, isPending] = useActionState(forgotPassword, null);

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
        <Label htmlFor="email">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            className="pl-10"
            defaultValue={state?.formData?.email || ""}
            required
            disabled={isPending}
          />
        </div>
        {state?.errors?.find((e) => e.field === "email") && (
          <p className="text-sm text-red-500">
            {state.errors.find((e) => e.field === "email")?.message}
          </p>
        )}
      </Field>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending Reset Link...
          </>
        ) : (
          "Send Reset Link"
        )}
      </Button>
    </form>
  );
};

export default ForgotPasswordForm;
