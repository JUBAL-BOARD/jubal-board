"use client";
import { useState } from "react";
import { X, Loader2, Users } from "lucide-react";

interface InviteToCollaborateModalProps {
  onClose: () => void;
  onSubmit: (email: string, message: string) => Promise<void>;
  projectTitle: string;
  submitting: boolean;
}

export default function InviteToCollaborateModal({
  onClose,
  onSubmit,
  projectTitle,
  submitting,
}: InviteToCollaborateModalProps) {
  const inputClass =
    "w-full border border-gray-200 rounded-lg px-3.5 py-[11px] text-[13px] text-black outline-none bg-white box-border";
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl px-10 py-10 w-[80%] lg:w-[460px] flex flex-col items-center text-center shadow-2xl">
        <div className="flex items-center justify-between w-full mb-6">
          <div className="w-6" />
          <h1 className="text-black text-xl font-bold">Invite to Collaborate</h1>
          <button onClick={onClose} className="text-black hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <div className="w-16 h-16 rounded-full bg-[#e84545]/10 flex items-center justify-center mb-4">
          <Users size={30} className="text-[#e84545]" />
        </div>
        <div className="bg-[#fafafa] p-5 mb-4 text-center w-full rounded-lg">
          <h2 className="text-base font-bold text-black mb-1">{projectTitle}</h2>
          <p className="text-xs text-gray-500">Invite a collaborator to join this project</p>
        </div>
        <div className="w-full mb-3 text-left">
          <label className="text-xs font-semibold text-black mb-1 block">Collaborator Email</label>
          <input
            type="email"
            value={email}
            placeholder="Enter email address"
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="w-full mb-5 text-left">
          <label className="text-xs font-semibold text-black mb-1 block">Message (optional)</label>
          <textarea
            value={message}
            placeholder="Add a personal message..."
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className={`${inputClass} resize-y leading-relaxed`}
          />
        </div>
        <button
          onClick={() => onSubmit(email, message)}
          disabled={submitting || !email.trim()}
          className="bg-[#E2554F] border-none rounded-lg px-8 py-2.5 cursor-pointer text-white font-semibold text-sm hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          Send Invite
        </button>
      </div>
    </div>
  );
}