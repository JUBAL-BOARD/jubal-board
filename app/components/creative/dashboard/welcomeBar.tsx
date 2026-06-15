"use client";
import { useState, useEffect } from "react";

interface Props {
  userName: string;
}

const WelcomeBar: React.FC<Props> = ({ userName }) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [accountType, setAccountType] = useState<"Personal" | "Business">("Personal");

  const getHeaders = async () => {
    const tokenRes = await fetch("/api/auth/session/token");
    const { token } = await tokenRes.json();
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const headers = await getHeaders();
        const res = await fetch("/api/v1/creatives/me/online-status", {
          method: "GET",
          credentials: "include",
          headers,
        });
        const data = await res.json();
        const status = data?.data?.showOnlineStatus ?? data?.showOnlineStatus;
        if (typeof status === "boolean") {
          setIsOnline(status);
        }
      } catch (err) {
        console.error("Failed to fetch online status:", err);
      }
    };
    fetchStatus();
  }, []);

  const toggleOnlineStatus = async () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus); // optimistic update
    setLoading(true);

    try {
      const headers = await getHeaders();
      const res = await fetch("/api/v1/creatives/me/online-status", {
        method: "PATCH",
        credentials: "include",
        headers,
        body: JSON.stringify({ showOnlineStatus: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");
    } catch (err) {
      console.error("Failed to update online status:", err);
      setIsOnline(!newStatus); // revert on failure
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lg:flex items-end justify-between mb-5">
      {/* Left — Welcome text */}
      <div className="flex lg:block gap-3">
        <h2 className="font-heading m-0 lg:mt-1 text-lg lg:text-[28px] font-extrabold text-black">
          Hey, {userName} 👋
        </h2>
        <p className="font-body m-0 text-lg lg:text-lg text-black">Ready to create today?</p>
      </div>

      {/* Right — Toggles */}
      <div className="flex justify-around lg:items-center gap-3 lg:gap-5">
        {/* Online/Offline Toggle */}
        <div className="flex items-center gap-2">
          <div
            onClick={() => !loading && toggleOnlineStatus()}
            className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${
              loading ? "cursor-not-allowed opacity-60" : "cursor-pointer"
            }`}
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