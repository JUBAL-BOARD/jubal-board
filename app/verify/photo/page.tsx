"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ScanFace } from "lucide-react";
import VerificationLayout from "@/app/components/verification/verificationLayout";
import { useVerificationStore } from "../../lib/stores/verificationStore";

const UploadPhotoPage = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { selfiePreview, setSelfie } = useVerificationStore();

  const handleRetake = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setSelfie(file, preview);
  };

  const handleAllClear = () => {
    router.push("/verify/identity");
  };

  return (
    <VerificationLayout>
      <h1 className="text-2xl font-bold font-heading text-black mt-10 mb-8">Upload Photo</h1>

      {/* Circular Photo Preview */}
      <div className="mb-6">
        {selfiePreview ? (
          <img
            src={selfiePreview}
            alt="Selfie"
            className="w-72 h-72 rounded-full object-cover shadow-lg border-4 border-white"
          />
        ) : (
          <div className="w-72 h-72 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
            No photo captured
          </div>
        )}
      </div>

      <p className="text-sm text-black font-body mb-8 text-center">
        Make sure your face is not blurry or out of frame before continuing
      </p>

      {/* Action Buttons */}
      <div className="w-[20%] mx-auto max-w-lg flex flex-col gap-3">
        <button
          onClick={handleAllClear}
          className="w-full bg-green-500 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
        >
          <Sparkles size={18} />
          All Clear
        </button>

        <input ref={fileInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleRetake} />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-[#E05C5C] text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#d04f4f] transition-colors"
        >
          <ScanFace size={18} />
          Retake the Picture
        </button>
      </div>
    </VerificationLayout>
  );
};

export default UploadPhotoPage;