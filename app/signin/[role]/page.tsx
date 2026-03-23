"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import logo from "../../assets/icononly.png";
import { Eye, EyeOff, Apple } from "lucide-react";

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
  </svg>
);

const roleConfig = {
  creative: {
    image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800&q=80",
    nextRoute: "/tell-us",
  },
  client: {
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80",
    nextRoute: "/brand-profile",
  },
};

const SignIn: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const role = params.role as keyof typeof roleConfig;
  const config = roleConfig[role] ?? roleConfig.creative;

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSignIn = () => {
    if (!form.email || !form.password) return;
    router.push(config.nextRoute);
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen lg:h-screen w-screen lg:overflow-hidden">

      {/* Left — Full height image */}
      <div className="hidden lg:block relative w-full h-[220px] sm:h-[280px] lg:flex-1 lg:h-full flex-shrink-0">
        <Image
          src={config.image}
          alt="signin background"
          fill
          className="object-cover object-center"
          priority
        />
      </div>

      {/* Right — Form panel */}
      <div className="w-full lg:w-[700px] h-screen lg:flex-shrink-0 flex items-center justify-center px-5 sm:px-8 lg:px-12 py-8 lg:py-10 bg-white overflow-y-auto">
        <div className="w-full max-w-[380px]">

          {/* Logo */}
          <div className="flex justify-center mb-4 lg:mb-5">
            <Image
              src={logo}
              alt="Jubal Board logo"
              width={100}
              height={100}
              className="object-contain w-[70px] lg:w-[100px]"
            />
          </div>

          {/* Heading */}
          <h1 className="text-xl lg:text-[26px] font-extrabold text-[#1a1a2e] text-center mb-2">
            Welcome Back!
          </h1>
          <p className="text-sm lg:text-base text-black text-center mb-5 lg:mb-7 leading-relaxed">
            Continue creating, connecting, and collaborating.
          </p>

          {/* Fields */}
          <div className="flex flex-col gap-3 mb-1.5">
            <input
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="Email Address"
              type="email"
              className="w-full border border-gray-200 rounded-lg px-3.5 py-3 text-sm text-black outline-none bg-white box-border"
            />
            <div className="relative">
              <input
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                className="w-full border border-gray-200 rounded-lg px-3.5 py-3 pr-10 text-sm text-black outline-none bg-white box-border"
              />
              <button
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer p-0 flex"
              >
                {showPassword
                  ? <EyeOff size={18} stroke="#9CA3AF" />
                  : <Eye size={18} stroke="#9CA3AF" />
                }
              </button>
            </div>
          </div>

          {/* Forgot password */}
          <div className="text-left mb-5">
            <span
              onClick={() => router.push("/forgot-password")}
              className="text-[13px] text-[#E2554F] font-medium cursor-pointer hover:underline"
            >
              Forgot Password?
            </span>
          </div>

          {/* Sign in button */}
          <button
            onClick={handleSignIn}
            className="w-full bg-[#E2554F] border-none rounded-lg py-3 lg:py-3.5 cursor-pointer text-white font-bold text-[15px] mb-3 lg:mb-3.5 hover:bg-[#d44a44] transition-colors"
          >
            Sign in
          </button>

          {/* Create account */}
          <p className="text-center text-[13px] text-black mb-5">
            Don't have an account?{" "}
            <span
              onClick={() => router.push("/onboarding")}
              className="text-[#E2554F] font-semibold cursor-pointer hover:underline"
            >
              Create one
            </span>
          </p>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4 lg:mb-5">
            <div className="flex-1 h-px bg-black" />
            <span className="text-[13px] text-black whitespace-nowrap">Or continue with</span>
            <div className="flex-1 h-px bg-black" />
          </div>

          {/* Social buttons */}
          <div className="flex gap-2 lg:gap-2.5 mb-5 lg:mb-6">
            {[
              { icon: <GoogleIcon />, label: "Google" },
              { icon: <Apple size={18} fill="#1a1a2e" stroke="none" />, label: "Apple" },
              { icon: <FacebookIcon />, label: "Facebook" },
            ].map(({ icon, label }) => (
              <button
                key={label}
                className="flex-1 flex items-center justify-center gap-1.5 lg:gap-2 bg-white border border-gray-200 rounded-lg py-2 lg:py-2.5 cursor-pointer text-[12px] lg:text-[13px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {icon} {label}
              </button>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default SignIn;