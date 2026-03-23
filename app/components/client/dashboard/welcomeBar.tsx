"use client";

import { useState } from "react";

interface Props {
  userName: string;
}

const WelcomeBar: React.FC<Props> = ({ userName }) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [accountType, setAccountType] = useState<"Personal" | "Business">("Personal");

  return (
    <div className="lg:flex items-end justify-between mb-5">

      {/* Left — Welcome text */}
      <div className="flex lg:block gap-3">
        <p className="m-0 text-lg lg:text-lg text-black">Welcome Back</p>
        <h2 className="m-0 lg:mt-1 text-lg lg:text-[28px] font-extrabold text-black">
          {userName}
        </h2>
      </div>

      {/* Right — Toggles */}
      <div className="flex justify-around lg:items-center gap-3 lg:gap-5">

        {/* Online/Offline Toggle */}
        <div className="flex items-center gap-2">
          <div
            onClick={() => setIsOnline(!isOnline)}
            className="w-11 h-6 rounded-full cursor-pointer relative transition-colors duration-200"
            style={{ background: isOnline ? "#22C55E" : "#D1D5DB" }}
          >
            <div
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200"
              style={{ left: isOnline ? 22 : 2 }}
            />
          </div>
          <span
            className="text-[13px] font-semibold"
            style={{ color: isOnline ? "#22C55E" : "#9CA3AF" }}
          >
            {isOnline ? "Online" : "Offline"}
          </span>
        </div>

        {/* Personal / Business Pill Toggle */}
        <div className="flex items-center bg-gray-100 rounded-full p-1">
          {(["Personal", "Business"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setAccountType(type)}
              className={`px-3 py-1 rounded-full text-[12px] lg:text-[13px] font-semibold transition-all duration-200
                ${accountType === type
                  ? "bg-[#22C55E] text-black shadow-sm"
                  : "text-gray-400"
                }`}
            >
              {type}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};

export default WelcomeBar;