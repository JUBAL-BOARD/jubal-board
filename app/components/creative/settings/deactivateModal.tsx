"use client";
import { TriangleAlert, XCircle } from "lucide-react";

const DeactivateModal: React.FC<{ onGoToDashboard: () => void }> = ({ onGoToDashboard }) => (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl px-12 py-10 w-[80%] lg:w-[450px] flex flex-col items-center text-center shadow-2xl">
            <div className="w-[90px] h-[90px] rounded-full bg-[#E85D3A] flex items-center justify-center mb-5">
                <TriangleAlert size={52} fill="white" stroke="#E85D3A" />
            </div>
            <h2 className="text-[22px] font-bold text-black m-0 mb-1">
                Deactivate Account
            </h2>
            <p className="text-[14px] text-gray-600 m-0 mb-7 leading-relaxed max-w-[260px]">
                If you deactivate your account, you won't be able to log in or access  your projects until you reactivate it. Your profile will be hidden from clients
            </p>
            <div className="flex gap-8">
                <button
                    onClick={onGoToDashboard}
                    className="flex items-center gap-2 bg-[#1a1a2e] border-none rounded-lg px-7 py-3 cursor-pointer text-white font-semibold text-[14px] hover:opacity-90 transition-opacity"
                >
                    <XCircle size={16} stroke="white" /> Cancel
                </button>
                <button
                    className="bg-[#E85D3A] border-none rounded-lg px-8 py-2.5 cursor-pointer text-white font-semibold text-xs lg:text-[14px] hover:bg-red-600 transition-colors"
                >
                    Deactivate Account
                </button>
            </div>
        </div>
    </div>
);

export default DeactivateModal;