"use client";
import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { Belll, HourGlass, Rocket } from "@/app/icons";
import Link from "next/link";

interface Banner {
  id: number;
  title: string;
  message: string;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

const banners: Banner[] = [
  {
    id: 1,
    title: "Verification Pending",
    message: "Bigger jobs are locked until approved.",
    icon: HourGlass,
    iconColor: "#3A8DE8",
    bgColor: "#E8F5FF",
    borderColor: "#fcd9cc",
    textColor: "black",
  },
  {
    id: 2,
    title: "Verification Complete",
    message: "You can now post bigger jobs.",
    icon: Rocket,
    iconColor: "red",
    bgColor: "#FFEAEA",
    borderColor: "#cce0fd",
    textColor: "black",
  },
  {
    id: 3,
    title: "App Update Ready!",
    message: "Bigger jobs are locked until approved.",
    icon: HourGlass,
    iconColor: "#3A8DE8",
    bgColor: "#E8F5FF",
    borderColor: "#fcd9cc",
    textColor: "black",
  },
];

const UpdateBanner: React.FC = () => {
  const [visible, setVisible] = useState<boolean>(true);
  const [current, setCurrent] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep the auto-cycle for dot indicator highlight even though banners are static
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <div ref={containerRef} className="relative w-full mb-5">
      {/* All three banners side by side */}
      <div className="lg:flex gap-3">
        {banners.map((banner) => {
          const Icon = banner.icon;
          return (
            <Link href="/client/notifications">
              <div
                key={banner.id}
                className="flex-1 flex items-center justify-between rounded-[10px] px-[18px] py-3.5"
                style={{
                  background: banner.bgColor,
                  border: `1px solid ${banner.borderColor}`,
                }}
              >
                <div className="flex items-center gap-3.5">
                  <Icon size={29} stroke={banner.iconColor} />
                  <div>
                    <p className="m-0 font-heading font-bold text-lg lg:text-xl" style={{ color: banner.textColor }}>{banner.title}</p>
                    <p className="m-0 text-sm font-body lg:text-md mt-0.5" style={{ color: banner.textColor }}>{banner.message}</p>
                  </div>
                </div>
                <div onClick={() => setVisible(false)} className="cursor-pointer p-1">
                  <X size={16} stroke="black" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mt-2">
        {banners.map((banner, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="h-2 rounded-full transition-all duration-300"
            style={{
              backgroundColor: banner.iconColor,
              width: "8px",
              opacity: i === current ? 1 : 0.2,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default UpdateBanner;