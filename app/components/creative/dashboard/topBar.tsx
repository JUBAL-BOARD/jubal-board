"use client";

import { useState } from "react";
import { Search, SlidersHorizontal, ChevronDown } from "lucide-react";

interface TopBarProps {
  userName: string;
  isOnline: boolean;
}

export default function TopBar({ userName, isOnline }: TopBarProps) {
  const [mode, setMode] = useState<"personal" | "business">("personal");

  return (
    <div className="w-full">
      {/* Banners */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-red-500 rounded-xl p-3 flex items-center gap-3 text-white">
          <span className="text-2xl">🚀</span>
          <div>
            <p className="font-semibold text-sm">Go Premium, Go Further!</p>
            <p className="text-xs text-red-100">Access more opportunities and earn more with premium</p>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold text-sm text-amber-800">Deliverables due in 48 hours</p>
            <p className="text-xs text-amber-600">Don&apos;t miss your deadline. Upload your files on time.</p>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-3">
          <span className="text-2xl">🚀</span>
          <div>
            <p className="font-semibold text-sm text-blue-800">App Update Available</p>
            <p className="text-xs text-blue-600">We&apos;ve added new features. Update now.</p>
          </div>
        </div>
      </div>

      {/* Greeting + mode toggle */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hey, {userName.split(" ")[0]} 👋</h2>
          <p className="text-gray-500 text-sm mt-0.5">Ready to create today?</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-green-500 text-white rounded-full px-4 py-1.5 text-sm font-medium">
            <span className="w-2 h-2 bg-white rounded-full" />
            Online
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <span className={mode === "personal" ? "text-green-500 font-medium" : ""}>Personal</span>
            <button
              onClick={() => setMode(mode === "personal" ? "business" : "personal")}
              className={`relative w-9 h-5 rounded-full mx-1 transition-colors ${mode === "business" ? "bg-green-500" : "bg-gray-200"}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${mode === "business" ? "translate-x-4" : "translate-x-0.5"}`} />
            </button>
            <span className={mode === "business" ? "text-green-500 font-medium" : ""}>Business</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 mb-7">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search creative, categories or anything"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors">
          <SlidersHorizontal size={15} className="text-red-400" />
          Filter By
          <ChevronDown size={14} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-green-100 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-400 rounded-xl flex items-center justify-center text-white text-xl">✅</div>
          <div>
            <p className="text-3xl font-bold text-gray-900">30</p>
            <p className="text-sm text-gray-500 font-medium">Active Projects</p>
          </div>
        </div>
        <div className="bg-purple-100 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-400 rounded-xl flex items-center justify-center text-white text-xl">📤</div>
          <div>
            <p className="text-3xl font-bold text-gray-900">10</p>
            <p className="text-sm text-gray-500 font-medium">Pending Pitches</p>
          </div>
        </div>
        <div className="bg-amber-100 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-400 rounded-xl flex items-center justify-center text-white text-xl">💰</div>
          <div>
            <p className="text-3xl font-bold text-gray-900">$400</p>
            <p className="text-sm text-gray-500 font-medium">Earnings this week</p>
          </div>
        </div>
      </div>
    </div>
  );
}