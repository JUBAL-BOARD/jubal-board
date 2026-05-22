"use client";
import { useRouter, usePathname } from "next/navigation";
import { Briefs, Dashboard, Desk, Dispute, Earnings, Favorites, HireAPro, Logs, Messages, Notifs, Pitchess, Profile, Settingss } from "@/app/icons";
import { clearSession } from "@/app/lib/session";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: <Dashboard size={20} />, label: "Dashboard",      path: "/client/dashboard" },
  { icon: <HireAPro size={20} />, label: "Hire a Pro",      path: "/client/explore-skills" },
  { icon: <Briefs size={20} />, label: "My Briefs",         path: "/client/my-briefs" },
  { icon: <Pitchess size={20} />, label: "Pitches",         path: "/client/pitches" },
  { icon: <Desk size={20} />, label: "My Desk",             path: "/client/my-desk" },
  { icon: <Messages size={20} />, label: "Messages",        path: "/client/messages" },
  { icon: <Earnings size={20} />, label: "My Wallet",       path: "/client/my-wallet" },
  { icon: <Favorites size={20} />, label: "My Favorites",   path: "/client/my-favorites" },
  { icon: <Dispute size={20} />, label: "Disputes",         path: "/client/dispute" },
  { icon: <Notifs size={20} />, label: "Notifications",     path: "/client/notifications" },
  { icon: <Profile size={20} />, label: "My Profile",       path: "/client/my-profile" },
  { icon: <Settingss size={20} />, label: "Settings",       path: "/client/settings" },
];

interface Props {
  activeItem?: string;
}

const Sidebar: React.FC<Props> = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
  localStorage.clear();
  sessionStorage.clear();
  await clearSession();
  await fetch("/api/v1/auth/logout", { method: "POST" });
  window.location.href = "/onboarding";
};

  return (
    <div className="w-[200px] lg:w-[300px] h-full h-screen bg-[#fafafa] border-r border-[#f0f0f0] pt-8 lg:pt-5 flex flex-col overflow-y-auto justify-center lg:justify-start lg:pt-10 lg:pl-10">
      {navItems.map((item) => {
        const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
        return (
          <div
            key={item.label}
            onClick={() => router.push(item.path)}
            className={`flex items-center gap-3 px-5 py-[3px] text-md lg:text-xl transition-all duration-150 cursor-pointer
              ${isActive
                ? "text-[#e2554f] font-heading font-semibold"
                : "text-black font-heading font-normal hover:text-[#e2554f]"
              }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </div>
        );
      })}

      {/* Log out — handled separately, not a nav route */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-5 py-[3px] text-md lg:text-xl transition-all duration-150 text-black font-heading font-normal hover:text-[#e2554f] w-full text-left"
      >
        <Logs size={20} />
        <span>Log out</span>
      </button>
    </div>
  );
};

export default Sidebar;