"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import logo from "../assets/icononly.png";

const VerifyEmail: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextRoute = searchParams.get("next") ?? "/signin";

  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newCode = [...code];
    pasted.split("").forEach((char, i) => { newCode[i] = char; });
    setCode(newCode);
    const nextEmpty = newCode.findIndex((c) => !c);
    inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
  };

  const handleVerify = () => {
    if (code.join("").length < 6) return;
    router.push(nextRoute);
  };

  const handleResend = () => {
    setCode(["", "", "", "", "", ""]);
    inputRefs.current[0]?.focus();
    alert("Verification code resent!");
  };

  const isComplete = code.every((c) => c !== "");

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-[#fafafa] px-4 py-10">

      {/* Card */}
      <div className="bg-white rounded-2xl px-6 sm:px-10 lg:px-12 py-10 lg:py-14 w-full max-w-[420px] flex flex-col items-center text-center shadow-[0_4px_24px_rgba(0,0,0,0.07)]">

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

        {/* Title */}
        <h1 className="text-xl lg:text-[26px] font-extrabold text-[#1a1a2e] m-0 mb-3">
          Verify Your Email
        </h1>

        {/* Subtitle */}
        <p className="text-xs lg:text-[13px] text-black mb-6 lg:mb-8 leading-[1.7] max-w-[300px]">
          We've sent a <strong>verification link</strong> and a 6-digit code to your email.<br />
          Enter the code below to confirm your account
        </p>

        {/* OTP Inputs */}
        <div className="flex gap-2 sm:gap-2.5 mb-6 lg:mb-7" onPaste={handlePaste}>
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              maxLength={1}
              inputMode="numeric"
              className="w-10 h-10 sm:w-12 sm:h-12 lg:w-[52px] lg:h-[56px] rounded-[6px] lg:rounded-[10px] text-lg lg:text-[22px] font-bold text-center text-[#1a1a2e] outline-none bg-white cursor-text transition-colors duration-150"
              style={{
                border: `2px solid ${digit ? "#E85D3A" : "#e5e7eb"}`,
              }}
            />
          ))}
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={!isComplete}
          className="w-full border-none rounded-lg py-3 lg:py-3.5 text-white font-bold text-sm lg:text-[15px] mb-4 transition-colors duration-200"
          style={{
            background: isComplete ? "#E2554F" : "#f0a090",
            cursor: isComplete ? "pointer" : "not-allowed",
          }}
        >
          Verify Account
        </button>

        {/* Resend */}
        <p className="text-xs lg:text-[13px] text-black m-0">
          Didn't get the code?{" "}
          <span
            onClick={handleResend}
            className="text-[#E2554F] font-semibold cursor-pointer hover:underline"
          >
            Resend
          </span>
        </p>

      </div>
    </div>
  );
};

export default VerifyEmail;