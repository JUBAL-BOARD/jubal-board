"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "../assets/logo.png";
import { ArrowRight, Play } from "lucide-react";
import Footer from "../components/home/footer";

const slides = [
  { image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80" },
  { image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80" },
  { image: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=600&q=80" },
];

const Onboarding: React.FC = () => {
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="font-sans bg-white min-h-screen w-screen">

      {/* Logo */}
      <div className="flex items-center h-[70px] lg:h-[100px] bg-[#fafafa] px-5 lg:px-10">
        <Image
          src={logo}
          alt="Jubal Board logo"
          width={150}
          height={150}
          className="object-contain w-[110px] lg:w-[150px]"
        />
      </div>

      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-[60px] px-5 lg:px-0 py-8 lg:py-[60px] min-h-[calc(100vh-140px)] lg:min-h-[calc(100vh-180px)]">

        {/* Image Slider */}
        <div className="relative w-full lg:w-[600px] flex-shrink-0">
          <div className="rounded-2xl overflow-hidden h-[240px] sm:h-[340px] lg:h-[600px] relative">
            <Image
              src={slides[activeSlide].image}
              alt="slide"
              fill
              className="object-cover brightness-[0.65] transition-opacity duration-500"
            />
            {/* Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-white/25 border-2 border-white/60 flex items-center justify-center cursor-pointer backdrop-blur-sm hover:bg-white/35 transition-colors">
                <Play size={24} fill="white" stroke="white" />
              </div>
            </div>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-3 lg:mt-4">
            {slides.map((_, i) => (
              <div
                key={i}
                onClick={() => setActiveSlide(i)}
                className="h-2 rounded-full cursor-pointer transition-all duration-200"
                style={{
                  width: 8,
                  background: i === activeSlide ? "#E2554F" : "#d1d5db",
                }}
              />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="w-full lg:max-w-[480px]">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#1a1a2e] leading-tight mb-3 lg:mb-4">
            Welcome to<br />JUBAL BOARD
          </h1>
          <p className="text-base lg:text-[22px] text-gray-700 mb-6 lg:mb-8 leading-snug">
            Select your role to personalize your experience and get started.
          </p>

          {/* Join as Creative */}
          <button
            onClick={() => router.push("/signup/creative")}
            className="w-full flex items-center justify-between bg-[#E2554F] border-none rounded-[10px] px-5 py-3.5 lg:py-4 cursor-pointer mb-3 lg:mb-3.5 hover:bg-[#d44a44] transition-colors"
          >
            <span className="text-sm lg:text-base font-bold text-white">
              Join as Creative
            </span>
            <div className="w-8 h-8 rounded-full bg-white/25 flex items-center justify-center">
              <ArrowRight size={18} stroke="white" />
            </div>
          </button>

          {/* Join as Client */}
          <button
            onClick={() => router.push("/signup/client")}
            className="w-full flex items-center justify-between bg-[#E2554F] border-none rounded-[10px] px-5 py-3.5 lg:py-4 cursor-pointer mb-4 lg:mb-5 hover:bg-[#d44a44] transition-colors"
          >
            <span className="text-sm lg:text-base font-bold text-white">
              Join as Client
            </span>
            <div className="w-8 h-8 rounded-full bg-white/25 flex items-center justify-center">
              <ArrowRight size={18} stroke="white" />
            </div>
          </button>

          <p className="text-sm lg:text-[15px] text-gray-500 m-0 text-center lg:text-left">
            Already have an account?{" "}
            <span
              onClick={() => router.push("/signin/creative")}
              className="text-[#E2554F] font-semibold cursor-pointer hover:underline"
            >
              Sign in
            </span>
          </p>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Onboarding;