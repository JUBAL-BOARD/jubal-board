"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import logo from "../../assets/logo.png";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Dashhboard } from "@/app/icons";

const CongratulationsModal: React.FC<{ onGoToDashboard: () => void }> = ({ onGoToDashboard }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl px-12 py-10 w-[80%] lg:w-[420px] flex flex-col items-center text-center shadow-2xl">
      <div className="w-[90px] h-[90px] rounded-full bg-[#2196F3] flex items-center justify-center mb-5">
        <Dashhboard />
      </div>
      <h2 className="text-[24px] font-heading font-bold text-[#2196F3] m-0 mb-1">Congratulations!</h2>
      <p className="text-[20px] font-heading font-semibold text-[#2196F3] m-0 mb-3">Your profile is complete</p>
      <p className="text-[14px] font-body text-black m-0 mb-7 leading-relaxed max-w-[260px]">
        You can now post projects and connect with the right creatives.
      </p>
      <button
        onClick={onGoToDashboard}
        className="bg-[#2196F3] border-none rounded-lg px-8 py-2.5 cursor-pointer text-white font-semibold text-xs lg:text-[14px] hover:bg-blue-700 transition-colors"
      >
        Go to Dashboard
      </button>
    </div>
  </div>
);

const KycClient = dynamic(() => import("./kycClient"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center flex-1 py-10 px-4">
      <p className="text-gray-400 text-sm mt-20">Loading verification...</p>
    </div>
  ),
});

const KycVerificationPage = () => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const getDestination = () => {
    const ud = JSON.parse(localStorage.getItem("userData") || "{}");
    return ud.userType === "CLIENT" ? "/client/dashboard" : "/creative/dashboard";
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {showModal && (
        <CongratulationsModal onGoToDashboard={() => router.push(getDestination())} />
      )}
      <div className="flex items-center px-10 h-[100px] border-b border-gray-200 bg-[#fafafa]">
        <Image src={logo} alt="Jubal Board" width={120} height={120} className="object-contain" />
      </div>
      <KycClient onComplete={() => setShowModal(true)} />
    </div>
  );
};

export default KycVerificationPage;