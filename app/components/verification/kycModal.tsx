"use client";

import { useRouter } from "next/navigation";
import { ShieldCheck, Clock, XCircle, ShieldAlert } from "lucide-react";
import { KycStatus } from "../../lib/hooks/useKycStatus";

interface KycModalProps {
  status: KycStatus;
  onClose?: () => void;
}

const statusConfig = {
  UNVERIFIED: {
    icon: <ShieldAlert size={40} className="text-white" />,
    bg: "bg-[#E2554F]",
    title: "Verify Your Identity",
    message: "To access all features, you need to complete identity verification. It only takes a few minutes.",
    buttonText: "Start Verification",
    buttonStyle: "bg-[#2196F3] hover:bg-blue-700",
    canClose: true,
  },
  PENDING: {
    icon: <Clock size={40} className="text-white" />,
    bg: "bg-[#F59E0B]",
    title: "Verification In Progress",
    message: "Your documents are being reviewed. This usually takes 1–2 business days. We'll notify you once it's done.",
    buttonText: "Check Status",
    buttonStyle: "bg-[#F59E0B] hover:bg-amber-600",
    canClose: true,
  },
  DECLINED: {
    icon: <XCircle size={40} className="text-white" />,
    bg: "bg-[#E2554F]",
    title: "Verification Declined",
    message: "Your verification was declined. Please re-submit with clearer documents.",
    buttonText: "Re-submit Verification",
    buttonStyle: "bg-[#E2554F] hover:bg-red-700",
    canClose: true,
  },
  PROVIDER_APPROVED: {
    icon: <ShieldCheck size={40} className="text-white" />,
    bg: "bg-[#22C55E]",
    title: "Identity Verified!",
    message: "Your identity has been successfully verified. You have full access to all features.",
    buttonText: "Got it",
    buttonStyle: "bg-[#22C55E] hover:bg-green-700",
    canClose: true,
  },
};

const KycModal: React.FC<KycModalProps> = ({ status, onClose }) => {
  const router = useRouter();
  if (!status) return null;

  const config = statusConfig[status] ?? statusConfig.UNVERIFIED;

  const handleButton = () => {
    if (status === "PROVIDER_APPROVED") {
      onClose?.();
    } else {
      router.push("/verify/kyc");
    }
  };

  return (
     <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className={`${config.bg} rounded-2xl px-12 py-10 w-[80%] lg:w-[420px] flex flex-col items-center text-center shadow-2xl`}>
          <div className={` flex flex-col items-center justify-center py-10 px-6`}>
          <div className="w-[72px] h-[72px] rounded-full bg-white/20 flex items-center justify-center mb-4">
            {config.icon}
          </div>
          <h2 className="text-white text-[22px] font-bold text-center">{config.title}</h2>
        </div>
          <div className="px-8 py-7 flex flex-col items-center text-center">
          <p className="text-black font-body text-[14px] leading-relaxed mb-7">{config.message}</p>

          <button
            onClick={handleButton}
            className={`w-full ${config.buttonStyle} text-white font-semibold text-[14px] py-3 rounded-lg transition-colors mb-3`}
          >
            {config.buttonText}
          </button>

          {config.canClose && onClose && status !== "PROVIDER_APPROVED" && (
            <button
              onClick={onClose}
              className="text-black text-[13px] hover:text-gray-600 transition-colors"
            >
              Maybe later
            </button>
          )}
        </div>
        </div>
      </div>
  );
};

export default KycModal;