"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/app/components/client/dashboard/sideBar";
import DashboardTopbar from "@/app/components/client/dashboard/dashboardTopbar";
import Breadcrumb from "@/app/components/client/my-desk/breadcrumb";
import usePageReady from "@/app/lib/hooks/usePageReady";
import WithPageTransition from "@/app/components/shared/withPageTransition";
import FadeInSection from "@/app/components/shared/fadeInSection";
import {
  X,
  Loader2,
  Wallet,
  Banknote,
  CreditCard,
  CheckCircle,
} from "lucide-react";
import { loadStripe, Stripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

interface WalletData {
  id: string;
  availableBalance: number;
  pendingBalance: number;
  currency: string;
}

interface PaymentMethod {
  id: string;
  type: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
  stripePaymentMethodId: string;
}

type ClientProfile = {
  name: string;
  clientProfile: { fullName: string; imageUrl: string | null };
};

function formatCurrency(amount: number, currency: string) {
  const symbol =
    currency === "NGN" ? "₦" :
      currency === "EUR" ? "€" :
        currency === "GBP" ? "£" : "$";
  return `${symbol}${amount?.toLocaleString() ?? "0"}`;
}

function getCardIcon(brand: string) {
  const b = brand?.toLowerCase();
  if (b === "visa") {
    return (
      <span className="font-extrabold text-[#1A1F71] text-sm tracking-widest">VISA</span>
    );
  }
  if (b === "mastercard") {
    return (
      <span className="flex items-center">
        <span className="w-5 h-5 rounded-full bg-red-500 opacity-90 -mr-2 inline-block" />
        <span className="w-5 h-5 rounded-full bg-yellow-400 opacity-90 inline-block" />
      </span>
    );
  }
  return <CreditCard size={20} className="text-gray-500" />;
}

const RadioCircle: React.FC<{ selected: boolean }> = ({ selected }) => (
  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selected ? "border-[#1a1a2e]" : "border-gray-300"}`}>
    {selected && <div className="w-2.5 h-2.5 rounded-full bg-[#1a1a2e]" />}
  </div>
);

const CongratulationsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl px-8 py-10 w-[90%] max-w-sm flex flex-col items-center text-center shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-5">
          <CheckCircle size={44} className="text-green-500" />
        </div>
        <h2 className="text-xl font-extrabold text-black mb-2">🎉 Congratulations!</h2>
        <p className="text-sm text-gray-500 mb-1">Your payment was successful.</p>
        <p className="text-sm text-gray-500 mb-6">
          Your project is now <span className="font-semibold text-green-600">active</span> and the creative has been notified to get started.
        </p>
        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-5 overflow-hidden">
          <div
            className="h-full bg-green-400 rounded-full"
            style={{ animation: "progress 4s linear forwards" }}
          />
        </div>
        <p className="text-xs text-gray-400 mb-5">Redirecting to my-desk...</p>
        <button
          onClick={onClose}
          className="w-full bg-[#E05C5C] hover:bg-[#c94c4c] text-white font-bold py-3 rounded-xl text-sm transition-colors"
        >
          Go to My Desk
        </button>
      </div>
      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
};

const StripeCheckoutForm: React.FC<{
  projectId: string;
  onSuccess: () => void;
  onError: (msg: string) => void;
}> = ({ projectId, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setLoading(true);

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.href },
      redirect: "if_required",
    });

    if (stripeError) {
      onError(stripeError.message ?? "Payment failed.");
      setLoading(false);
      return;
    }

    try {
      const tokenRes = await fetch("/api/auth/session/token");
      const { token } = await tokenRes.json();

      const confirmRes = await fetch(`/api/v1/orders/${projectId}/confirm-payment`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const confirmJson = await confirmRes.json().catch(() => ({}));

      if (!confirmRes.ok) {
        throw new Error(confirmJson.message ?? "Failed to activate escrow.");
      }

      onSuccess();
    } catch (e: any) {
      onError(e.message ?? "Payment succeeded but confirmation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f5f5f5] rounded-2xl p-5">
      <h2 className="font-bold text-black text-base mb-4">Enter Card Details</h2>
      <PaymentElement />
      <button
        onClick={handlePay}
        disabled={!stripe || loading}
        className="mt-5 w-full py-3 bg-[#E05C5C] hover:bg-[#c94c4c] text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading && <Loader2 size={16} className="animate-spin" />}
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </div>
  );
};

const PaymentMethodPage: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const pitchId = searchParams.get("pitchId") ?? (id as string);

  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const isReady = usePageReady(loading);

  const [selectedType, setSelectedType] = useState<string>("");
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);

  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const tokenRes = await fetch("/api/auth/session/token");
        const { token } = await tokenRes.json();
        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const [walletRes, methodsRes, profileRes] = await Promise.all([
          fetch("/api/v1/wallet", { headers, credentials: "include" }),
          fetch("/api/v1/payment-methods", { headers, credentials: "include" }),
          fetch("/api/v1/clients/me", { headers, credentials: "include" }),
        ]);

        const walletJson = await walletRes.json();
        const methodsJson = await methodsRes.json();
        const profileJson = await profileRes.json();

        setWallet(walletJson.data ?? walletJson);
        const methods = Array.isArray(methodsJson)
          ? methodsJson
          : Array.isArray(methodsJson.data)
            ? methodsJson.data
            : [];
        setPaymentMethods(methods);
        setProfile(profileJson.data ?? profileJson);

        const defaultCard = methods.find((m: PaymentMethod) => m.isDefault);
        if (defaultCard) setSelectedType(defaultCard.id);
      } catch (e) {
        setError("Failed to load payment details.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePaymentSuccess = () => {
    setShowCongrats(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedType) {
      setError("Please select a payment method.");
      return;
    }
    if (!projectId) {
      setError("Project ID missing. Please go back and try again.");
      return;
    }

    setConfirmLoading(true);
    setError(null);
    setPaymentFailed(false);

    try {
      const tokenRes = await fetch("/api/auth/session/token");
      const { token } = await tokenRes.json();
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Wallet payment
      if (selectedType === "WALLET") {
        const confirmRes = await fetch(`/api/v1/orders/${projectId}/confirm-payment`, {
          method: "POST",
          headers,
          credentials: "include",
        });

        const confirmJson = await confirmRes.json().catch(() => ({}));

        if (!confirmRes.ok) {
          setPaymentFailed(true);
          throw new Error(confirmJson.message ?? "Failed to confirm payment.");
        }

        handlePaymentSuccess();
        return;
      }

      // Card payment (saved card or new card — both go through Stripe payment sheet)
      const paymentRes = await fetch(`/api/v1/orders/${projectId}/payment`, {
        method: "POST",
        headers,
        credentials: "include",
      });

      const paymentJson = await paymentRes.json();

      if (!paymentRes.ok) {
        throw new Error(paymentJson.message ?? "Failed to initiate payment.");
      }

      const publishableKey = paymentJson.data?.publishableKey ?? paymentJson.publishableKey;
      const secret = paymentJson.data?.clientSecret ?? paymentJson.clientSecret;

      if (!publishableKey) throw new Error("No publishable key returned from server.");
      if (!secret) throw new Error("No client secret returned from server.");

      setStripePromise(loadStripe(publishableKey));
      setClientSecret(secret);
    } catch (e: any) {
      setError(e.message ?? "Something went wrong.");
    } finally {
      setConfirmLoading(false);
    }
  };

  const userName = profile?.clientProfile?.fullName || profile?.name || "Client";
  const userAvatar =
    profile?.clientProfile?.imageUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1a1a2e&color=fff&size=128`;

  const cards = paymentMethods.filter((m) => m.type === "CARD");

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#E05C5C]" size={40} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">

      {showCongrats && (
        <CongratulationsModal
          onClose={() => {
            setShowCongrats(false);
            router.push("/client/my-desk");
          }}
        />
      )}

      <DashboardTopbar
        userName={userName}
        userAvatar={userAvatar}
        sidebarOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex flex-1 relative">
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        <div
          className={`
            fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-10
          `}
        >
          <button className="absolute top-4 right-4 z-50 lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={22} />
          </button>
          <Sidebar activeItem="Pitches" />
        </div>

        <main className="flex-1 w-full px-4 lg:px-8 py-6 overflow-y-auto">
          <WithPageTransition isReady={isReady} variant="pitches">
            <FadeInSection delay={0}>
              <Breadcrumb
                crumbs={[
                  { label: "Dashboard", path: "/client/dashboard" },
                  { label: "Hire a Pro", path: "/client/pitches" },
                  { label: "Creative Pitch", path: `/client/pitches/${id}` },
                  { label: "Order Review", path: `/client/pitches/${id}/review` },
                  { label: "Payment Method" },
                ]}
              />

              <h1 className="text-2xl font-extrabold text-black mt-4 mb-6">Payment Method</h1>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
                  <span>{error}</span>
                  <div className="flex items-center gap-3 ml-2 shrink-0">
                    {paymentFailed && (
                      <button
                        onClick={() => {
                          setError(null);
                          setPaymentFailed(false);
                          setClientSecret(null);
                          setStripePromise(null);
                        }}
                        className="text-xs font-bold underline text-red-600 hover:text-red-800 transition-colors"
                      >
                        Retry
                      </button>
                    )}
                    <button onClick={() => { setError(null); setPaymentFailed(false); }}>
                      <X size={14} />
                    </button>
                  </div>
                </div>
              )}

              <div className="w-full flex flex-col gap-4">

                {/* ── Wallet ── */}
                <div className="bg-[#f5f5f5] rounded-2xl p-5">
                  <h2 className="font-bold text-black text-base mb-3">Wallet</h2>
                  <button
                    onClick={() => {
                      setSelectedType("WALLET");
                      setClientSecret(null);
                      setStripePromise(null);
                    }}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Wallet size={18} className="text-gray-500" />
                      <span className="text-sm text-gray-700">
                        Available Balance:{" "}
                        <span className="font-semibold text-black">
                          {wallet ? formatCurrency(wallet.availableBalance, wallet.currency) : "—"}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push("/client/my-wallet");
                        }}
                        className="text-xs font-semibold border border-[#E05C5C] text-[#E05C5C] px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
                      >
                        Add Fund
                      </button>
                      <RadioCircle selected={selectedType === "WALLET"} />
                    </div>
                  </button>
                </div>

                {/* ── Cash ── */}
                <div className="bg-[#f5f5f5] rounded-2xl p-5">
                  <h2 className="font-bold text-black text-base mb-3">Cash</h2>
                  <button
                    onClick={() => {
                      setSelectedType("CASH");
                      setClientSecret(null);
                      setStripePromise(null);
                    }}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Banknote size={18} className="text-gray-500" />
                      <span className="text-sm text-gray-700">Cash</span>
                    </div>
                    <RadioCircle selected={selectedType === "CASH"} />
                  </button>
                </div>

                {/* ── Credit & Debit Card ── */}
                <div className="bg-[#f5f5f5] rounded-2xl p-5">
                  <h2 className="font-bold text-black text-base mb-3">Credit & Debit Card</h2>
                  <div className="flex flex-col gap-2">

                    {/* Saved cards */}
                    {cards.map((card) => (
                      <button
                        key={card.id}
                        onClick={() => {
                          setSelectedType(card.id);
                          setClientSecret(null);
                          setStripePromise(null);
                        }}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {getCardIcon(card.brand)}
                          <span className="text-sm text-gray-700">
                            {card.brand} •••• {card.last4}
                          </span>
                        </div>
                        <RadioCircle selected={selectedType === card.id} />
                      </button>
                    ))}

                    {/* Pay with new card — goes straight to Stripe payment sheet on Confirm */}
                    <button
                      onClick={() => {
                        setSelectedType("NEW_CARD");
                        setClientSecret(null);
                        setStripePromise(null);
                      }}
                      className="w-full bg-white border border-dashed border-gray-300 rounded-xl px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-500">Pay with a new card</span>
                      </div>
                      <RadioCircle selected={selectedType === "NEW_CARD"} />
                    </button>
                  </div>
                </div>

                {/* ── More Payment Options ── */}
                <div className="bg-[#f5f5f5] rounded-2xl p-5">
                  <h2 className="font-bold text-black text-base mb-3">More Payment Options</h2>
                  <div className="flex flex-col gap-2">
                    {[
                      {
                        id: "PAYPAL",
                        label: "Paypal",
                        icon: (
                          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="28" height="28" rx="14" fill="#F5F5F5" />
                            <path d="M19.5 10.5C19.5 13.5 17.5 15 15 15H13.5L12.5 20H10L12 10H16C18 10 19.5 10.5 19.5 10.5Z" fill="#003087" />
                            <path d="M20.5 11.5C20.5 14.5 18.5 16 16 16H14.5L13.5 21H11L13 11H17C19 11 20.5 11.5 20.5 11.5Z" fill="#009CDE" />
                            <path d="M11 20L12.8 11H16.5C18.8 11 20 12.2 19.8 14.2C19.5 16.8 17.5 18 15 18H13.5L13 20H11Z" fill="#012169" />
                          </svg>
                        ),
                      },
                      {
                        id: "APPLE_PAY",
                        label: "Apple Pay",
                        icon: (
                          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="black">
                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                          </svg>
                        ),
                      },
                      {
                        id: "GOOGLE_PAY",
                        label: "Google Pay",
                        icon: (
                          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="28" height="28" rx="14" fill="white" stroke="#E5E7EB" strokeWidth="1" />
                            <path d="M20.5 14.2C20.5 13.7 20.5 13.2 20.4 12.7H14V15.5H17.7C17.5 16.4 17 17.1 16.2 17.6V19.4H18.5C19.8 18.2 20.5 16.4 20.5 14.2Z" fill="#4285F4" />
                            <path d="M14 21C15.9 21 17.5 20.4 18.5 19.4L16.2 17.6C15.6 18 14.9 18.3 14 18.3C12.2 18.3 10.7 17.1 10.1 15.5H7.8V17.3C8.9 19.5 11.3 21 14 21Z" fill="#34A853" />
                            <path d="M10.1 15.5C9.9 14.9 9.8 14.3 9.8 13.7C9.8 13.1 9.9 12.5 10.1 11.9V10.1H7.8C7.1 11.4 6.8 12.8 6.8 14.2C6.8 15.6 7.1 17 7.8 18.3L10.1 16.5V15.5Z" fill="#FBBC05" />
                            <path d="M14 9.1C15 9.1 15.9 9.4 16.6 10.1L18.6 8.1C17.5 7.1 15.9 6.5 14 6.5C11.3 6.5 8.9 8 7.8 10.1L10.1 11.9C10.7 10.3 12.2 9.1 14 9.1Z" fill="#EA4335" />
                          </svg>
                        ),
                      },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setSelectedType(opt.id);
                          setClientSecret(null);
                          setStripePromise(null);
                        }}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {opt.icon}
                          <span className="text-sm text-gray-700">{opt.label}</span>
                        </div>
                        <RadioCircle selected={selectedType === opt.id} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Stripe Payment Sheet (appears after Confirm is clicked) ── */}
                {stripePromise && clientSecret && projectId && (
                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret,
                      appearance: {
                        theme: "stripe",
                        variables: { colorPrimary: "#E05C5C", borderRadius: "12px" },
                      },
                    }}
                  >
                    <StripeCheckoutForm
                      projectId={projectId}
                      onSuccess={handlePaymentSuccess}
                      onError={(msg) => {
                        setError(msg);
                        setPaymentFailed(true);
                        setClientSecret(null);
                        setStripePromise(null);
                      }}
                    />
                  </Elements>
                )}

                <p className="text-xs text-gray-500 text-center px-4">
                  By continuing, you agree to fund the project via escrow. Funds are released only when you approve the final delivery.
                </p>

                {/* Confirm / Cancel buttons — hidden once Stripe sheet is showing */}
                {!(stripePromise && clientSecret) && (
                  <div className="flex items-center justify-end gap-3 pt-2 pb-8">
                    <button
                      onClick={() => router.back()}
                      className="flex items-center gap-2 bg-[#1a1a2e] text-white font-semibold px-6 py-3 rounded-xl text-sm hover:bg-[#121220] transition-colors"
                    >
                      <X size={15} />
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmPayment}
                      disabled={confirmLoading || !selectedType || showCongrats}
                      className="bg-[#E05C5C] hover:bg-[#c94c4c] text-white font-semibold px-8 py-3 rounded-xl text-sm transition-colors disabled:opacity-60 flex items-center gap-2"
                    >
                      {confirmLoading && <Loader2 size={15} className="animate-spin" />}
                      {confirmLoading ? "Processing..." : "Confirm Payment"}
                    </button>
                  </div>
                )}

                {stripePromise && clientSecret && (
                  <div className="flex justify-start pb-8">
                    <button
                      onClick={() => {
                        setClientSecret(null);
                        setStripePromise(null);
                      }}
                      className="text-sm text-gray-500 hover:text-black transition-colors flex items-center gap-1"
                    >
                      ← Back to payment options
                    </button>
                  </div>
                )}

              </div>
            </FadeInSection>
          </WithPageTransition>

        </main>
      </div>
    </div>
  );
};

export default PaymentMethodPage;