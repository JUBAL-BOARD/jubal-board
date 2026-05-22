"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import logo from "../../assets/logo.png";
import { useRouter } from "next/navigation";

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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex items-center px-10 h-[100px] border-b border-gray-200 bg-[#fafafa]">
        <Image
          src={logo}
          alt="Jubal Board"
          width={120}
          height={120}
          className="object-contain"
        />
      </div>
      <KycClient />
      {/* <div className="flex justify-center pb-10">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[13px] font-semibold text-gray-500 hover:text-[#1a1a2e] transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back to Dashboard
        </button>
      </div> */}
    </div>
  );
};

export default KycVerificationPage;