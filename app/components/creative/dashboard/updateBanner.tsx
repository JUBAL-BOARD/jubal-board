"use client";
import { useState, useEffect, useRef } from "react";
import { LucideIcon, Bell, Rocket } from "lucide-react";
import Link from "next/link";

interface Banner {
  id: number;
  title: string;
  message: string;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  animation: "launch" | "ring" | "pulse";
}

const banners: Banner[] = [
  {
    id: 1,
    title: "Go Premium, Go Further!",
    message: "Access more opportunities and earn more with premium.",
    icon: Rocket,
    iconColor: "white",
    bgColor: "linear-gradient(to right, #E2554F, #3D0A0A)",
    borderColor: "#fcd9cc",
    textColor: "white",
    animation: "launch",
  },
  {
    id: 2,
    title: "Deliverables due in 48 hours",
    message: "Don't miss your deadline. Upload your files on time.",
    icon: Bell,
    iconColor: "#3A8DE8",
    bgColor: "#E8F5FF",
    borderColor: "#cce0fd",
    textColor: "black",
    animation: "ring",
  },
  {
    id: 3,
    title: "App Update Ready!",
    message: "Enjoy new features and improvements. Update now for a smoother experience.",
    icon: Rocket,
    iconColor: "#E85D3A",
    bgColor: "#FFEAEA",
    borderColor: "#fcd9cc",
    textColor: "black",
    animation: "pulse",
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
            <Link href="/creative/notifications" key={banner.id} className="flex-1">
              <div
                className="flex items-center justify-between rounded-[10px] h-[101px] w-full p-[35px]"
                style={{
                  background: banner.bgColor,
                  border: `1px solid ${banner.borderColor}`,
                }}
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
        /* Rocket: launches up then resets, like a thrust loop */
        @keyframes launch {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          15% {
            transform: translateY(2px) rotate(-3deg); /* anticipation crouch */
          }
          50% {
            transform: translateY(-10px) rotate(0deg);
          }
          100% {
            transform: translateY(0) rotate(0deg);
          }
        }
        .icon-launch {
          animation: launch 1.8s cubic-bezier(0.45, 0, 0.55, 1) infinite;
        }

        /* Bell: rings side to side */
        @keyframes ring {
          0%, 100% { transform: rotate(0deg); }
          10% { transform: rotate(-15deg); }
          20% { transform: rotate(13deg); }
          30% { transform: rotate(-10deg); }
          40% { transform: rotate(8deg); }
          50% { transform: rotate(-4deg); }
          60% { transform: rotate(2deg); }
          70%, 100% { transform: rotate(0deg); }
        }
        .icon-ring {
          transform-origin: top center;
          animation: ring 2.5s ease-in-out infinite;
        }

        /* Pulse: gentle scale breathing, good for "update available" */
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.85; }
        }
        .icon-pulse {
          animation: pulse 1.6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default UpdateBanner;