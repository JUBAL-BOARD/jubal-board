"use client";

import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import logo from "../../assets/logo.png";
import RoleSelectModal from "./roleSelectModal";
import { useState } from "react";

const navItems: string[] = ["Find Creative", "Find Project", "Why Jubal Board"];

const Navbar: React.FC = () => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <nav className="flex items-center justify-between px-8 h-[90px] bg-white border-b border-gray-100 sticky top-0 z-[100] shadow-sm">

        {/* Logo */}
        <div className="flex items-center gap-2">
          <Image
            src={logo}
            alt="Jubal Board logo"
            width={200}
            height={200}
            className="object-contain"
          />
        </div>

        {/* Nav Links */}
        <div className="flex items-center gap-7">
          {navItems.map((item) => (
            <button
              key={item}
              className="flex items-center gap-1 bg-transparent border-none cursor-pointer text-sm text-gray-700 font-medium hover:text-gray-900 transition-colors"
            >
              {item} <ChevronDown size={16} />
            </button>
          ))}
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="bg-transparent border-[1.5px] border-gray-700 rounded-md px-5 py-[7px] cursor-pointer font-semibold text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Log in
          </button>
          <button
            onClick={() => router.push("/onboarding")}
            className="bg-[#E2554F] border-none rounded-md px-5 py-2 cursor-pointer font-semibold text-sm text-white hover:bg-[#d44a44] transition-colors"
          >
            Join Now
          </button>
        </div>
      </nav>
      {showModal && <RoleSelectModal onClose={() => setShowModal(false)} />}
    </>
  );
};

export default Navbar;