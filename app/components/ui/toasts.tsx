import toast from "react-hot-toast";
import { Check } from "lucide-react";

// ✅ Toast 1 — Add Fund Success
export const showFundAddedToast = () => {
  toast.custom(
    (t) => (
      <div
        className={`flex items-center gap-3 bg-green-100 border border-green-100 rounded-xl px-4 py-3 shadow-sm max-w-sm transition-all ${
          t.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
        }`}
      >
        <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center shrink-0">
          <Check size={18} strokeWidth={3} className="text-white" />
        </div>
        <p className="text-sm text-gray-700 leading-snug">
          Your fund has been successfully added and your wallet credited.
        </p>
      </div>
    ),
    { duration: 4000 }
  );
};

export const showFundWithdrawnToast = () => {
  toast.custom(
    (t) => (
      <div
        className={`flex items-center gap-3 bg-green-100 border border-green-100 rounded-xl px-4 py-3 shadow-sm max-w-sm transition-all ${
          t.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
        }`}
      >
        <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center shrink-0">
          <Check size={18} strokeWidth={3} className="text-white" />
        </div>
        <p className="text-sm text-gray-700 leading-snug">
          Your fund is still processing and you will receive it shortly.
        </p>
      </div>
    ),
    { duration: 4000 }
  );
};

export const showReviewCreativeToast = () => {
  toast.custom(
    (t) => (
      <div
        className={`flex items-center gap-3 bg-green-100 border border-green-100 rounded-xl px-4 py-3 shadow-sm max-w-sm transition-all ${
          t.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
        }`}
      >
        <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center shrink-0">
          <Check size={18} strokeWidth={3} className="text-white" />
        </div>
        <p className="text-sm text-gray-700 leading-snug">
          Your Review about the Creative has been successfully submitted.
        </p>
      </div>
    ),
    { duration: 4000 }
  );
};

export const showAddtoFavoriteToast = () => {
  toast.custom(
    (t) => (
      <div
        className={`flex items-center gap-3 bg-green-100 border border-green-100 rounded-xl px-4 py-3 shadow-sm max-w-sm transition-all ${
          t.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
        }`}
      >
        <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center shrink-0">
          <Check size={18} strokeWidth={3} className="text-white" />
        </div>
        <p className="text-sm text-gray-700 leading-snug">
          Natasha John has been successfully added to your favorite for multiple jobs.
        </p>
      </div>
    ),
    { duration: 4000 }
  );
};

export const showSendBriefToast = () => {
  toast.custom(
    (t) => (
      <div
        className={`flex items-center gap-3 bg-green-100 border border-green-100 rounded-xl px-4 py-3 shadow-sm max-w-sm transition-all ${
          t.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
        }`}
      >
        <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center shrink-0">
          <Check size={18} strokeWidth={3} className="text-white" />
        </div>
        <p className="text-sm text-gray-700 leading-snug">
          Your brief has been sent successfully to Natasha John. Wait for her pitch.
        </p>
      </div>
    ),
    { duration: 4000 }
  );
};

export const showPartiallyToast = () => {
  toast.custom(
    (t) => (
      <div
        className={`flex items-center gap-3 bg-green-100 border border-green-100 rounded-xl px-4 py-3 shadow-sm max-w-sm transition-all ${
          t.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
        }`}
      >
        <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center shrink-0">
          <Check size={18} strokeWidth={3} className="text-white" />
        </div>
        <p className="text-sm text-gray-700 leading-snug">
          You've selected Partially Completed, and the project status will be changed.
        </p>
      </div>
    ),
    { duration: 4000 }
  );
};

export const showRevisionToast = () => {
  toast.custom(
    (t) => (
      <div
        className={`flex items-center gap-3 bg-green-100 border border-green-100 rounded-xl px-4 py-3 shadow-sm max-w-sm transition-all ${
          t.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
        }`}
      >
        <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center shrink-0">
          <Check size={18} strokeWidth={3} className="text-white" />
        </div>
        <p className="text-sm text-gray-700 leading-snug">
          Your request has been successfully submitted. The Creative will be notified.
        </p>
      </div>
    ),
    { duration: 4000 }
  );
};


// ✅ Toast 2 — Collab Request Success
export const showCollabInviteToast = (name: string) => {
  toast.custom(
    (t) => (
      <div
        className={`flex items-center gap-3 bg-[#F0FAF0] border border-green-100 rounded-xl px-4 py-3 shadow-sm max-w-sm transition-all ${
          t.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
        }`}
      >
        <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center shrink-0">
          <Check size={18} strokeWidth={3} className="text-white" />
        </div>
        <p className="text-sm text-gray-700 leading-snug">
          You have successfully invited{" "}
          <span className="font-semibold">{name}</span> to collaborate. He will
          be notified.
        </p>
      </div>
    ),
    { duration: 4000 }
  );
};

// ❌ Toast 3 — Creative Not Available
export const showCreativeNotAvailableToast = () => {
  toast.custom(
    (t) => (
      <div
        className={`flex items-start gap-3 bg-white border-l-4 border-[#E05C5C] rounded-xl px-4 py-3 shadow-sm max-w-sm transition-all ${
          t.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
        }`}
      >
        <div className="w-9 h-9 rounded-full border-2 border-[#E05C5C] flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-[#E05C5C] text-lg leading-none">☹</span>
        </div>
        <div>
          <p className="text-[#E05C5C] font-bold text-sm mb-1">
            Creative Not Available
          </p>
          <p className="text-sm text-gray-600 leading-snug">
            The creative you selected is not available for a project at the
            moment. He is currently working on another project. You can select
            another creative.
          </p>
        </div>
      </div>
    ),
    { duration: 5000 }
  );
};

// ⚠️ Toast 4 — Low Capacity (with action buttons)
export const showLowCapacityToast = (
  onInvite: () => void,
  onNo: () => void
) => {
  toast.custom(
    (t) => (
      <div
        className={`flex items-start gap-3 bg-white border-l-4 border-[#E05C5C] rounded-xl px-4 py-4 shadow-sm max-w-sm transition-all ${
          t.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
        }`}
      >
        <div className="w-9 h-9 rounded-full border-2 border-[#E05C5C] flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-[#E05C5C] text-lg leading-none">☹</span>
        </div>
        <div className="flex-1">
          <p className="text-[#E05C5C] font-bold text-sm mb-1">Low Capacity</p>
          <p className="text-sm text-gray-600 leading-snug mb-4">
            This creative does not currently have the capacity to deliver on
            your project. Would you like to invite other qualified creatives to
            collaborate?
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { toast.dismiss(t.id); onInvite(); }}
              className="bg-[#E05C5C] text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-[#d04f4f] transition-colors"
            >
              Yes, Invite
            </button>
            <button
              onClick={() => { toast.dismiss(t.id); onNo(); }}
              className="bg-[#E05C5C] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#d04f4f] transition-colors"
            >
              No
            </button>
          </div>
        </div>
      </div>
    ),
    { duration: Infinity } // stays until user clicks a button
  );
};