"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { IdCard } from "lucide-react";
import VerificationLayout from "@/app/components/verification/verificationLayout";
import { useVerificationStore } from "../../lib/stores/verificationStore";

const VerifyBusinessPage = () => {
  const router = useRouter();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const { businessDocPreview, setBusinessDoc } = useVerificationStore();

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setBusinessDoc(file, preview);
    router.push("/verify/id");
  };

  return (
    <VerificationLayout>
      <h1 className="text-3xl font-heading font-extrabold text-black mt-10 mb-16">Verify Business</h1>

      <div className="w-full max-w-3xl bg-gray-100 rounded-2xl p-10">
        <div className="text-center mb-10">
          <h2 className="text-xl font-bold text-black flex items-center justify-center gap-2">
            <IdCard size={20} className="text-[#E05C5C]" />
            Attach Document
          </h2>
          <p className="text-black font-body text-sm mt-2">
            Upload your business documents, select the ID Type
          </p>
          {businessDocPreview && (
            <img
              src={businessDocPreview}
              alt="Business doc"
              className="w-48 h-32 object-cover rounded-lg mx-auto mt-6 shadow"
            />
          )}
        </div>

        <input ref={photoInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleUpload} />
        <div className="flex justify-around mt-4">
          <button
            onClick={() => photoInputRef.current?.click()}
            className="text-[#E05C5C] font-medium text-sm hover:underline"
          >
            Take Photo
          </button>
          <button
            onClick={() => photoInputRef.current?.click()}
            className="text-[#E05C5C] font-medium text-sm hover:underline"
          >
            Upload Image
          </button>
        </div>
      </div>
    </VerificationLayout>
  );
};

export default VerifyBusinessPage;