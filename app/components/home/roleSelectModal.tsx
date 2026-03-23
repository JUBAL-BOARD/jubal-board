"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";

interface Props {
  onClose: () => void;
}

const RoleSelectModal: React.FC<Props> = ({ onClose }) => {
  const router = useRouter();

  const handleSelect = (role: "creative" | "client") => {
    onClose();
    router.push(`/signin/${role}`);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>

          {/* Heading */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#1a1a2e] mb-2">Welcome Back!</h2>
            <p className="text-sm text-gray-500">How would you like to log in?</p>
          </div>

          {/* Role cards */}
          <div className="grid grid-cols-2 gap-4">
            {/* Creative */}
            <button
              onClick={() => handleSelect("creative")}
              className="group flex flex-col items-center gap-3 border-2 border-gray-200 hover:border-red-500 rounded-xl p-6 transition-all duration-200 hover:bg-red-50"
            >
              <div className="w-16 h-16 rounded-full bg-red-100 group-hover:bg-red-200 flex items-center justify-center text-3xl transition-colors">
                🎨
              </div>
              <div className="text-center">
                <p className="font-bold text-[#1a1a2e] text-sm">I&apos;m a Creative</p>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">Find gigs, pitch clients & grow your career</p>
              </div>
            </button>

            {/* Client */}
            <button
              onClick={() => handleSelect("client")}
              className="group flex flex-col items-center gap-3 border-2 border-gray-200 hover:border-red-500 rounded-xl p-6 transition-all duration-200 hover:bg-red-50"
            >
              <div className="w-16 h-16 rounded-full bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center text-3xl transition-colors">
                💼
              </div>
              <div className="text-center">
                <p className="font-bold text-[#1a1a2e] text-sm">I&apos;m a Client</p>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">Post gigs & hire the best creative talent</p>
              </div>
            </button>
          </div>

          {/* Sign up link */}
          {/* <p className="text-center text-xs text-gray-400 mt-6">
            Don&apos;t have an account?{" "}
            <button
              onClick={() => { onClose(); router.push("/signup"); }}
              className="text-red-500 font-semibold hover:underline"
            >
              Sign up
            </button>
          </p> */}
        </div>
      </div>
    </>
  );
};

export default RoleSelectModal;