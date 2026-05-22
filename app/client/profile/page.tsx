"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "../../assets/logo.png";
import { User, Building2 } from "lucide-react";
import youngwoman from "../../assets/young woman in headphones with laptop.png";
import { Business, Individual } from "@/app/icons";

const ProfileTypeSelection: React.FC = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen w-screen bg-white font-sans flex flex-col">
      {/* Navbar */}
      <div className="flex items-center gap-2.5 px-[42px] bg-[#fafafa] h-[100px] border-b border-gray-200">
        <Image src={logo} alt="Jubal Board logo" width={120} height={120} className="object-contain" />
      </div>

      {/* Content */}
      <div className="flex flex-1 items-center justify-center py-16 px-4">
        <div className="flex flex-col items-center text-center max-w-[340px] w-full">

          {/* Illustration */}
          <div className="mb-6">
            <Image src={youngwoman} alt="Profile setup illustration" width={200} height={200} className="object-contain" />
          </div>

          {/* Heading */}
          <h1 className="text-[22px] font-black text-[#E2554F] font-heading leading-tight mb-3">
            Your journey starts<br />with a profile.
          </h1>

          {/* Subtext */}
          <p className="text-[14px] text-black font-body leading-relaxed mb-8">
            Create your business or personal profile to find trusted creatives and manage projects with ease.
          </p>

          {/* Buttons */}
          <div className="flex gap-4 w-full">
            <button
              onClick={() => router.push("/client/profile/individual")}
              className="flex-1 flex items-center justify-center gap-2.5 bg-[#E2554F] text-white font-heading font-bold text-[15px] rounded-xl py-4 border-none cursor-pointer hover:bg-[#d44a44] transition-colors"
            >
              <Individual size={20} stroke="white" />
              Individual
            </button>

            <button
              onClick={() => router.push("/client/profile/business")}
              className="flex-1 flex items-center justify-center gap-2.5 bg-[#E2554F] font-heading text-white font-bold text-[15px] rounded-xl py-4 border-none cursor-pointer hover:bg-[#d44a44] transition-colors"
            >
              <Business size={20} stroke="white" />
              Business
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfileTypeSelection;