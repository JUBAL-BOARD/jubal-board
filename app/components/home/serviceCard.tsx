"use client";

import { useState } from "react";
import Image from "next/image";

interface ServiceCardProps {
  label: string;
  bg: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ label, bg }) => {
  const [hovered, setHovered] = useState<boolean>(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative overflow-hidden w-[250px] h-[250px] cursor-pointer transition-transform duration-200"
      style={{ transform: hovered ? "scale(1.02)" : "scale(1)" }}
    >
      <Image
        src={bg}
        alt={label}
        fill
        className="object-cover"
      />

      {/* Label Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[15%] flex items-center justify-center px-3.5 bg-[#1c1c3a]">
        <span className="text-white font-semibold text-sm">{label}</span>
      </div>
    </div>
  );
};

export default ServiceCard;