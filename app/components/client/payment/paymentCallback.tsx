"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";

const extractProjectId = (txRef: string): string | null => {
  const match = txRef.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
  );
  return match ? match[0] : null;
};

type PollState = "polling" | "success" | "failed" | "timeout";

const PENDING_PAYMENT_STATUS = "PENDING_PAYMENT";
const POLL_INTERVAL_MS = 2500;
const MAX_POLL_ATTEMPTS = 8;

const PaymentCallbackPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const status = searchParams.get("status");
  const txRef = searchParams.get("tx_ref");
  const transactionId = searchParams.get("transaction_id");

  const [pollState, setPollState] = useState<PollState>("polling");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const attemptsRef = useRef(0);

  const projectId = txRef ? extractProjectId(txRef) : null;

  useEffect(() => {
    if (status && status !== "successful") {
      setPollState("failed");
      setErrorMsg(
        status === "cancelled"
          ? "Payment was cancelled."
          : "Payment was not successful."
      );
      return;
    }

    if (!projectId) {
      setPollState("failed");
      setErrorMsg("We couldn't identify the project for this payment.");
      return;
    }

    let cancelled = false;

    const poll = async () => {
      try {
        const tokenRes = await fetch("/api/auth/session/token");
        const { token } = await tokenRes.json();

        const res = await fetch(`/api/v1/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });

        if (!res.ok) {
          scheduleNext();
          return;
        }

        const json = await res.json();
        const project = json.data ?? json;

        if (cancelled) return;

        if (project.status && project.status !== PENDING_PAYMENT_STATUS) {
          setPollState("success");
          return;
        }

        scheduleNext();
      } catch {
        scheduleNext();
      }
    };

    const scheduleNext = () => {
      attemptsRef.current += 1;
      if (attemptsRef.current >= MAX_POLL_ATTEMPTS) {
        if (!cancelled) setPollState("timeout");
        return;
      }
      setTimeout(() => {
        if (!cancelled) poll();
      }, POLL_INTERVAL_MS);
    };

    poll();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, status]);

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm flex flex-col items-center text-center">

        {pollState === "polling" && (
          <>
            <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center mb-5">
              <Loader2 size={36} className="text-[#E05C5C] animate-spin" />
            </div>
            <h1 className="text-xl font-extrabold text-black mb-2">
              Confirming your payment…
            </h1>
            <p className="text-sm text-gray-500 mb-1">
              This usually takes just a few seconds.
            </p>
            <p className="text-xs text-gray-400">
              Please don't close this page.
            </p>
          </>
        )}

        {pollState === "success" && (
          <>
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-5">
              <CheckCircle size={44} className="text-green-500" />
            </div>
            <h1 className="text-xl font-extrabold text-black mb-2">
              🎉 Payment confirmed!
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              Your project is now <span className="font-semibold text-green-600">active</span> and the creative has been notified to get started.
            </p>
            <button
              onClick={() => router.push("/client/my-desk")}
              className="w-full bg-[#E05C5C] hover:bg-[#c94c4c] text-white font-bold py-3 rounded-xl text-sm transition-colors"
            >
              Go to My Desk
            </button>
          </>
        )}

        {pollState === "failed" && (
          <>
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-5">
              <XCircle size={44} className="text-red-500" />
            </div>
            <h1 className="text-xl font-extrabold text-black mb-2">
              Payment not completed
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              {errorMsg ?? "Something went wrong with your payment."}
            </p>
            <button
              onClick={() => router.push(projectId ? `/client/pitches` : "/client/my-desk")}
              className="w-full bg-[#1a1a2e] hover:bg-[#121220] text-white font-bold py-3 rounded-xl text-sm transition-colors"
            >
              Try Again
            </button>
          </>
        )}

        {pollState === "timeout" && (
          <>
            <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mb-5">
              <Clock size={40} className="text-amber-500" />
            </div>
            <h1 className="text-xl font-extrabold text-black mb-2">
              Still processing…
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              Your payment is taking a little longer to confirm than usual.
              We'll notify you once it's done — you can also check the
              status from My Desk in a moment.
            </p>
            <button
              onClick={() => router.push("/client/my-desk")}
              className="w-full bg-[#E05C5C] hover:bg-[#c94c4c] text-white font-bold py-3 rounded-xl text-sm transition-colors"
            >
              Go to My Desk
            </button>
          </>
        )}

      </div>
    </div>
  );
};

export default PaymentCallbackPage;