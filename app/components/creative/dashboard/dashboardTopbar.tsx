import Image from "next/image";
import logo from "../../../assets/icononly.png";
import { Bell, Menu, Settings, X } from "lucide-react";
import Link from "next/link";

interface Props {
  userName: string;
  userAvatar: string;
  sidebarOpen?: boolean;
  onMenuClick?: () => void;
}

const DashboardTopbar: React.FC<Props> = ({ userName, userAvatar, sidebarOpen, onMenuClick }) => {
  return (
    <div className="flex items-center justify-between px-4 lg:px-7 h-[120px] lg:h-[90px] bg-white border-b border-[#f0f0f0] sticky top-0 z-[100]">

      {/* Left — Hamburger/X toggle (mobile only) + Logo */}
      <div className="flex items-center">

        <Image
          src={logo}
          alt="Jubal Board logo"
          width={120}
          height={120}
          className="object-contain w-[80px] lg:w-[100px]"
        />
        <h1 className="hidden lg:block font-heading font-bold text-black text-2xl">JUBALBOARD</h1>
      </div>

      {/* Right — Icons + Avatar */}
      <div className="flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-4">
          <Link href="/creative/notifications">
            <div className="cursor-pointer">
              <Bell size={20} stroke="#374151" />
            </div>
          </Link>
          <Link href="/creative/settings">
            <div className="cursor-pointer">
              <Settings size={20} stroke="#374151" />
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2.5 cursor-pointer">
          <Link href="/creative/my-profile">
            {userAvatar.startsWith('data:') ? (
              <img
                src={userAvatar}
                alt={userName}
                width={36}
                height={36}
                className="rounded-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <Image
                src={userAvatar}
                alt={userName}
                width={36}
                height={36}
                className="rounded-full object-cover"
              />
            )}
          </Link>
          <span className="hidden lg:block text-[14px] font-semibold text-[#1a1a2e]">
            {userName}
          </span>
          <button className="lg:hidden" onClick={onMenuClick}>
            {sidebarOpen ? <X size={24} stroke="black" /> : <Menu size={24} stroke="black" />}
          </button>
        </div>
      </div>

    </div>
  );
};

export default DashboardTopbar;