"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, CheckCircle2, Clock } from "lucide-react";

const KycClient = () => {
  const router = useRouter();
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [alreadyPending, setAlreadyPending] = useState(false);
  const [alreadyVerified, setAlreadyVerified] = useState(false);
  const launchedRef = useRef(false);

  const getDestination = () => {
    const ud = JSON.parse(localStorage.getItem("userData") || "{}");
    return ud.userType === "CLIENT" ? "/client/dashboard" : "/creative/dashboard";
  };

  const handleComplete = useCallback(
    (status: string) => {
      setCompleted(true);
      const ud = JSON.parse(localStorage.getItem("userData") || "{}");
      ud.kycStatus = status ?? "PENDING";
      localStorage.setItem("userData", JSON.stringify(ud));
      setTimeout(() => router.push(getDestination()), 1500);
    },
    [router]
  );

  // Listen for postMessage events from the Didit iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const allowedOrigins = [
        "https://verify.didit.me",
        "https://www.didit.com",
        "https://didit.com",
      ];
      if (!allowedOrigins.includes(event.origin)) return;

      const { type, status, sessionId } = event.data ?? {};
      console.log("[Didit postMessage]", event.origin, type, status, sessionId);

      if (type === "didit:completed" || type === "verification_complete") {
        handleComplete(status ?? "PENDING");
      }

      if (type === "didit:cancelled") {
        setError("Verification was cancelled. Please try again when you're ready.");
      }

      if (type === "didit:error") {
        setError("Something went wrong during verification. Please refresh and try again.");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleComplete]);

  // Fetch verification URL from backend
  useEffect(() => {
    if (launchedRef.current) return;
    launchedRef.current = true;

    const launch = async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);

      try {
        const tokenRes = await fetch("/api/auth/session/token");
        if (!tokenRes.ok) throw new Error("Could not retrieve session token.");
        const { token } = await tokenRes.json();
        if (!token) throw new Error("Unauthorized. Please log in again.");

        const res = await fetch("/api/v1/verification/start", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ verificationType: "IDENTITY" }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          console.error("Verification start failed:", res.status, errBody);

          // Already in review — don't show error, show pending state instead
          if (
            res.status === 400 &&
            errBody?.message === "User verification is already in review"
          ) {
            setAlreadyPending(true);
            return;
          }

          if (
            res.status === 400 &&
            errBody?.message === "User already verified"
          ) {
            setAlreadyVerified(true);
            return;
          }

          throw new Error(
            errBody?.message ?? "Failed to start verification session. Please try again."
          );
        }

        const data = await res.json();
        const sdkUrl: string = data?.sdkUrl ?? data?.data?.sdkUrl ?? null;

        if (!sdkUrl) throw new Error("No verification URL returned from server.");
        setVerificationUrl(sdkUrl);
      } catch (e: any) {
        if (e.name === "AbortError") {
          setError("Request timed out. Please check your connection and try again.");
        } else {
          setError(e.message ?? "An unexpected error occurred.");
        }
      } finally {
        clearTimeout(timeout);
        setLoading(false);
      }
    };

    launch();
  }, []);

  return (
    <div className="flex flex-col items-center flex-1 py-10 px-4">
      <h1 className="text-[28px] font-black text-[#1a1a2e] mb-2">
        Identity Verification
      </h1>
      <p className="text-gray-500 text-[14px] mb-8 text-center max-w-md">
        Complete the steps below to verify your identity and unlock full access.
      </p>

      {loading && (
        <div className="flex flex-col items-center gap-3 mt-20">
          <Loader2 size={36} className="animate-spin text-[#2196F3]" />
          <p className="text-gray-500 text-sm">
            Setting up your verification session...
          </p>
        </div>
      )}

      {/* Already pending state */}
      {alreadyPending && !loading && (
        <div className="flex flex-col items-center gap-4 mt-10 max-w-md w-full">
          <div className="flex flex-col items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-6 py-8 w-full text-center">
            <Clock size={40} className="text-yellow-500" />
            <p className="text-yellow-700 font-semibold text-base">
              Verification In Review
            </p>
            <p className="text-yellow-600 text-sm leading-relaxed">
              Your identity verification has already been submitted and is currently
              being reviewed. This usually takes a short while — we'll notify you
              once it's done.
            </p>
          </div>
          <button
            onClick={() => router.push(getDestination())}
            className="px-6 py-2.5 bg-[#1a1a2e] text-white text-sm font-medium rounded-lg hover:bg-[#2a2a50] transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      )}

      {alreadyVerified && !loading && (
        <div className="flex flex-col items-center gap-4 mt-10 max-w-md w-full">
          <div className="flex flex-col items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-6 py-8 w-full text-center">
            <CheckCircle2 size={40} className="text-green-500" />
            <p className="text-green-700 font-semibold text-base">
              Already Verified
            </p>
            <p className="text-green-600 text-sm leading-relaxed">
              Your identity has already been verified. You have full access to all features.
            </p>
          </div>
          <button
            onClick={() => router.push(getDestination())}
            className="px-6 py-2.5 bg-[#1a1a2e] text-white text-sm font-medium rounded-lg hover:bg-[#2a2a50] transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center gap-4 mt-10 max-w-md w-full">
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-5 py-4 w-full">
            <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              launchedRef.current = false;
            }}
            className="text-sm text-[#2196F3] underline"
          >
            Try again
          </button>
        </div>
      )}

      {completed && (
        <div className="flex flex-col items-center gap-3 mt-20">
          <CheckCircle2 size={48} className="text-green-500" />
          <p className="text-gray-700 font-medium">Verification submitted!</p>
          <p className="text-gray-400 text-sm">Redirecting you back...</p>
        </div>
      )}

      {verificationUrl && !error && !completed && (
        <>
          <iframe
            src={verificationUrl}
            className="w-full max-w-2xl rounded-xl border border-gray-100 shadow-sm"
            style={{ height: "700px", border: "none" }}
            allow="camera; microphone; fullscreen; autoplay; encrypted-media"
            title="Identity Verification"
          />
          <button
            onClick={() => handleComplete("PENDING")}
            className="mt-4 text-sm text-gray-400 underline hover:text-gray-600 transition-colors"
          >
            Already completed? Click here to continue
          </button>
        </>
      )}
    </div>
  );
};

export default KycClient;