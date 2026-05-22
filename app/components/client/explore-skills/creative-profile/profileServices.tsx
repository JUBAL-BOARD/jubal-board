"use client";

import { useState } from "react";
import { Check } from "lucide-react";

interface Props {
  services: string[];
}

const ProfileServices: React.FC<Props> = ({ services }) => {
  const [active, setActive] = useState(services[0]);

  return (
    <div className="bg-[#fafafa] p-5">
      <h3 className="font-bold text-black text-2xl mb-3">Services</h3>
      <div className="flex flex-wrap gap-2">
        {services.map((service) => (
          <button
            key={service}
            onClick={() => setActive(service)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              active === service
                ? "bg-[#1a1a2e] text-white"
                : "border border-gray-200 text-black hover:bg-gray-50"
            }`}
          >
            {active === service && <Check size={12} strokeWidth={3} />}
            {service}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProfileServices;