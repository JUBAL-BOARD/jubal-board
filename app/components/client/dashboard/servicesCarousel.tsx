"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import logo from "../../../assets/icononly.png";

interface PlatformService {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  skills: { id: string; name: string; serviceId: string; isActive: boolean }[];
}

const CARD_WIDTH = 300;
const GAP = 14;

const ServicesCarousel: React.FC = () => {
  const [current, setCurrent] = useState<number>(0);
  const [services, setServices] = useState<PlatformService[]>([]);
  const [loading, setLoading] = useState(true);
  const isHovered = useRef(false);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const tokenRes = await fetch("/api/auth/session/token");
        const { token } = await tokenRes.json();
        const res = await fetch("/api/v1/platform-services", {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to fetch services");
        const json = await res.json();
        const list = Array.isArray(json) ? json : Array.isArray(json.data) ? json.data : [];
        setServices(list);
      } catch {
        // fail silently
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Auto-slide
  useEffect(() => {
    if (services.length === 0) return;
    const interval = setInterval(() => {
      if (isHovered.current) return;
      setCurrent((prev) => (prev + 1) % services.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [services]);

  if (loading) {
    return (
      <div className="mb-8 bg-[#fafafa] p-5">
        <h3 className="text-[26px] font-extrabold font-heading text-black m-0 mb-4">
          Services you may like
        </h3>
        <div className="flex gap-3.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg min-w-[300px] h-[300px] flex-shrink-0 bg-gray-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (services.length === 0) return null;

  return (
    <div className="mb-8 bg-[#fafafa] p-5">
      <h3 className="text-[26px] font-extrabold font-heading text-black m-0 mb-4">
        Services you may like
      </h3>

      {/* Outer clip */}
      <div
        className="overflow-hidden"
        onMouseEnter={() => (isHovered.current = true)}
        onMouseLeave={() => (isHovered.current = false)}
      >
        {/* Sliding track */}
        <div
          className="flex pb-1"
          style={{
            gap: GAP,
            transform: `translateX(-${current * (CARD_WIDTH + GAP)}px)`,
            transition: "transform 0.8s ease-in-out",
          }}
        >
          {services.map((service) => (
            <div
              key={service.id}
              className="relative rounded-lg overflow-hidden min-w-[300px] h-[300px] flex-shrink-0 cursor-pointer"
            >
              <Image src={logo} alt={service.name} fill className="object-cover" />
              <div className="absolute bottom-0 left-0 right-0 h-[20%] flex items-center justify-center px-3 bg-[#1c1c3a]">
                <span className="text-white font-semibold text-[13px]">{service.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mt-3.5">
        {services.map((_, i) => (
          <div
            key={i}
            onClick={() => setCurrent(i)}
            className="h-2 rounded-full cursor-pointer transition-all duration-200"
            style={{ width: 8, background: i === current ? "#E2554F" : "#d1d5db" }}
          />
        ))}
      </div>
    </div>
  );
};

export default ServicesCarousel;