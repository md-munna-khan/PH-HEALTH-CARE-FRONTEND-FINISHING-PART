import ChangePasswordForm from "@/components/ChangePasswordForm";

// Dynamic SSR - authenticated page
export const dynamic = "force-dynamic";

const ChangePasswordPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Change Password</h1>
      <div className="mx-auto max-w-2xl">
        <div className="rounded-lg border bg-card p-6">
          <p className="mb-6 text-sm text-muted-foreground">
            Update your password to keep your account secure. Make sure your new
            password is strong and unique.
          </p>
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordPage;
