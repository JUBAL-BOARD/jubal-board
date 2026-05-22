"use client";
import { useState } from "react";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import logo from "../../assets/icononly.png";

interface ServiceCardProps {
  label: string;
  bg: string | StaticImageData;
  categoryId?: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ label, bg, categoryId }) => {
  const [hovered, setHovered] = useState<boolean>(false);

  return (
    <Link href={categoryId ? `/client/explore-skills/${categoryId}` : "/client/explore-skills"}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative overflow-hidden w-full aspect-square cursor-pointer transition-transform duration-200"
        style={{ transform: hovered ? "scale(1.02)" : "scale(1)" }}
      >
        <Image
          src={logo}
          alt={label}
          fill
          className="object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 h-[15%] flex items-center justify-center px-3.5 bg-[#1c1c3a]">
          <span className="text-white font-semibold text-xs sm:text-sm">{label}</span>
        </div>
      </div>
    </Link>
  );
};

export default ServiceCard;