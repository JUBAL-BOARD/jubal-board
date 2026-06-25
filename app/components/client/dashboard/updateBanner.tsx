"use client";
import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { HourGlass, Rocket } from "@/app/icons";
import Link from "next/link";

interface Banner {
  id: number;
  title: string;
  message: string;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  textColor: string;
  animation: "tick" | "launch";
}

const banners: Banner[] = [
  {
    id: 1,
    title: "Verification Pending",
    message: "Bigger jobs are locked until approved.",
    icon: HourGlass,
    iconColor: "#3A8DE8",
    bgColor: "#E8F5FF",
    textColor: "black",
    animation: "tick",
  },
  {
    id: 2,
    title: "Verification Complete",
    message: "You can now post bigger jobs.",
    icon: Rocket,
    iconColor: "#E2554F",
    bgColor: "#FFEAEA",
    textColor: "black",
    animation: "launch",
  },
  {
    id: 3,
    title: "App Update Ready!",
    message: "Bigger jobs are locked until approved.",
    icon: HourGlass,
    iconColor: "#3A8DE8",
    bgColor: "#E8F5FF",
    textColor: "black",
    animation: "tick",
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

  return (
    <div ref={containerRef} className="relative w-full mb-5">
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        {banners.map((banner) => {
          const Icon = banner.icon;
          return (
            <Link href="/client/notifications" key={banner.id} className="flex-1">
              <div
                className="flex items-center justify-between rounded-[10px] h-[61px] w-full p-[35px]"
                style={{ background: banner.bgColor }}
              >
                <div className="flex items-center gap-3.5">
                  <span className={`icon-${banner.animation} inline-flex`}>
                    <Icon size={29} color={banner.iconColor} />
                  </span>
                  <div>
                    <p
                      className="m-0 font-heading font-bold text-[18px]"
                      style={{ color: banner.textColor }}
                    >
                      {banner.title}
                    </p>
                    <p
                      className="m-0 text-[12px] font-body font-medium mt-0.5"
                      style={{ color: banner.textColor }}
                    >
                      {banner.message}
                    </p>
                  </div>
                </div>
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setVisible(false);
                  }}
                  className="cursor-pointer p-1"
                >
                  <X size={16} stroke="black" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

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

      <style jsx global>{`
        /* Hourglass: gentle tick/flip, suggests time passing while waiting */
        @keyframes tick {
          0%, 40% { transform: rotate(0deg); }
          50% { transform: rotate(180deg); }
          90%, 100% { transform: rotate(180deg); }
        }
        .icon-tick {
          animation: tick 3s ease-in-out infinite;
        }

        /* Rocket: launches up then resets */
        @keyframes launch {
          0% { transform: translateY(0) rotate(0deg); }
          15% { transform: translateY(2px) rotate(-3deg); }
          50% { transform: translateY(-10px) rotate(0deg); }
          100% { transform: translateY(0) rotate(0deg); }
        }
        .icon-launch {
          animation: launch 1.8s cubic-bezier(0.45, 0, 0.55, 1) infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .icon-tick,
          .icon-launch {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

export default UpdateBanner;