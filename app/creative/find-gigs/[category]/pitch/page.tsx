"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Sidebar from "@/app/components/creative/dashboard/sideBar";
import { BadgeCheck, X, Loader2 } from "lucide-react";
import DashboardTopbar from "@/app/components/creative/dashboard/dashboardTopbar";
import Breadcrumb from "@/app/components/creative/dashboard/breadcrumb";
import { useParams, useRouter } from "next/navigation";
import { useGigStore } from "../../../../lib/stores/gigStore";
import { useCreativeProfile } from "@/app/lib/hooks/useCreativeProfile";
import { useKycStatus } from "@/app/lib/hooks/useKycStatus";
import usePageReady from "@/app/lib/hooks/usePageReady";
import WithPageTransition from "@/app/components/shared/withPageTransition";
import FadeInSection from "@/app/components/shared/fadeInSection";

const StarIcon = () => (
  <svg viewBox="0 0 20 20" fill="#F5A623" className="w-4 h-4">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const ChevronDown = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-400">
    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
  </svg>
);

const timelineOptions = ["Less than 24 hours", "1–2 days", "3–5 days", "1 week", "2 weeks"];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#fafafa] p-6 mb-4 border border-gray-100">
      <h2 className="text-base font-bold text-[#1c1c3a] mb-4">{title}</h2>
      {children}
    </div>
  );
}

const CongratulationsModal: React.FC<{ onGoToDashboard: () => void }> = ({ onGoToDashboard }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-[#5ea85bff] rounded-2xl px-12 py-10 w-[80%] lg:w-[420px] flex flex-col items-center text-center shadow-2xl">
      <div className="w-[90px] h-[90px] rounded-full bg-white flex items-center justify-center mb-5">
        <BadgeCheck size={52} fill="white" stroke="#5ea85bff" />
      </div>
      <h2 className="text-[22px] font-bold text-white m-0 mb-1">Pitch Submitted</h2>
      <p className="text-[14px] text-white m-0 mb-7 leading-relaxed max-w-[260px]">
        Fingers crossed - the client is checking it out!
      </p>
      <button
        onClick={onGoToDashboard}
        className="bg-white border-none rounded-lg px-8 py-2.5 cursor-pointer text-black font-semibold text-xs lg:text-[14px] hover:bg-black hover:text-white transition-colors"
      >
        Go to My Pitches
      </button>
    </div>
  </div>
);

type Milestone = {
  title: string;
  description: string;
  amount: string;
  dueDate: string;
  notes: string;
};

const emptyMilestone = (): Milestone => ({
  title: "",
  description: "",
  amount: "",
  dueDate: "",
  notes: "",
});

function formatDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function todayString() {
  return new Date().toISOString().split("T")[0];
}

export default function MyPitchPage() {
  const params = useParams();
  const category = decodeURIComponent(params.category as string);
  const router = useRouter();
  const gig = useGigStore((s) => s.selectedGig);

  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [coverNote, setCoverNote] = useState("");
  const [bookingFeeAmount, setBookingFeeAmount] = useState("");
  const [timeline, setTimeline] = useState("Less than 24 hours");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [proposedAmount, setProposedAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState<"MILESTONE" | "END_OF_PROJECT">("END_OF_PROJECT");
  const [isCollaborative, setIsCollaborative] = useState(false);
  const [milestones, setMilestones] = useState<Milestone[]>([emptyMilestone()]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { profile, loading: profileLoading } = useCreativeProfile();
  const { kycStatus } = useKycStatus();

  const isReady = usePageReady(profileLoading);

  useEffect(() => {
    if (!gig) router.replace("/creative/find-gigs");
  }, [gig]);

  if (!gig) return null;

  const briefRows = [
    { label: "Job Title", value: gig.title },
    { label: "Project Category", value: gig.category },
    { label: "Specific Skill(s)", value: gig.skills ?? "—" },
    { label: "Job Description", value: gig.description },
    { label: "Set your Budget", value: gig.budget },
    { label: "Attach Reference File", value: gig.referenceFile ?? "None", isFile: !!gig.referenceFile },
    { label: "Timeline", value: gig.timeline },
    { label: "Delivery Date", value: formatDate(gig.deliveryDate ?? "") },
  ];

  const updateMilestone = (index: number, field: keyof Milestone, value: string) => {
    setMilestones((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  };

  const addMilestone = () => setMilestones((prev) => [...prev, emptyMilestone()]);
  const removeMilestone = (index: number) =>
    setMilestones((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    setError(null);

    if (!coverNote.trim()) return setError("Please write a cover note.");
    if (!proposedAmount) return setError("Please enter your proposed amount.");
    if (!deliveryDate) return setError("Please set a delivery date.");
    if (!bookingFeeAmount || Number(bookingFeeAmount) < 1) return setError("Please enter a booking fee amount (minimum 1).");
    if (deliveryDate < todayString()) return setError("Delivery date cannot be in the past.");
    if (paymentMode === "MILESTONE" && milestones.some((m) => !m.title || !m.amount || !m.dueDate)) {
      return setError("Please fill in all milestone fields (title, amount, due date).");
    }
    if (paymentMode === "MILESTONE") {
      const totalPercentage = milestones.reduce((sum, m) => sum + Number(m.amount), 0);
      if (totalPercentage !== 100) return setError(`Milestone percentages must add up to 100%. Current total: ${totalPercentage}%`);
    }

    setSubmitting(true);
    try {
      const tokenRes = await fetch("/api/auth/session/token");
      const { token } = await tokenRes.json();

      const body: any = {
        briefId: gig.id,
        coverNote,
        proposedAmount: parseFloat(proposedAmount),
        currency: gig.currency ?? "USD",
        deliveryDate,
        paymentMode,
        bookingFeeAmount: parseFloat(bookingFeeAmount),
        bookingPercentage: 0,
        installmentFrequency: "MONTHLY",
        installmentPeriod: 1,
        paymentCompletionMode: "END_OF_PROJECT",
        isCollaborative,
        milestones: paymentMode === "MILESTONE"
          ? milestones.map((m) => ({
            title: m.title,
            description: m.description,
            percentage: parseFloat(m.amount),
            dueDate: m.dueDate,
            notes: m.notes,
          }))
          : [],
      };

      const res = await fetch(`/api/v1/pitches`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message ?? "Failed to submit pitch.");
      }

      setShowModal(true);
    } catch (e: any) {
      setError(e.message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const userName = profile?.fullName || "Creative";
  const userAvatar =
    profile?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=1a1a2e&color=fff&size=128`;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {showModal && (
        <CongratulationsModal onGoToDashboard={() => router.push("/creative/my-pitches")} />
      )}

      <DashboardTopbar
        userName={userName}
        userAvatar={userAvatar}
        sidebarOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex flex-1">
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        <div
          className={`
            fixed top-0 left-0 h-full z-40
            transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-10
          `}
        >
          <button className="absolute top-4 right-4 z-50 lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={22} />
          </button>
          <Sidebar activeItem="Find Gigs" />
        </div>

        <main className="flex-1 w-full px-4 lg:px-7 py-6 overflow-y-auto">
          <WithPageTransition isReady={isReady} variant="pitches">
            <>
              <FadeInSection delay={0}>
                <Breadcrumb crumbs={[
                  { label: "Dashboard", path: "/creative/dashboard" },
                  { label: "Find Gigs", path: "/creative/find-gigs" },
                  { label: category },
                ]} />
                <h1 className="text-2xl font-bold text-gray-900 mb-5">My Pitch: {gig.title}</h1>
              </FadeInSection>

              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4 flex items-center justify-between">
                  {error}
                  <button onClick={() => setError(null)}><X size={14} /></button>
                </div>
              )}

              {/* Profile card */}
              <FadeInSection delay={80}>
                <div className="bg-[#fafafa] p-6 mb-4 border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0">
                        <Image
                          src={userAvatar}
                          alt={userName}
                          width={64}
                          height={64}
                          className="rounded-full object-cover"
                        />
                        <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-black text-lg">{userName}</p>
                        <p className="text-sm text-green-500 font-medium mt-0.5">● Online</p>
                        <p className="text-sm text-black mt-2">Verification Status:</p>
                        <span className={`inline-block mt-1 p-2 text-white text-xs font-semibold ${
                          kycStatus === "PROVIDER_APPROVED" ? "bg-green-600" :
                          kycStatus === "PENDING" ? "bg-yellow-500" : "bg-gray-400"
                        }`}>
                          {kycStatus === "PROVIDER_APPROVED" ? "Verified" :
                            kycStatus === "PENDING" ? "Pending" : "Unverified"}
                        </span>
                      </div>
                    </div>
                    {gig.isPremium && (
                      <span className="px-4 py-1.5 bg-orange-500 text-white text-xs font-semibold rounded-md">Premium</span>
                    )}
                  </div>
                  <div className="flex items-center gap-8 mt-4 pt-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <StarIcon />
                      <span className="font-medium text-black">5.0</span>
                      <span className="text-black">(35 Reviews)</span>
                    </div>
                    <div>
                      <span className="font-medium text-black">12</span>{" "}
                      <span className="text-black">Completed Projects</span>
                    </div>
                    <div>
                      <span className="font-medium text-black">100%</span>{" "}
                      <span className="text-black">Job Success</span>
                    </div>
                  </div>
                </div>
              </FadeInSection>

              {/* Brief Summary */}
              <FadeInSection delay={160}>
                <Section title="Brief Summary">
                  <table className="w-full text-sm">
                    <tbody>
                      {briefRows.map((row) => (
                        <tr key={row.label} className="border-b border-gray-50 last:border-0">
                          <td className="py-3 pr-6 text-black font-medium w-44 align-top">{row.label}</td>
                          <td className="py-3 text-black">
                            {row.isFile ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 border border-orange-200 text-orange-500 rounded text-xs font-medium">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                </svg>
                                {row.value}
                              </span>
                            ) : (
                              row.value
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Section>
              </FadeInSection>

              {/* About the client */}
              <FadeInSection delay={0}>
                <Section title="About the client">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Image
                        src={gig.postedBy.avatar}
                        alt={gig.postedBy.name}
                        width={56}
                        height={56}
                        className="rounded-full object-cover"
                      />
                      <div className="text-sm text-black">
                        <p className="font-semibold text-black text-base mb-1">{gig.postedBy.name}</p>
                        <p><span className="text-black">Language: </span>{gig.postedBy.language ?? "English"}</p>
                        <p><span className="text-black">Preferred Communication: </span>{gig.postedBy.communication ?? "Chat only"}</p>
                      </div>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#e84545] text-white text-sm font-medium rounded-lg hover:bg-[#d03535] transition-colors">
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z" clipRule="evenodd" />
                      </svg>
                      Chat Client
                    </button>
                  </div>
                </Section>
              </FadeInSection>

              {/* Cover Note */}
              <FadeInSection delay={0}>
                <Section title="Cover Note">
                  <textarea
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    placeholder="Give the client your take: the idea, the vibe, and how you'll execute it"
                    className="w-full h-32 px-4 py-3 text-sm bg-white text-black placeholder-grey-800 border border-black rounded-lg resize-none focus:outline-none focus:ring-2 focus:border-[#e84545]/40 transition-all"
                  />
                </Section>
              </FadeInSection>

              {/* Deliverables */}
              <FadeInSection delay={0}>
                <Section title="Deliverables">
                  {gig.deliverables && gig.deliverables.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {gig.deliverables.map((d) => (
                        <span key={d} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-black bg-white">
                          {d}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No deliverables specified by the client.</p>
                  )}
                </Section>
              </FadeInSection>

              {/* Payment Settings */}
              <FadeInSection delay={0}>
                <Section title="Payment Settings">
                  <div className="flex flex-col gap-5">
                    <div>
                      <label className="block text-xs text-gray-500 font-medium mb-2">Payment Mode</label>
                      <div className="flex gap-3">
                        {([
                          { value: "END_OF_PROJECT", label: "End of Project" },
                          { value: "MILESTONE", label: "Milestone" },
                        ] as const).map((mode) => (
                          <button
                            key={mode.value}
                            type="button"
                            onClick={() => setPaymentMode(mode.value)}
                            className={`px-5 py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
                              paymentMode === mode.value
                                ? "bg-[#e84545] text-white border-[#e84545]"
                                : "bg-white text-gray-600 border-gray-200 hover:border-[#e84545]"
                            }`}
                          >
                            {mode.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-black">Collaborative Project</p>
                        <p className="text-xs text-black mt-0.5">Are you working with other creatives on this?</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsCollaborative((prev) => !prev)}
                        className={`relative flex-shrink-0 w-11 h-6 rounded-full cursor-pointer transition-colors duration-200 ${isCollaborative ? "bg-[#E2554F]" : "bg-gray-300"}`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isCollaborative ? "translate-x-1" : "translate-x-[-18px]"}`}
                        />
                      </button>
                    </div>
                  </div>
                </Section>
              </FadeInSection>

              {/* Pricing */}
              <FadeInSection delay={0}>
                <Section title="Pricing">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-black font-medium">{gig.currency ?? "USD"}</span>
                      <input
                        type="number"
                        value={proposedAmount}
                        onChange={(e) => setProposedAmount(e.target.value)}
                        placeholder="Enter your proposed amount"
                        min={0}
                        className="flex-1 px-4 py-2.5 text-sm text-black border border-black rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#e84545]/20"
                      />
                    </div>
                    <p className="text-xs text-black mt-1.5">Client's budget: {gig.budget}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-sm text-black font-medium">{gig.currency ?? "USD"}</span>
                    <input
                      type="number"
                      value={bookingFeeAmount}
                      onChange={(e) => setBookingFeeAmount(e.target.value)}
                      placeholder="Enter booking fee amount (min. 1)"
                      min={1}
                      className="flex-1 px-4 py-2.5 text-sm text-black border border-black rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#e84545]/20"
                    />
                  </div>
                  <p className="text-xs text-black mt-1.5">Booking fee charged upfront before work begins.</p>
                </Section>
              </FadeInSection>

              {/* Delivery Schedule */}
              <FadeInSection delay={0}>
                <Section title="Delivery Schedule">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-black font-medium mb-1.5">Timeline</label>
                      <div className="relative">
                        <select
                          value={timeline}
                          onChange={(e) => setTimeline(e.target.value)}
                          className="w-full appearance-none px-3 py-2.5 text-sm text-black border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#e84545]/20 pr-8 cursor-pointer"
                        >
                          {timelineOptions.map((o) => <option key={o}>{o}</option>)}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                          <ChevronDown />
                        </div>
                      </div>
                      {gig.timeline && (
                        <p className="text-xs text-black mt-1.5">Client expects: {gig.timeline}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs text-black font-medium mb-1.5">Delivery Date</label>
                      <div className="relative">
                        <input
                          type="date"
                          value={deliveryDate}
                          min={todayString()}
                          onChange={(e) => setDeliveryDate(e.target.value)}
                          className="w-full px-3 py-2.5 text-sm text-black border border-black rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#e84545]/20 pr-9"
                        />
                        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                          <CalendarIcon />
                        </div>
                      </div>
                      {gig.deliveryDate && (
                        <p className="text-xs text-gray-400 mt-1.5">Client's deadline: {formatDate(gig.deliveryDate)}</p>
                      )}
                    </div>
                  </div>
                </Section>
              </FadeInSection>

              {/* Milestones */}
              {paymentMode === "MILESTONE" && (
                <FadeInSection delay={0}>
                  <Section title="Milestones">
                    <div className="flex flex-col gap-5">
                      {milestones.map((m, i) => (
                        <div key={i} className="border border-gray-100 rounded-xl p-4 bg-white relative">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-semibold text-black">Milestone {i + 1}</p>
                            {milestones.length > 1 && (
                              <button onClick={() => removeMilestone(i)} className="text-red-400 hover:text-red-600 text-xs">
                                Remove
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs text-black mb-1">Title *</label>
                              <input
                                value={m.title}
                                onChange={(e) => updateMilestone(i, "title", e.target.value)}
                                placeholder="e.g. Initial Design Draft"
                                className="w-full px-3 py-2 text-sm text-black border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e84545]/20"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-black mb-1">Percentage (%) *</label>
                              <input
                                type="number"
                                value={m.amount}
                                onChange={(e) => updateMilestone(i, "amount", e.target.value)}
                                placeholder="e.g. 30"
                                min={1}
                                max={100}
                                className="w-full px-3 py-2 text-sm text-black border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e84545]/20"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-black mb-1">Due Date *</label>
                              <input
                                type="date"
                                value={m.dueDate}
                                min={todayString()}
                                onChange={(e) => updateMilestone(i, "dueDate", e.target.value)}
                                className="w-full px-3 py-2 text-sm text-black border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e84545]/20"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-black mb-1">Description</label>
                              <input
                                value={m.description}
                                onChange={(e) => updateMilestone(i, "description", e.target.value)}
                                placeholder="What gets delivered"
                                className="w-full px-3 py-2 text-sm text-black border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e84545]/20"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs text-black mb-1">Notes</label>
                              <input
                                value={m.notes}
                                onChange={(e) => updateMilestone(i, "notes", e.target.value)}
                                placeholder="Any additional notes"
                                className="w-full px-3 py-2 text-sm text-black border border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e84545]/20"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      <button onClick={addMilestone} className="text-sm text-[#e84545] font-semibold hover:underline text-left">
                        + Add another milestone
                      </button>
                    </div>
                  </Section>
                </FadeInSection>
              )}

              {/* Actions */}
              <FadeInSection delay={0}>
                <div className="flex justify-end gap-3 mt-6 pb-10">
                  <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#1c1c3a] text-white text-sm font-medium rounded-lg hover:bg-[#2a2a50] transition-colors"
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#e84545] text-white text-sm font-medium rounded-lg hover:bg-[#d03535] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting && <Loader2 size={14} className="animate-spin" />}
                    {submitting ? "Submitting..." : "Send Now"}
                  </button>
                </div>
              </FadeInSection>
            </>
          </WithPageTransition>
        </main>
      </div>
    </div>
  );
}