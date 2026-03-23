"use client";

import { useState } from "react";
import Image from "next/image";
import logo from "../assets/icononly.png";

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    // TODO: hook up to backend
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
      <div className="bg-white rounded-2xl px-14 py-16 w-full max-w-md flex flex-col items-center">

        {/* Logo */}
        <div className="mb-6">
          <Image
            src={logo}
            width={100}
            height={100}
            alt="Jubal Board"
            className="object-contain"
          />
        </div>

        {!sent ? (
          <>
            {/* Heading */}
            <h1 className="text-2xl font-bold text-[#1a1a2e] text-center mb-2">
              Can&apos;t Log In? No Stress
            </h1>
            <p className="text-sm text-gray-500 text-center mb-8 leading-relaxed">
              Drop your email, and we&apos;ll help you bounce right back.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-300 transition-all"
              />
              <button
                type="submit"
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-colors text-sm"
              >
                Send Me the Link
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-[#1a1a2e] text-center mb-2">
              Check your inbox!
            </h1>
            <p className="text-sm text-gray-500 text-center leading-relaxed">
              We sent a reset link to <span className="font-medium text-gray-700">{email}</span>. Check your email and follow the instructions.
            </p>
          </>
        )}

      </div>
    </div>
  );
};

export default ForgotPasswordPage;