"use client";

import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import VerificationLayout from "@/app/components/verification/verificationLayout";
import { useVerificationStore } from "../../lib/stores/verificationStore";

const VerificationPendingPage = () => {
  const router = useRouter();
  const { reset } = useVerificationStore();

  const handleDashboard = () => {
    reset();
    router.push("/client/dashboard");
  };

  return (
    <VerificationLayout>
      <div className="w-full max-w-sm bg-gray-100 rounded-2xl p-8 flex flex-col items-center text-center mt-10">
        {/* Spinner Icon */}
        <div className="mb-6">
          <RefreshCw size={64} className="text-[#E05C5C]" strokeWidth={2.5} />
        </div>

        <h1 className="text-2xl font-extrabold text-[#1a1a2e] mb-4">
          Verification Pending
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed mb-8">
          Thanks for submitting your documents. Verification is under review and usually
          takes a few hours. We'll notify you once it's done
        </p>

        <button
          onClick={handleDashboard}
          className="bg-[#E05C5C] text-white font-semibold px-8 py-3 rounded-xl hover:bg-[#d04f4f] transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    </VerificationLayout>
  );
};

export default VerificationPendingPage;