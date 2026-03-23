"use client";
import { useState, useEffect, useRef } from "react";
import { Rocket, X, Bell } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface Banner {
  id: number;
  title: string;
  message: string;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
  borderColor: string;
}

const banners: Banner[] = [
  {
    id: 1,
    title: "Go Premium, Go Further!",
    message: "Access more opportunities and earn more with premium.",
    icon: Rocket,
    iconColor: "red",
    bgColor: "#f99b98",
    borderColor: "#fcd9cc",
  },
  {
    id: 2,
    title: "Deliverables due in 48 hours",
    message: "Don't miss your deadline. Upload your files on time.",
    icon: Bell,
    iconColor: "#3A8DE8",
    bgColor: "#98c5f9",
    borderColor: "#cce0fd",
  },
  {
    id: 3,
    title: "App Update Ready!",
    message: "Enjoy new features and improvements. Update now for a smoother experience.",
    icon: Rocket,
    iconColor: "#E85D3A",
    bgColor: "#f99b98",
    borderColor: "#fcd9cc",
  },
];

const UpdateBanner: React.FC = () => {
  const [visible, setVisible] = useState<boolean>(true);
  const [current, setCurrent] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  const containerWidth = containerRef.current?.offsetWidth ?? 0;

  return (
    <div ref={containerRef} className="relative w-full mb-5 overflow-hidden">
      {/* Sliding track */}
      <div
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${current * containerWidth}px)` }}
      >
        {banners.map((banner) => {
          const Icon = banner.icon;
          return (
            <div
              key={banner.id}
              className="flex-shrink-0 flex items-center justify-between rounded-[10px] px-[18px] py-3.5"
              style={{
                width: `${containerWidth}px`,
                backgroundColor: banner.bgColor,
                border: `1px solid ${banner.borderColor}`,
              }}
            >
              <div className="flex items-center gap-3.5">
                <Icon size={29} stroke={banner.iconColor} />
                <div>
                  <p className="m-0 font-bold text-lg lg:text-2xl text-black">{banner.title}</p>
                  <p className="m-0 text-sm lg:text-lg text-black mt-0.5">{banner.message}</p>
                </div>
              </div>
              <div onClick={() => setVisible(false)} className="cursor-pointer p-1">
                <X size={16} stroke="black" />
              </div>
            </div>
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
              width: i === current ? "8px" : "8px",
              opacity: i === current ? 1 : 0.2,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default UpdateBanner;