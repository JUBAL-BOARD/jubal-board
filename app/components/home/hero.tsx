"use client";

import { Search, ChevronDown, Play } from "lucide-react";
import Image from "next/image";

const Hero: React.FC = () => {
  return (
    <div className="relative h-[620px] overflow-hidden">
      
      {/* Background Image */}
      <Image
        src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80"
        alt="hero background"
        fill
        className="object-cover"
        priority
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[rgba(15,15,40,0.82)] via-[rgba(15,15,40,0.6)] to-[rgba(15,15,40,0.4)]" />

      {/* Content */}
      <div className="absolute top-40 left-10">
        <h1 className="text-white text-5xl font-extrabold mb-2 leading-relaxed">
          Why work should work
        </h1>
        <p className="text-white/90 text-xl max-w-[420px] leading-relaxed">
          Forget the old rules. You can have the best people. Right Now. Right Here.
        </p>

        {/* Search Bar */}
        <div className="flex bg-white mt-[120px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.2)] w-[1000px]">
          
          <button className="flex items-center gap-1.5 px-5 bg-transparent border-none border-r border-gray-200 cursor-pointer text-sm font-medium text-gray-700 whitespace-nowrap hover:bg-gray-50 transition-colors">
            Creative <ChevronDown size={16} />
          </button>

          <button className="flex items-center gap-1.5 px-5 bg-transparent border-none border-r border-gray-200 cursor-pointer text-sm font-medium text-gray-700 whitespace-nowrap hover:bg-gray-50 transition-colors">
            Project <ChevronDown size={16} />
          </button>

          <input
            placeholder='Try "web developer or logo design"'
            className="flex-1 border-none outline-none px-4 py-3.5 text-sm bg-white text-gray-500 placeholder:text-gray-400"
          />

          <button className="bg-[#E2554F] border-none px-7 cursor-pointer text-white font-semibold text-[15px] flex items-center gap-2 hover:bg-[#d44a44] transition-colors">
            <Search size={16} /> Search
          </button>

        </div>
      </div>

      {/* Play Button */}
      <div className="absolute right-5 bottom-5 w-10 h-10 rounded-full bg-white/20 border-2 border-white/60 flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
        <Play size={16} className="text-white fill-white" />
      </div>

    </div>
  );
};

export default Hero;