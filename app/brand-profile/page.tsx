"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "../assets/logo.png";
import { Camera, User, MapPin, Upload, ChevronDown, Check, BadgeCheck } from "lucide-react";

const categories = [
  "Graphics Designer", "Illustrators", "UI/UX Designers",
  "Motion Designers", "Photographers", "3D Artists",
  "Photo Editors/Retouchers", "Video Editors",
  "Cinematographers", "Visual Brand Stategists",
];

const industries  = ["Technology", "Fashion", "Music", "Film", "Architecture", "Food & Culinary", "Health", "Education"];
const languages   = ["English", "French", "Spanish", "Arabic", "Yoruba"];
const commOptions = ["Chat only", "Email only", "Chat & Email", "Phone & Chat"];
const currencies  = ["Dollars ($)", "Euros (€)", "Pounds (£)", "Naira (₦)"];
const budgetRanges = ["$100-$200", "$200-$500", "$500-$1000", "$1000-$5000", "$5000+"];
const rateTypes   = ["Hourly", "Project-Based", "Retainer", "Per Deliverable"];

const reqStar = <span className="text-[#E2554F]"> *</span>;
const inputClass = "w-full border border-gray-200 rounded-lg px-3.5 py-[11px] text-[13px] text-black outline-none bg-white box-border";
const labelClass = "text-[13px] font-semibold text-black block mb-1.5";

// ── Select Field ────────────────────────────────────────────────────────────
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

// ── Main Page ───────────────────────────────────────────────────────────────
const BrandProfile: React.FC = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [brandLogo, setBrandLogo] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["Graphics Designer"]);

  const [form, setForm] = useState({
    businessName: "", contactNumber: "", country: "",
    streetAddress: "", websiteLinks: "",
    registrationNumber: "", taxId: "",
    description: "", postalCode: "",
    language: "English", communication: "Chat only",
    industry: "", currency: "Dollars ($)",
    budgetRange: "$100-$200", rateType: "",
  });

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const toggleCategory = (cat: string) =>
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setBrandLogo(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen w-screen pb-5 bg-white font-sans">

      {/* Congratulations Modal */}
      {showModal && (
        <CongratulationsModal onGoToDashboard={() => router.push("/client/dashboard")} />
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
        Build Your Space
      </h1>

      {/* Card */}
      <div className="max-w-[760px] mx-auto mb-[60px] bg-[#fafafa] rounded-2xl px-12 py-10 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">

        {/* Logo Upload */}
        <div className="flex flex-col items-center mb-9">
          <div className="relative mb-2.5">
            <div className="w-[90px] h-[90px] rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
              {brandLogo
                ? <img src={brandLogo} alt="logo" className="w-full h-full object-cover" />
                : <User size={48} fill="#1a1a2e" stroke="none" />
              }
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0.5 right-0.5 w-7 h-7 rounded-full border-2 border-white cursor-pointer flex items-center justify-center"
            >
              <Camera size={18} stroke="black" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
            />
          </div>
          <p className="m-0 text-[13px] text-gray-500">Add your Logo</p>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-5">

          {/* Business Name */}
          <div>
            <label className={labelClass}>Business Name{reqStar}</label>
            <input value={form.businessName} onChange={(e) => update("businessName", e.target.value)}
              placeholder="Type here" className={inputClass} />
          </div>

          {/* Contact + Country */}
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

          {/* Business Website */}
          <div>
            <label className={labelClass}>Business Website/Social Link(s){reqStar}</label>
            <input value={form.websiteLinks} onChange={(e) => update("websiteLinks", e.target.value)}
              placeholder="Type here" className={inputClass} />
          </div>

          {/* Registration Number + Tax ID */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Business Registration Number{reqStar}</label>
              <input value={form.registrationNumber} onChange={(e) => update("registrationNumber", e.target.value)}
                placeholder="Type here" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Tax ID{reqStar}</label>
              <input value={form.taxId} onChange={(e) => update("taxId", e.target.value)}
                placeholder="Type here" className={inputClass} />
            </div>
          </div>

          {/* Attach Document + Industry */}
          <div className="grid grid-cols-2 gap-4 items-end">
            <div>
              <label className={labelClass}>Attach Document</label>
              <button className="flex items-center gap-2 bg-[#E2554F] border-none rounded-lg px-5 py-2.5 cursor-pointer text-white font-semibold text-[13px] hover:bg-[#d44a44] transition-colors">
                <Upload size={16} stroke="white" /> Upload
              </button>
            </div>
            <SelectField
              label="Select your Industry/Sector"
              value={form.industry}
              onChange={(v) => update("industry", v)}
              options={industries}
              placeholder="Select industry"
            />
          </div>

          {/* Describe brand */}
          <div>
            <label className={labelClass}>Describe what makes your brand unique{reqStar}</label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={4}
              className={`${inputClass} resize-y leading-relaxed`}
            />
          </div>

          {/* Postal Code + Language */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Postal Code</label>
              <input value={form.postalCode} onChange={(e) => update("postalCode", e.target.value)}
                placeholder="Type here" className={inputClass} />
            </div>
            <SelectField label="Language Preference" value={form.language}
              onChange={(v) => update("language", v)} options={languages} />
          </div>

          {/* Preferred Communication — half width */}
          <div className="grid grid-cols-2 gap-4">
            <SelectField label="Preferred Communication" value={form.communication}
              onChange={(v) => update("communication", v)} options={commOptions} />
            <div />
          </div>

          {/* Categories */}
          <div>
            <label className={labelClass}>Pick Categories where your business shines{reqStar}</label>
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

export default BrandProfile;