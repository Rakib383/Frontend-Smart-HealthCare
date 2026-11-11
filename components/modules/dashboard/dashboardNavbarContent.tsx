"use client"

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NavSection } from "@/types/dashboard.types";
import { UserInfo } from "@/types/user.types";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import DashboardMobileSidebar from "./DashboardMobileSidebar";
import NotificationDropdown from "./NotificationDropdown";
import UserDropdown from "./UserDropdown";

interface DashboardNavbarProps {
  userInfo: UserInfo;
  navItems: NavSection[];
  dashboardHome: string
}

const DashboardNavbarContent = ({ dashboardHome, navItems, userInfo }: DashboardNavbarProps) => {

  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkSmallerScreen = () => {
      setIsMobile(window.innerWidth < 768);
    }

    checkSmallerScreen();
    window.addEventListener("resize", checkSmallerScreen);

    return () => {
      window.removeEventListener("resize", checkSmallerScreen);
    };
  }, []);

  return (
    <div className="flex items-center gap-4 w-full px-4 py-3 border-b bg-background">
      {/* Mobile Menu Toggle Button And Menu */}
      <Sheet open={isOpen && isMobile} onOpenChange={setIsOpen}>
        <SheetTrigger render={<Button variant="outline" size="icon" className="md:hidden" aria-label="Open navigation menu" />}>
            <Menu className="h-5 w-5" />
        </SheetTrigger>

        <SheetContent side="left" className="w-64 p-0">
          <DashboardMobileSidebar userInfo={userInfo} dashboardHome={dashboardHome} navItems={navItems} />
        </SheetContent>
      </Sheet>
      {/* Right Side Actions */}
      <div className="ml-auto flex items-center gap-2">
        {/* Notification */}
        <NotificationDropdown />

        {/* User Dropdown  */}
        <UserDropdown userInfo={userInfo} />
      </div>
    </div>
  )
}

export default DashboardNavbarContent