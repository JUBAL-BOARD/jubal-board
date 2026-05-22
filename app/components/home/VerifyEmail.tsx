"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import logo from "../../assets/icononly.png";
import { verifyEmail, resendVerification } from "../../lib/authService";
import { ApiError } from "../../lib/api";
import { parseAuthToken, saveSession } from "../../lib/session";

const VerifyEmail: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextRoute = searchParams.get("next") ?? "/tell-us";
  const email = searchParams.get("email") ?? "";

  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    setError(null);
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus();
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

  const handleVerify = async () => {
    if (code.join("").length < 6) return;
    if (!email) {
      setError("Email address is missing. Please go back and try again.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data } = await verifyEmail({ email, code: code.join("") });

      const token = parseAuthToken(data);
      if (token) {
        await saveSession(token);
      } else {
        throw new Error("Verification succeeded but no auth token was returned. Check response body for accessToken or token field.");
      }

      router.push(nextRoute);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 400) {
          setError("Invalid or expired code. Please try again.");
        } else if (err.status === 429) {
          setError("Too many attempts. Please request a new code.");
        } else {
          setError(err.message || "Verification failed. Please try again.");
        }
      } else {
        setError(err instanceof Error ? err.message : "Unable to connect. Please check your internet connection.");
      }
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError("Email address is missing. Please go back and try again.");
      return;
    }

    setResending(true);
    setError(null);
    setResendMessage(null);

    try {
      await resendVerification(email);
      setResendMessage("A new code has been sent to your email.");
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message || "Failed to resend code. Please try again.");
      } else {
        setError("Unable to connect. Please check your internet connection.");
      }
    } finally {
      setResending(false);
    }
  };

  const isComplete = code.every((c) => c !== "");

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-[#fafafa] px-4 py-10">
      <div className="bg-white rounded-2xl px-6 sm:px-10 lg:px-12 py-10 lg:py-14 w-full max-w-[420px] flex flex-col items-center text-center shadow-[0_4px_24px_rgba(0,0,0,0.07)]">
        <div className="flex justify-center mb-4 lg:mb-5">
          <Image src={logo} alt="Jubal Board logo" width={100} height={100} className="object-contain w-[70px] lg:w-[100px]" />
        </div>

        <h1 className="text-xl lg:text-[26px] font-extrabold text-[#1a1a2e] m-0 mb-3">Verify Your Email</h1>
        <p className="text-xs lg:text-[13px] text-black mb-6 lg:mb-8 leading-[1.7] max-w-[300px]">
          We've sent a <strong>verification code</strong> to <strong>{email || "your email"}</strong>.<br />
          Enter the 6-digit code below to confirm your account.
        </p>

        {error && (
          <div className="w-full bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {resendMessage && (
          <div className="w-full bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-4 text-sm text-green-600">
            {resendMessage}
          </div>
        )}

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
              disabled={loading}
              className="w-10 h-10 sm:w-12 sm:h-12 lg:w-[52px] lg:h-[56px] rounded-[6px] lg:rounded-[10px] text-lg lg:text-[22px] font-bold text-center text-[#1a1a2e] outline-none bg-white cursor-text transition-colors duration-150 disabled:opacity-50"
              style={{ border: `2px solid ${digit ? "#E85D3A" : "#e5e7eb"}` }}
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          disabled={!isComplete || loading}
          className="w-full border-none rounded-lg py-3 lg:py-3.5 text-white font-bold text-sm lg:text-[15px] mb-4 transition-colors duration-200 flex items-center justify-center gap-2"
          style={{
            background: isComplete && !loading ? "#E2554F" : "#f0a090",
            cursor: isComplete && !loading ? "pointer" : "not-allowed",
          }}
        >
          {loading ? <><Loader2 size={16} className="animate-spin" /> Verifying...</> : "Verify Account"}
        </button>

        <p className="text-xs lg:text-[13px] text-black m-0">
          Didn't get the code?{" "}
          <span
            onClick={!resending ? handleResend : undefined}
            className={`text-[#E2554F] font-semibold ${resending ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:underline"}`}
          >
            {resending ? "Resending..." : "Resend"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;