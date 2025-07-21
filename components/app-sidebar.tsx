"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Calendar, Clock, Home, MapPin, Users, LogOut } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AuthService } from "@/lib/auth";
import { useEffect, useState } from "react";

const menuItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Book Hot Seat", url: "/hot-seat", icon: MapPin },
  { title: "My Bookings", url: "/bookings", icon: Calendar },
  { title: "Scheduling", url: "/scheduling", icon: Clock },
  { title: "Visitor Pass", url: "/visitor-pass", icon: Users },
];

export function AppSidebar() {
  const pathname = usePathname();
  const isMobile = useIsMobile();

  // Desktop  ➜ sidebar fixed  | Mobile ➜ off-canvas
  const collapsible = isMobile ? "offcanvas" : "none";

  // Mock user until backend auth is wired-up
  const [user, setUser] = useState(AuthService.getUser());

  // TODO: Uncomment this useEffect when backend auth is ready
  useEffect(() => {
    const currentUser = AuthService.getUser();
    if (!user) {
      window.location.href = "/login";
    } else {
      setUser(currentUser);
    }
  }, []);

  const handleLogout = () => {
    // TODO: Uncomment when backend auth is ready
    AuthService.logout();

    // For now, just show an alert
    // alert("Logout functionality will be enabled when backend is connected");
  };

  return (
    <Sidebar collapsible={collapsible} className={`${!isMobile ? "fixed left-0 top-0 h-screen w-80 z-40 border-r bg-background" : ""}`}>
      {/* Brand header */}
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-orange-500">
            <span className="text-white font-bold text-sm">SO</span>
          </div>
          <div>
            <h2 className="font-semibold leading-none">Space Optimizer</h2>
            <p className="text-xs text-muted-foreground">Employee Portal</p>
          </div>
        </div>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map(({ title, url, icon: Icon }) => (
                <SidebarMenuItem key={title}>
                  <SidebarMenuButton asChild isActive={pathname === url}>
                    <Link href={url}>
                      <Icon className="size-4 shrink-0" />
                      <span>{title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with user + logout */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-2 py-3">
              <Avatar className="size-8">
                <AvatarFallback className="bg-blue-500 text-white">{user?.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Button variant="ghost" className="w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleLogout}>
              <LogOut className="size-4 shrink-0" />
              Logout
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
