import { getDefaultDashboardRoute } from "@/lib/auth-utils";
import { getUserInfo } from "@/services/auth/getUserInfo";
import { getCookie } from "@/services/auth/tokenHandlers";
import Link from "next/link";
import AISearchDialog from "./AISSearchDialog";
import MobileMenu from "./MobileMenu";
import NavbarAuthButtons from "./NavbarAuthButtons";

const PublicNavbar = async () => {
  const navItems = [
    { href: "/consultation", label: "Consultation" },
    { href: "/health-plans", label: "Health Plans" },
    { href: "/medicine", label: "Medicine" },
    { href: "/diagnostics", label: "Diagnostics" },
    { href: "/ngos", label: "NGOs" },
  ];

  const accessToken = await getCookie("accessToken");
  const userInfo = accessToken ? await getUserInfo() : null;
  const dashboardRoute = userInfo
    ? getDefaultDashboardRoute(userInfo.role)
    : "/";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur  dark:bg-background/95">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-primary">PH Doc</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navItems.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              prefetch={true}
              className="text-foreground hover:text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center space-x-2">
          <AISearchDialog />
          <NavbarAuthButtons
            initialHasToken={!!accessToken}
            initialUserInfo={userInfo}
            initialDashboardRoute={dashboardRoute}
          />
        </div>

        {/* Mobile Menu */}
        <MobileMenu
          navItems={navItems}
          hasAccessToken={!!accessToken}
          userInfo={userInfo}
          dashboardRoute={dashboardRoute}
        />
      </div>
    </header>
  );
};

export default PublicNavbar;
