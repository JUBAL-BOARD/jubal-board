"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "../assets/logo.png";
import {
  Camera, User, Calendar, MapPin, Upload, ChevronDown, Check, BadgeCheck,
} from "lucide-react";

const categories = [
  "Graphics Designer", "Illustrators", "UI/UX Designers",
  "Motion Designers", "Photographers", "3D Artists",
  "Photo Editors/Retouchers", "Video Editors",
  "Cinematographers", "Visual Brand Stategists",
];

const languages   = ["English", "French", "Spanish", "Arabic", "Yoruba"];
const commOptions = ["Chat only", "Email only", "Chat & Email", "Phone & Chat"];
const roles       = ["Graphic Designer", "Photographer", "Videographer", "Illustrator", "3D Artist", "Content Creator"];
const currencies  = ["Dollars ($)", "Euros (€)", "Pounds (£)", "Naira (₦)"];
const budgetRanges = ["$100-$200", "$200-$500", "$500-$1000", "$1000-$5000", "$5000+"];
const rateTypes   = ["Hourly", "Project-Based", "Retainer", "Per Deliverable"];

const reqStar = <span className="text-[#E2554F]"> *</span>;

const inputClass = "w-full border border-gray-200 rounded-lg px-3.5 py-[11px] text-[13px] text-black outline-none bg-white box-border";
const labelClass = "text-[13px] font-semibold text-black block mb-1.5";

// ── Reusable SelectField ──────────────────────────────────────────────────
const SelectField = ({
  label, value, onChange, options, placeholder,
}: {
  label: string; value: string;
  onChange: (v: string) => void;
  options: string[]; placeholder?: string;
}) => (
  <div>
    <label className={labelClass}>{label}{reqStar}</label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} appearance-none pr-9 cursor-pointer`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <ChevronDown size={14} stroke="#6B7280" />
      </div>
    </div>
  </div>
);

// ── Congratulations Modal ───────────────────────────────────────────────────
const CongratulationsModal: React.FC<{ onGoToDashboard: () => void }> = ({ onGoToDashboard }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl px-12 py-10 w-[80%] lg:w-[420px] flex flex-col items-center text-center shadow-2xl">

      {/* Icon */}
      <div className="w-[90px] h-[90px] rounded-full bg-[#2563EB] flex items-center justify-center mb-5">
        <BadgeCheck size={52} fill="white" stroke="#2563EB" />
      </div>

      {/* Text */}
      <h2 className="text-[22px] font-bold text-[#2563EB] m-0 mb-1">
        Congratulations!
      </h2>
      <p className="text-[16px] font-semibold text-[#2563EB] m-0 mb-3">
        Your profile is complete
      </p>
      <p className="text-[14px] text-gray-600 m-0 mb-7 leading-relaxed max-w-[260px]">
        You can now post projects and connect with the right creatives.
      </p>

      {/* Button */}
      <button
        onClick={onGoToDashboard}
        className="bg-[#2563EB] border-none rounded-lg px-8 py-2.5 cursor-pointer text-white font-semibold text-xs lg:text-[14px] hover:bg-blue-700 transition-colors"
      >
        Go to Dashboard
      </button>

    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────
const TellUsAboutYou: React.FC = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["Graphics Designer"]);

  const [form, setForm] = useState({
    fullName: "", dob: "", contactNumber: "",
    country: "", streetAddress: "", socialLinks: "",
    description: "", postalCode: "", language: "English",
    communication: "Chat only", professionalRole: "",
    currency: "Dollars ($)", budgetRange: "$100-$200", rateType: "",
  });

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleCategory = (cat: string) =>
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen w-screen pb-5 bg-white font-sans">

      {/* Congratulations Modal */}
      {showModal && (
        <CongratulationsModal onGoToDashboard={() => router.push("/creative/dashboard")} />
      )}


      {/* Navbar */}
      <div className="flex items-center gap-2.5 px-[42px] bg-[#fafafa] h-[100px] border-b border-gray-200">
        <Image
          src={logo}
          alt="Jubal Board logo"
          width={120}
          height={120}
          className="object-contain"
        />
      </div>

      {/* Page Title */}
      <h1 className="text-center text-[28px] font-black text-[#1a1a2e] mt-9 mb-6">
        Tell us about you
      </h1>

      {/* Card */}
      <div className="max-w-[760px] mx-auto mb-[60px] bg-[#fafafa] rounded-2xl px-12 py-10 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">

        {/* Avatar */}
        <div className="flex flex-col items-center mb-9">
          <div className="relative mb-2.5">
            <div className="w-[90px] h-[90px] rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
              {avatar
                ? <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                : <User size={48} fill="#1a1a2e" stroke="none" />
              }
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0.5 right-0.5 w-7 h-7 rounded-full bg-transparent border-2 border-white cursor-pointer flex items-center justify-center"
            >
              <Camera size={18} stroke="black" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          <p className="m-0 text-[13px] text-gray-500">Add your photo</p>
        </div>

        {/* Form fields */}
        <div className="flex flex-col gap-5">

          {/* Row 1 — Full Name + DOB */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Full Name{reqStar}</label>
              <input value={form.fullName} onChange={(e) => update("fullName", e.target.value)}
                placeholder="Type here" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Date of Birth{reqStar}</label>
              <div className="relative">
                <input type="date" value={form.dob} onChange={(e) => update("dob", e.target.value)}
                  className={`${inputClass} pr-9`} />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Calendar size={16} stroke="#9CA3AF" />
                </div>
              </div>
            </div>
          </div>

          {/* Row 2 — Contact + Country */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Contact Number{reqStar}</label>
              <input value={form.contactNumber} onChange={(e) => update("contactNumber", e.target.value)}
                placeholder="Type here" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Country/State{reqStar}</label>
              <div className="relative">
                <input value={form.country} onChange={(e) => update("country", e.target.value)}
                  placeholder="Type here" className={`${inputClass} pr-9`} />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  <MapPin size={16} stroke="#9CA3AF" />
                </div>
              </div>
            </div>
          </div>

          {/* Street Address */}
          <div>
            <label className={labelClass}>Street Address{reqStar}</label>
            <input value={form.streetAddress} onChange={(e) => update("streetAddress", e.target.value)}
              placeholder="Type your street address" className={inputClass} />
          </div>

          {/* Social Links */}
          <div>
            <label className={labelClass}>Preferred Social Link(s){reqStar}</label>
            <input value={form.socialLinks} onChange={(e) => update("socialLinks", e.target.value)}
              placeholder="Type here" className={inputClass} />
          </div>

          {/* Describe yourself */}
          <div>
            <label className={labelClass}>Describe yourself in one line{reqStar}</label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={4}
              className={`${inputClass} resize-y leading-relaxed`}
            />
          </div>

          {/* Row — Postal Code + Language */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Postal Code{reqStar}</label>
              <input value={form.postalCode} onChange={(e) => update("postalCode", e.target.value)}
                placeholder="Type here" className={inputClass} />
            </div>
            <SelectField label="Language Preference" value={form.language}
              onChange={(v) => update("language", v)} options={languages} />
          </div>

          {/* Row — Communication + Professional Role */}
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Preferred Communication" value={form.communication}
              onChange={(v) => update("communication", v)} options={commOptions} />
            <SelectField label="What's your professional role?" value={form.professionalRole}
              onChange={(v) => update("professionalRole", v)}
              options={roles} placeholder="Select role" />
          </div>

          {/* Categories */}
          <div>
            <label className={labelClass}>Pick Categories where you shine{reqStar}</label>
            <div className="border border-gray-200 rounded-[10px] p-4 flex flex-wrap gap-2.5">
              {categories.map((cat) => {
                const selected = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-3.5 py-[7px] rounded-md cursor-pointer border-none text-[13px] flex items-center gap-1.5 transition-all duration-150
                      ${selected
                        ? "bg-[#1a1a2e] text-white font-semibold"
                        : "bg-gray-100 text-gray-700 font-normal"
                      }`}
                  >
                    {selected && <Check size={12} stroke="white" strokeWidth={3} />}
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row — Upload portfolio + Currency */}
          <div className="grid grid-cols-2 gap-4 items-end">
            <div>
              <label className={labelClass}>Show off your best projects - photo, videos, links{reqStar}</label>
              <button className="flex items-center gap-2 bg-[#E2554F] border-none rounded-lg px-5 py-2.5 cursor-pointer text-white font-semibold text-[13px] hover:bg-[#d44a44] transition-colors">
                <Upload size={16} stroke="white" /> Upload
              </button>
            </div>
            <SelectField label="Select your currency" value={form.currency}
              onChange={(v) => update("currency", v)} options={currencies} />
          </div>

          {/* Row — Budget Range + Rate Type */}
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Set your range so clients know what you bring"
              value={form.budgetRange}
              onChange={(v) => update("budgetRange", v)}
              options={budgetRanges}
            />
            <SelectField
              label="Select your rate"
              value={form.rateType}
              onChange={(v) => update("rateType", v)}
              options={rateTypes}
              placeholder="Hourly, Project-Based or..."
            />
          </div>

        </div>

        {/* Save button */}
        <div className="flex justify-end mt-9">
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#E2554F] border-none rounded-lg px-12 py-3.5 cursor-pointer text-white font-bold text-[15px] hover:bg-[#d44a44] transition-colors"
          >
            Save
          </button>
        </div>

      </div>
    </div>
  );
};

export default TellUsAboutYou;