"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";
import logo from "../assets/icononly.png";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://16.171.168.144:3000";

async function apiFetch(path: string, body: object) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return {
    status: res.status,
    data: res.status !== 204 ? await res.json().catch(() => null) : null,
  };
}

type Step = "email" | "otp" | "newPassword" | "done";

const ForgotPasswordPage: React.FC = () => {
  const router = useRouter();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  // Step 1: Send OTP
  const handleSendOtp = async () => {
    if (!email) { setError("Please enter your email address."); return; }
    setLoading(true); setError(null);
    try {
      const { status, data } = await apiFetch("/api/v1/auth/forgot-password", { email });
      console.log("status:", status, "data:", data);
      if (status === 201) {
        setStep("otp");
      } else {
        setError("We couldn't find an account with that email.");
      }
    } catch {
      setError("Unable to connect. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Resend OTP
  const handleResend = async () => {
    if (resendCooldown) return;
    setResendMsg(null); setError(null);
    try {
      const { status } = await apiFetch("/api/v1/auth/forgot-password/resend", { email });
      if (status === 200) {
        setResendMsg("A new code was sent to your email.");
        setResendCooldown(true);
        setTimeout(() => setResendCooldown(false), 60_000);
      } else if (status === 429) {
        setError("Please wait 60 seconds before requesting another code.");
        setResendCooldown(true);
        setTimeout(() => setResendCooldown(false), 60_000);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Unable to connect. Please check your internet connection.");
    }
  };

  // Step 2 → 3: Advance after OTP entry
  const handleVerifyOtp = () => {
    if (otp.trim().length !== 6) { setError("Please enter the 6-digit code."); return; }
    setError(null);
    setStep("newPassword");
  };

  // Step 3: Reset password
  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) { setError("Please fill in both fields."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    if (newPassword.length < 8) { setError("Password must be at least 8 characters."); return; }

    setLoading(true); setError(null);
    try {
      const { status } = await apiFetch("/api/v1/auth/reset-password", {
        email,
        code: otp,
        newPassword,
      });
      if (status === 201) {
        setStep("done");
      } else if (status === 400) {
        setError("Your code is invalid or expired. Go back and request a new one.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Unable to connect. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const ErrorBox = () =>
    error ? (
      <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4 text-sm text-red-600 w-full text-center">
        {error}
      </div>
    ) : null;

  const inputClass =
    "w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 transition-all disabled:opacity-50";

  const btnClass =
    "w-full bg-[#E2554F] hover:bg-[#d44a44] text-white font-semibold py-3 rounded-lg transition-colors text-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2";

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl px-14 py-16 w-full max-w-md flex flex-col items-center">

        <div className="mb-6">
          <Image src={logo} width={100} height={100} alt="Jubal Board" className="object-contain" />
        </div>

        {/* ── Step 1: Email ── */}
        {step === "email" && (
          <>
            <h1 className="text-2xl font-bold text-[#1a1a2e] text-center mb-2">
              Can&apos;t Log In? No Stress
            </h1>
            <p className="text-sm text-gray-500 text-center mb-8 leading-relaxed">
              Drop your email and we&apos;ll send you a reset code.
            </p>
            <ErrorBox />
            <div className="w-full flex flex-col gap-3">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                disabled={loading}
                className={inputClass}
              />
              <button onClick={handleSendOtp} disabled={loading} className={btnClass}>
                {loading ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : "Send Me the Code"}
              </button>
            </div>
            <p className="text-sm text-center mt-5">
              <span
                onClick={() => router.back()}
                className="text-[#E2554F] font-medium cursor-pointer hover:underline"
              >
                Back to Sign In
              </span>
            </p>
          </>
        )}

        {/* ── Step 2: OTP ── */}
        {step === "otp" && (
          <>
            <h1 className="text-2xl font-bold text-[#1a1a2e] text-center mb-2">
              Check Your Inbox
            </h1>
            <p className="text-sm text-gray-500 text-center mb-8 leading-relaxed">
              We sent a 6-digit code to{" "}
              <span className="font-medium text-gray-700">{email}</span>.
            </p>
            <ErrorBox />
            {resendMsg && (
              <p className="text-sm text-green-600 text-center mb-4">{resendMsg}</p>
            )}
            <div className="w-full flex flex-col gap-3">
              <input
                type="text"
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "").slice(0, 6)); setError(null); }}
                onKeyDown={(e) => e.key === "Enter" && handleVerifyOtp()}
                maxLength={6}
                className={inputClass + " tracking-widest text-center text-lg font-mono"}
              />
              <button onClick={handleVerifyOtp} className={btnClass}>
                Continue
              </button>
            </div>
            <p className="text-sm text-center mt-5 text-gray-500">
              Didn&apos;t get it?{" "}
              <span
                onClick={handleResend}
                className={`font-medium cursor-pointer ${resendCooldown ? "text-gray-400 cursor-not-allowed" : "text-[#E2554F] hover:underline"}`}
              >
                {resendCooldown ? "Resend in 60s" : "Resend code"}
              </span>
            </p>
            <p className="text-sm text-center mt-2">
              <span
                onClick={() => { setStep("email"); setError(null); setOtp(""); }}
                className="text-[#E2554F] font-medium cursor-pointer hover:underline"
              >
                Change email
              </span>
            </p>
          </>
        )}

        {/* ── Step 3: New Password ── */}
        {step === "newPassword" && (
          <>
            <h1 className="text-2xl font-bold text-[#1a1a2e] text-center mb-2">
              Set New Password
            </h1>
            <p className="text-sm text-gray-500 text-center mb-8 leading-relaxed">
              Choose a strong password for your account.
            </p>
            <ErrorBox />
            <div className="w-full flex flex-col gap-3">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setError(null); }}
                  disabled={loading}
                  className={inputClass + " pr-10"}
                />
                <button
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer p-0 flex"
                >
                  {showPassword ? <EyeOff size={18} stroke="#9CA3AF" /> : <Eye size={18} stroke="#9CA3AF" />}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(null); }}
                  onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
                  disabled={loading}
                  className={inputClass + " pr-10"}
                />
                <button
                  onClick={() => setShowConfirm((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer p-0 flex"
                >
                  {showConfirm ? <EyeOff size={18} stroke="#9CA3AF" /> : <Eye size={18} stroke="#9CA3AF" />}
                </button>
              </div>
              <button onClick={handleResetPassword} disabled={loading} className={btnClass}>
                {loading ? <><Loader2 size={16} className="animate-spin" /> Resetting...</> : "Reset Password"}
              </button>
            </div>
            <p className="text-sm text-center mt-5">
              <span
                onClick={() => { setStep("otp"); setError(null); }}
                className="text-[#E2554F] font-medium cursor-pointer hover:underline"
              >
                Back
              </span>
            </p>
          </>
        )}

        {/* ── Step 4: Done ── */}
        {step === "done" && (
          <>
            <h1 className="text-2xl font-bold text-[#1a1a2e] text-center mb-2">
              Password Reset! 🎉
            </h1>
            <p className="text-sm text-gray-500 text-center mb-8 leading-relaxed">
              Your password has been updated. You can now sign in with your new password.
            </p>
            <button onClick={() => router.push("/signin")} className={btnClass}>
              Back to Sign In
            </button>
          </>
        )}

      </div>
    </div>
  );
};

export default ForgotPasswordPage;