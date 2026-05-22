"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, ScanLine } from "lucide-react";
import VerificationLayout from "@/app/components/verification/verificationLayout";
import { useVerificationStore } from "../../lib/stores/verificationStore";

const UploadIDPage = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { idPreview, setIdFile } = useVerificationStore();

  const handleRescan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setIdFile(file, preview);
  };

  const handleUpload = async () => {
    // Replace with your actual API call
    // await fetch("/api/verify/id", { method: "POST", body: formData });
    router.push("/verification/pending");
  };

  return (
    <VerificationLayout>
      <h1 className="text-2xl font-bold font-heading text-black mt-10 mb-8">Upload ID</h1>

      {/* ID Image Preview */}
      <div className="w-full max-w-lg mb-8">
        {idPreview ? (
          <img
            src={idPreview}
            alt="ID Document"
            className="w-full rounded-2xl object-cover shadow-md"
          />
        ) : (
          <div className="w-full h-56 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 text-sm">
            No ID uploaded yet
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="w-[20%] max-w-lg flex flex-col gap-3">
        <button
          onClick={handleUpload}
          className="w-full bg-green-500 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
        >
          <Upload size={18} />
          Upload Document
        </button>

        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleRescan} />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-[#E05C5C] text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#d04f4f] transition-colors"
        >
          <ScanLine size={18} />
          Rescan Document
        </button>
      </div>
    </VerificationLayout>
  );
};

export default UploadIDPage;