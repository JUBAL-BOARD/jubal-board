"use client";

import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard, UserSearch, Briefcase, MessageSquare,
  Wallet, UserCheck, Bell, User, Settings, LogOut,
} from "lucide-react";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: <LayoutDashboard size={20} />, label: "Dashboard",     path: "/client/dashboard" },
  { icon: <UserSearch size={20} />,     label: "Hire a Pro",     path: "/client/explore-skills" },
  { icon: <Briefcase size={20} />,      label: "My Desk",        path: "/client/my-desk" },
  { icon: <MessageSquare size={20} />,  label: "Messages",       path: "/client/messages" },
  { icon: <Wallet size={20} />,         label: "My Wallet",      path: "/client/my-wallet" },
  { icon: <UserCheck size={20} />,      label: "My Favorites",   path: "/client/my-favorites" },
  { icon: <Bell size={20} />,           label: "Notifications",  path: "/client/notifications" },
  { icon: <User size={20} />,           label: "My Profile",     path: "/client/my-profile" },
  { icon: <Settings size={20} />,       label: "Settings",       path: "/client/settings" },
  { icon: <LogOut size={20} />,         label: "Log out",        path: "/onboarding" },
];

interface Props {
  activeItem?: string;
}

const Sidebar: React.FC<Props> = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="w-[200px] lg:w-[300px] h-full h-screen bg-[#fafafa] border-r border-[#f0f0f0] pt-8 lg:pt-5 flex flex-col overflow-y-auto justify-center lg:justify-start lg:pt-10 lg:pl-10">
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        return (
          <div
            key={item.label}
            onClick={() => router.push(item.path)}
            className={`flex items-center gap-3 px-5 py-[3px] text-md lg:text-2xl transition-all duration-150
              ${isActive
                ? "text-[#e2554f] font-semibold"
                : "text-gray-700 font-normal hover:text-[#e2554f]"
              }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
};

export default Sidebar;