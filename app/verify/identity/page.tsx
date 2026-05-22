"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, IdCard } from "lucide-react";
import VerificationLayout from "@/app/components/verification/verificationLayout";
import { useVerificationStore } from "../../lib/stores/verificationStore";

const ID_TYPES = [
  "National Identity card(NIN)",
  "Voter's Card",
  "Driver's License",
  "International Passport",
  "Others",
] as const;

const VerifyIdentityPage = () => {
  const router = useRouter();
  const selfieInputRef = useRef<HTMLInputElement>(null);
  const idInputRef = useRef<HTMLInputElement>(null);

  const { selfiePreview, idType, idPreview, setSelfie, setIdType, setIdFile } =
    useVerificationStore();

  const handleSelfieUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setSelfie(file, preview);
    router.push("/verify/photo");
  };

  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setIdFile(file, preview);
    router.push("/verify/id");
  };

  return (
    <VerificationLayout>
      <h1 className="text-3xl font-extrabold font-heading text-black mt-10 mb-10">Verify Identity</h1>

      {/* Take Selfie Card */}
      <div className="w-full max-w-3xl bg-gray-100 rounded-2xl p-8 mb-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-black font-body flex items-center justify-center gap-2">
            <Upload size={20} className="text-[#E05C5C]" />
            Take Selfie
          </h2>
          <p className="text-black font-body text-sm mt-2">
            Ensure you are in a well lit room and Make sure your face is clearly visible
          </p>
          {selfiePreview && (
            <img
              src={selfiePreview}
              alt="Selfie preview"
              className="w-24 h-24 rounded-full object-cover mx-auto mt-4 border-4 border-white shadow"
            />
          )}
        </div>
        <input ref={selfieInputRef} type="file" accept="image/*" className="hidden" onChange={handleSelfieUpload} />
        <div className="flex justify-around mt-4">
          <button
            onClick={() => selfieInputRef.current?.click()}
            className="text-[#E05C5C] font-medium text-sm hover:underline"
          >
            Take Selfie
          </button>
          <button
            onClick={() => selfieInputRef.current?.click()}
            className="text-[#E05C5C] font-medium text-sm hover:underline"
          >
            Upload Image
          </button>
        </div>
      </div>

      {/* Upload ID Card */}
      <div className="w-full max-w-3xl bg-gray-100 rounded-2xl p-8">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold font-heading text-black flex items-center justify-center gap-2">
            <IdCard size={20} className="text-[#E05C5C]" />
            Upload ID
          </h2>
          <p className="text-black font-body text-sm mt-2">
            Upload your means of identification, select the ID Type
          </p>
        </div>

        {/* ID Type Checkboxes */}
        <div className="flex flex-col gap-2 mb-6 max-w-xs mx-auto">
          {ID_TYPES.map((type) => (
            <label key={type} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={idType === type}
                onChange={() => setIdType(type)}
                className="w-4 h-4 accent-[#E05C5C] rounded"
              />
              <span className="text-sm text-black font-body">{type}</span>
            </label>
          ))}
        </div>

        {idPreview && (
          <img
            src={idPreview}
            alt="ID preview"
            className="w-48 h-32 object-cover rounded-lg mx-auto mb-4 shadow"
          />
        )}

        <input ref={idInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleIdUpload} />
        <div className="text-center">
          <button
            onClick={() => idInputRef.current?.click()}
            className="text-[#E05C5C] font-medium text-sm hover:underline"
          >
            Add Document
          </button>
        </div>
      </div>
    </VerificationLayout>
  );
};

export default VerifyIdentityPage;