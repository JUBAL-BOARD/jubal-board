"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { showFundAddedToast } from "@/app/components/ui/toasts";

interface Props {
  onClose: () => void;
  onSuccess?: () => void;
}

const quickAmounts = ["50", "100", "200", "350", "500", "1000"];

// ── Inner form (rendered inside <Elements> once we have clientSecret) ──
const CheckoutForm: React.FC<{ onClose: () => void; onSuccess?: () => void }> = ({
  onClose,
  onSuccess,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!stripe || !elements) return;
    setLoading(true);
    setError(null);

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href,
      },
      redirect: "if_required",
    });

    if (stripeError) {
      setError(stripeError.message ?? "Payment failed");
      setLoading(false);
      return;
    }

    if (
      paymentIntent?.status === "succeeded" ||
      paymentIntent?.status === "processing"
    ) {
      onClose();
      showFundAddedToast();
      // NOTE: per contract, add-funds has no client-confirm endpoint for Stripe —
      // the wallet is credited via webhook. onSuccess() here just refetches /wallet,
      // which may briefly show the old balance if the webhook hasn't landed yet.
      // If that's visible in the UI, consider polling a couple of times instead
      // of a single refetch.
      onSuccess?.();
    } else {
      setError("Payment was not completed. Please try again.");
    }

    setLoading(false);
  };

  return (
    <div className="px-6 py-5">
      <PaymentElement />
      {error && <p className="text-sm text-red-500 mt-4">{error}</p>}
      <button
        onClick={handleSubmit}
        disabled={!stripe || loading}
        className="mt-6 w-full py-3 bg-[#e84545] hover:bg-[#d03535] text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </div>
  );
};

// ── Main modal ──
const AddFundModal: React.FC<Props> = ({ onClose, onSuccess }) => {
  const [amount, setAmount] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleContinue = async () => {
    if (!amount) return;
    setLoading(true);
    setError(null);

    try {
      const tokenRes = await fetch("/api/auth/session/token");
      const { token } = await tokenRes.json();

      const res = await fetch("/api/v1/wallet/add-funds", {
        method: "POST",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Number(amount),
          currency: "USD",
        }),
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.message ?? "Failed to create payment");

      const { provider } = json.data;

      // ── Branch on provider, per backend contract §0/§1 ──
      // Stripe = client-confirm (clientSecret + publishableKey)
      // Flutterwave / Paystack = redirect (authorizationUrl) — webhook confirms later
      if (provider === "STRIPE") {
        const { clientSecret, publishableKey } = json.data;

        if (!clientSecret || !publishableKey) {
          throw new Error("Stripe payment could not be initialized. Please try again.");
        }

        setStripePromise(loadStripe(publishableKey));
        setClientSecret(clientSecret);
      } else {
        // FLUTTERWAVE (or PAYSTACK if re-enabled later)
        const { authorizationUrl } = json.data;

        if (!authorizationUrl) {
          throw new Error("Payment link could not be generated. Please try again.");
        }

        setRedirecting(true);
        // Hosted checkout — funds are credited server-side via webhook once paid.
        // No client confirm step exists for this path; on return, the wallet
        // page's normal fetch (GET /wallet) will reflect the new balance once
        // the webhook has landed.
        window.location.href = authorizationUrl;
        return; // don't fall through to setLoading(false) below — we're navigating away
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center mt-20 z-50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">

        {/* Header — always visible, never scrolls away */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-xl font-bold text-black">Add Fund</h2>
          <button onClick={onClose} className="text-black hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Redirecting state — shown briefly before window.location.href kicks in */}
        {redirecting && (
          <div className="px-6 py-10 flex flex-col items-center gap-3 text-center">
            <Loader2 size={28} className="animate-spin text-[#e84545]" />
            <p className="text-sm text-gray-600">
              Redirecting you to complete your payment…
            </p>
          </div>
        )}

        {/* Step 1 — pick amount */}
        {!clientSecret && !redirecting && (
          <div className="overflow-y-auto px-6 py-5">
            <div className="mb-5">
              <label className="block text-sm font-semibold text-black mb-2">
                Enter Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Type here"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#e84545]/20 focus:border-[#e84545]/40"
              />
            </div>

            <div className="mb-6">
              <p className="text-sm font-semibold text-black mb-3">Or select amount</p>
              <div className="flex gap-2 flex-wrap">
                {quickAmounts.map((q) => (
                  <button
                    key={q}
                    onClick={() => setAmount(q)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      amount === q
                        ? "bg-[#2a2a50] text-white"
                        : "bg-[#1c1c3a] text-white hover:bg-[#2a2a50]"
                    }`}
                  >
                    ${q}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

            <button
              onClick={handleContinue}
              disabled={!amount || loading}
              className="w-full py-3 bg-[#e84545] hover:bg-[#d03535] text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Please wait..." : "Continue"}
            </button>
          </div>
        )}

        {/* Step 2 — Stripe payment form (only reached when provider === "STRIPE") */}
        {clientSecret && stripePromise && (
          <div className="overflow-y-auto">
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "stripe",
                  variables: {
                    colorPrimary: "#e84545",
                    borderRadius: "8px",
                  },
                },
              }}
            >
              <CheckoutForm onClose={onClose} onSuccess={onSuccess} />
            </Elements>
          </div>
        )}

      </div>
    </div>
  );
};

export default AddFundModal;