"use client";

import { useAuthToken } from "@/hooks/useAuthToken";
import { UserInfo } from "@/types/user.interface";
import { LayoutDashboard } from "lucide-react";
import Link from "next/link";
import UserDropdown from "../modules/Dashboard/UserDropdown";
import { Button } from "../ui/button";

interface NavbarAuthButtonsProps {
  initialHasToken: boolean;
  initialUserInfo: UserInfo | null;
  initialDashboardRoute: string;
}

export default function NavbarAuthButtons({
  initialHasToken,
  initialUserInfo,
  initialDashboardRoute,
}: NavbarAuthButtonsProps) {
  // Detect client-side auth state changes on navigation
  const clientHasToken = useAuthToken();

  // Use client token state if available, otherwise fall back to server state
  const hasToken = clientHasToken || initialHasToken;
  const userInfo = hasToken ? initialUserInfo : null;
  const dashboardRoute = initialDashboardRoute;

  if (hasToken && userInfo) {
    return (
      <>
        <Link href={dashboardRoute}>
          <Button variant="outline" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Button>
        </Link>
        <UserDropdown userInfo={userInfo} />
      </>
    );
  }

  return (
    <Link href="/login">
      <Button>Login</Button>
    </Link>
  );
}
