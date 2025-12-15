"use client";

import AISearchDialog from "@/components/shared/AISSearchDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NavSection } from "@/types/dashboard.interface";
import { UserInfo } from "@/types/user.interface";
import { Menu, Search } from "lucide-react";
import { useEffect, useState } from "react";
import DashboardMobileSidebar from "./DashboardMobileSidebar";
import NotificationDropdown from "./NotificationDropdown";
import UserDropdown from "./UserDropdown";

interface DashboardNavbarContentProps {
  userInfo: UserInfo;
  navItems?: NavSection[];
  dashboardHome?: string;
}
const DashboardNavbarContent = ({
  userInfo,
  navItems,
  dashboardHome,
}: DashboardNavbarContentProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [aiDialogOpen, setAiDialogOpen] = useState(false);

  useEffect(() => {
    const checkSmallerScreen = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkSmallerScreen();
    window.addEventListener("resize", checkSmallerScreen);

    return () => {
      window.removeEventListener("resize", checkSmallerScreen);
    };
  }, []);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      setAiDialogOpen(true);
    }
  };

  const handleSearchIconClick = () => {
    if (searchQuery.trim()) {
      setAiDialogOpen(true);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6">
        {/* Mobile Menu Toggle */}
        <Sheet open={isMobile && isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          {/* Hide the overlay on medium and larger screens */}
          <SheetContent side="left" className="w-64 p-0">
            <DashboardMobileSidebar
              userInfo={userInfo}
              navItems={navItems || []}
              dashboardHome={dashboardHome || ""}
            />
          </SheetContent>
        </Sheet>

        {/* Search Bar & AI Search */}
        <div className="flex-1 flex items-center justify-end gap-2">
          {/* Search Input */}
          <div className="relative w-full hidden sm:block">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground cursor-pointer"
              onClick={handleSearchIconClick}
            />
            <Input
              type="text"
              placeholder="Search doctors by symptoms..."
              className="pl-9 pr-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </div>

          {/* AI Search Dialog */}
          <AISearchDialog
            initialSymptoms={searchQuery}
            externalOpen={aiDialogOpen}
            onOpenChange={(open) => {
              setAiDialogOpen(open);
              if (!open) setSearchQuery("");
            }}
            onSearchComplete={() => setSearchQuery("")}
          />
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <NotificationDropdown />

          {/* User Dropdown */}
          <UserDropdown userInfo={userInfo} />
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbarContent;
