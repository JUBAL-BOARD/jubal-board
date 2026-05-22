"use client";
import { ChevronDown, Menu, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import logo from "../../assets/icononly.png";
import RoleSelectModal from "./roleSelectModal";
import { useState } from "react";
import Link from "next/link";

const navItems: string[] = ["Find Creative", "Find Project", "Why Jubal Board"];

const Navbar: React.FC = () => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-[100] shadow-sm">
        {/* Main Row */}
        <div className="flex items-center justify-between px-4 sm:px-8 h-[70px] sm:h-[90px]">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-2">
              <Image
                src={logo}
                alt="Jubal Board logo"
                width={120}
                height={120}
                className="object-contain w-[80px] lg:w-[100px]"
              />
              <h1 className="hidden lg:block font-heading font-bold text-black text-2xl">JUBALBOARD</h1>
            </div>
          </Link>

          {/* Nav Links — desktop only */}
          <div className="hidden lg:flex items-center gap-7">
            {navItems.map((item) => (
              <button
                key={item}
                className="flex items-center gap-1 bg-transparent border-none cursor-pointer text-sm text-gray-700 font-medium hover:text-gray-900 transition-colors"
              >
                {item} <ChevronDown size={16} />
              </button>
            ))}
          </div>

          {/* Auth Buttons — desktop only */}
          <div className="hidden lg:flex items-center gap-3">
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

          {/* Hamburger — mobile only */}
          <button
            className="lg:hidden bg-transparent border-none cursor-pointer text-gray-700 p-1"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden border-t border-gray-100 px-4 py-4 flex flex-col gap-3 bg-white">
            {navItems.map((item) => (
              <button
                key={item}
                className="flex items-center gap-1 bg-transparent border-none cursor-pointer text-sm text-gray-700 font-medium hover:text-gray-900 transition-colors py-2 w-full text-left"
              >
                {item} <ChevronDown size={16} />
              </button>
            ))}
            <div className="flex flex-col gap-2.5 pt-2 border-t border-gray-100">
              <button
                onClick={() => { setShowModal(true); setMenuOpen(false); }}
                className="bg-transparent border-[1.5px] border-gray-700 rounded-md px-5 py-2 cursor-pointer font-semibold text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full"
              >
                Log in
              </button>
              <button
                onClick={() => { router.push("/onboarding"); setMenuOpen(false); }}
                className="bg-[#E2554F] border-none rounded-md px-5 py-2 cursor-pointer font-semibold text-sm text-white hover:bg-[#d44a44] transition-colors w-full"
              >
                Join Now
              </button>
            </div>
          </div>
        )}
      </nav>

      {showModal && <RoleSelectModal onClose={() => setShowModal(false)} />}
    </>
  );
};

export default Navbar;